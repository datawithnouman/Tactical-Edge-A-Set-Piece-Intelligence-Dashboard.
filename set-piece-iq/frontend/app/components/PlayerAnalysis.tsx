'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PlayerStat = {
  player_name: string;
  event_count: number;
  goals: number;
  shots: number;
};

type PlayerAnalysisProps = {
  takers: PlayerStat[];
  receivers: PlayerStat[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const stat = payload[0]?.payload as PlayerStat;
  return (
    <div className="rounded-md border border-white/10 bg-background/90 px-3 py-2 text-xs text-gray-200 shadow-lg">
      <p className="font-semibold text-white">{label}</p>
      <p>Events: {stat.event_count}</p>
      <p>Shots: {stat.shots}</p>
      <p>Goals: {stat.goals}</p>
    </div>
  );
};

export default function PlayerAnalysis({ takers, receivers }: PlayerAnalysisProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Top Set-Piece Takers</h3>
        <p className="text-xs uppercase tracking-wide text-gray-500">Event count by player</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={takers} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="player_name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="event_count" fill="#0AFFA7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold text-white">Top Receivers</h3>
        <p className="text-xs uppercase tracking-wide text-gray-500">Shot involvement by player</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={receivers} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="player_name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="shots" fill="#FFC107" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
