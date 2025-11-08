"""Download StatsBomb open-data events into a single JSON file.

This script collects every publicly available competition and season that
StatsBomb publishes through the `statsbombpy` package. For each match we pull
the complete event stream and append it to an in-memory list before writing the
combined results to disk.

The resulting `events.json` file can be processed by
`process_set_pieces.py` to generate the aggregated set-piece dataset consumed
by the backend.
"""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
from statsbombpy import sb


LOGGER = logging.getLogger("set_piece_iq.get_statsbomb_data")


def fetch_events() -> List[Dict[str, Any]]:
    """Fetch events for every open-data match."""
    LOGGER.info("Fetching competitions metadata from StatsBomb")
    competitions = sb.competitions()
    competitions = competitions[competitions["competition_stage"].isna()]

    LOGGER.info("Found %d competitions", len(competitions))

    events: List[Dict[str, Any]] = []
    for _, row in competitions.iterrows():
        competition_id = int(row["competition_id"])
        season_id = int(row["season_id"])
        LOGGER.info(
            "Processing competition_id=%s season_id=%s",
            competition_id,
            season_id,
        )

        matches = sb.matches(competition_id=competition_id, season_id=season_id)
        LOGGER.info("  Found %d matches", len(matches))

        for _, match in matches.iterrows():
            match_id = int(match["match_id"])
            try:
                match_events = sb.events(match_id=match_id)
            except Exception as exc:  # noqa: BLE001
                LOGGER.exception("Failed to download events for match_id=%s: %s", match_id, exc)
                continue

            LOGGER.debug(
                "    Retrieved %d events for match %s vs %s (match_id=%s)",
                len(match_events),
                match.get("home_team"),
                match.get("away_team"),
                match_id,
            )

            if not isinstance(match_events, pd.DataFrame):
                LOGGER.warning("Unexpected events payload for match_id=%s; skipping", match_id)
                continue

            match_records = match_events.to_dict(orient="records")
            for record in match_records:
                record["match_id"] = match_id
            events.extend(match_records)

    LOGGER.info("Collected %d total events across all matches", len(events))
    return events


def write_events(events: List[Dict[str, Any]], output_path: Path) -> None:
    """Write events list to JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(events, f)
    LOGGER.info("Wrote events dataset to %s", output_path)


def configure_logging(verbose: bool) -> None:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format="%(asctime)s [%(levelname)s] %(message)s")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download StatsBomb open-data events")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent / "events.json",
        help="Path where the combined events JSON will be written.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging output.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    configure_logging(args.verbose)

    LOGGER.info("Starting StatsBomb open-data download")
    events = fetch_events()
    write_events(events, args.output)
    LOGGER.info("Download complete")


if __name__ == "__main__":
    main()
