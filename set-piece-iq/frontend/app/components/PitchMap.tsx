'use client';

import Image from "next/image";
import { useMemo } from "react";

type PitchEvent = {
  event_id: string;
  location_x: number | null;
  location_y: number | null;
  is_goal: boolean;
  is_shot: boolean;
  player_name: string;
  outcome?: string | null;
};

const PITCH_LENGTH = 120;
const PITCH_WIDTH = 80;

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const normalise = (value: number | null, maximum: number) => {
  if (value === null || Number.isNaN(value)) {
    return null;
  }
  return clamp((value / maximum) * 100);
};

const dotClass = (event: PitchEvent) => {
  if (event.is_goal) return "bg-primary shadow shadow-primary/70";
  if (event.is_shot) return "bg-secondary shadow shadow-secondary/60";
  return "bg-danger shadow shadow-danger/60";
};

type PitchMapProps = {
  events: PitchEvent[];
};

export default function PitchMap({ events }: PitchMapProps) {
  const plottedEvents = useMemo(
    () =>
      events
        .map((event) => {
          const left = normalise(event.location_x, PITCH_LENGTH);
          const top = normalise(event.location_y, PITCH_WIDTH);
          if (left === null || top === null) return null;
          return { ...event, left, top };
        })
        .filter((value): value is PitchEvent & { left: number; top: number } => Boolean(value)),
    [events],
  );

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-lg shadow-primary/10">
      <div className="relative h-0 w-full pb-[66.6667%]">
        <Image
          src="/soccer_pitch.svg"
          alt="Soccer pitch"
          fill
          priority
          className="pointer-events-none select-none object-cover opacity-70"
        />
        <div className="absolute inset-0">
          {plottedEvents.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No set-piece events available for this team.
            </div>
          ) : null}
          {plottedEvents.map((event) => (
            <div
              key={event.event_id}
              className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass(event)}`}
              style={{ left: `${event.left}%`, top: `${event.top}%` }}
              title={`${event.player_name} • ${event.outcome ?? "Unknown"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
