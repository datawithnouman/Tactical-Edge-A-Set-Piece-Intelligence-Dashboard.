"""FastAPI backend for the Set-Piece IQ dashboard."""
from __future__ import annotations

from pathlib import Path
from typing import List

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import schemas


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "set_piece_data.parquet"
REQUIRED_COLUMNS = {
    "event_id",
    "match_id",
    "team_name",
    "opponent_name",
    "event_type",
    "location_x",
    "location_y",
    "outcome",
    "is_goal",
    "is_shot",
    "player_name",
    "receiver_name",
    "end_location_x",
    "end_location_y",
}

app = FastAPI(title="Set-Piece IQ API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_dataset() -> pd.DataFrame:
    if not DATA_PATH.exists():
        return pd.DataFrame(columns=list(REQUIRED_COLUMNS))

    df = pd.read_parquet(DATA_PATH)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise RuntimeError(f"Dataset at {DATA_PATH} is missing columns: {missing}")
    return df


df = load_dataset()


def calculate_kpis(team_df: pd.DataFrame) -> schemas.KpiStats:
    corners = team_df[team_df["event_type"] == "Corner"]
    free_kicks = team_df[team_df["event_type"] == "Free Kick"]

    total_corners = int(corners.shape[0])
    corner_goals = int(corners["is_goal"].sum()) if total_corners else 0
    corner_goal_pct = (corner_goals / total_corners * 100) if total_corners else 0.0

    total_free_kicks = int(free_kicks.shape[0])
    fk_goals = int(free_kicks["is_goal"].sum()) if total_free_kicks else 0
    fk_goal_pct = (fk_goals / total_free_kicks * 100) if total_free_kicks else 0.0

    total_set_pieces = int(team_df.shape[0])
    total_goals = int(team_df["is_goal"].sum()) if total_set_pieces else 0
    total_shots = int(team_df["is_shot"].sum()) if total_set_pieces else 0

    return schemas.KpiStats(
        total_corners=total_corners,
        corner_goals=corner_goals,
        corner_goal_pct=round(corner_goal_pct, 2),
        total_free_kicks=total_free_kicks,
        fk_goals=fk_goals,
        fk_goal_pct=round(fk_goal_pct, 2),
        total_set_pieces=total_set_pieces,
        total_goals=total_goals,
        total_shots=total_shots,
    )


def dataframe_to_events(team_df: pd.DataFrame) -> List[schemas.SetPieceEvent]:
    events: List[schemas.SetPieceEvent] = []
    for record in team_df.to_dict(orient="records"):
        events.append(
            schemas.SetPieceEvent(
                event_id=str(record.get("event_id")),
                match_id=int(record.get("match_id", 0) or 0),
                event_type=str(record.get("event_type", "")),
                team_name=str(record.get("team_name", "")),
                opponent_name=record.get("opponent_name"),
                location_x=record.get("location_x"),
                location_y=record.get("location_y"),
                outcome=record.get("outcome"),
                is_goal=bool(record.get("is_goal", False)),
                is_shot=bool(record.get("is_shot", False)),
                player_name=str(record.get("player_name", "Unknown")),
                receiver_name=record.get("receiver_name"),
                end_location_x=record.get("end_location_x"),
                end_location_y=record.get("end_location_y"),
            )
        )
    return events


def top_player_stats(team_df: pd.DataFrame, column: str, limit: int = 5) -> List[schemas.PlayerStat]:
    filtered = team_df[team_df[column].notna()].copy()
    filtered[column] = filtered[column].replace({"Unknown": None})
    filtered = filtered[filtered[column].notna()]
    if filtered.empty:
        return []

    grouped = (
        filtered.groupby(column)
        .agg(
            event_count=("event_id", "count"),
            goals=("is_goal", "sum"),
            shots=("is_shot", "sum"),
        )
        .reset_index()
        .sort_values("event_count", ascending=False)
        .head(limit)
    )

    stats: List[schemas.PlayerStat] = []
    for _, row in grouped.iterrows():
        stats.append(
            schemas.PlayerStat(
                player_name=str(row[column]),
                event_count=int(row["event_count"]),
                goals=int(row["goals"]),
                shots=int(row["shots"]),
            )
        )
    return stats


@app.get("/api/teams", response_model=List[str])
def list_teams() -> List[str]:
    unique = sorted(df["team_name"].dropna().unique().tolist())
    return [team for team in unique if team]


@app.get("/api/analysis/{team_name}", response_model=schemas.TeamData)
def analyze_team(team_name: str) -> schemas.TeamData:
    if df.empty:
        raise HTTPException(status_code=503, detail="Dataset not available. Run data processing pipeline first.")

    attacking_df = df[df["team_name"] == team_name].copy()
    if attacking_df.empty:
        raise HTTPException(status_code=404, detail=f"No set-piece data found for team '{team_name}'")

    kpis = calculate_kpis(attacking_df)
    events = dataframe_to_events(attacking_df)
    top_takers = top_player_stats(attacking_df, "player_name")
    top_receivers = top_player_stats(attacking_df, "receiver_name")

    return schemas.TeamData(
        team_name=team_name,
        kpis=kpis,
        events=events,
        top_takers=top_takers,
        top_receivers=top_receivers,
    )
