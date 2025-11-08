"""Pydantic schemas for Set-Piece IQ API responses."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class KpiStats(BaseModel):
    total_corners: int
    corner_goals: int
    corner_goal_pct: float
    total_free_kicks: int
    fk_goals: int
    fk_goal_pct: float
    total_set_pieces: int
    total_goals: int
    total_shots: int


class SetPieceEvent(BaseModel):
    event_id: str
    match_id: int
    event_type: str
    team_name: str
    opponent_name: Optional[str]
    location_x: Optional[float]
    location_y: Optional[float]
    outcome: Optional[str]
    is_goal: bool
    is_shot: bool
    player_name: str
    receiver_name: Optional[str]
    end_location_x: Optional[float]
    end_location_y: Optional[float]


class PlayerStat(BaseModel):
    player_name: str
    event_count: int
    goals: int
    shots: int


class TeamData(BaseModel):
    team_name: str
    kpis: KpiStats
    events: List[SetPieceEvent]
    top_takers: List[PlayerStat]
    top_receivers: List[PlayerStat]
