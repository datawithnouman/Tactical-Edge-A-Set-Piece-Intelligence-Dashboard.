'use client';

import { useEffect, useMemo, useState } from "react";
import KpiCard from "./components/KpiCard";
import PitchMap from "./components/PitchMap";
import PlayerAnalysis from "./components/PlayerAnalysis";
import TeamSelector from "./components/TeamSelector";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

type KpiStats = {
  total_corners: number;
  corner_goals: number;
  corner_goal_pct: number;
  total_free_kicks: number;
  fk_goals: number;
  fk_goal_pct: number;
  total_set_pieces: number;
  total_goals: number;
  total_shots: number;
};

type SetPieceEvent = {
  event_id: string;
  match_id: number;
  event_type: string;
  team_name: string;
  opponent_name?: string;
  location_x: number | null;
  location_y: number | null;
  outcome?: string | null;
  is_goal: boolean;
  is_shot: boolean;
  player_name: string;
  receiver_name?: string | null;
  end_location_x: number | null;
  end_location_y: number | null;
};

type PlayerStat = {
  player_name: string;
  event_count: number;
  goals: number;
  shots: number;
};

type TeamData = {
  team_name: string;
  kpis: KpiStats;
  events: SetPieceEvent[];
  top_takers: PlayerStat[];
  top_receivers: PlayerStat[];
};

export default function DashboardPage() {
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/teams`);
        if (!response.ok) {
          throw new Error(`Failed to load teams (${response.status})`);
        }
        const data: string[] = await response.json();
        setTeams(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Unable to load teams. Please ensure the backend is running.");
      }
    };

    fetchTeams();
  }, []);

  const handleTeamSelect = async (teamName: string) => {
    setSelectedTeam(teamName);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/analysis/${encodeURIComponent(teamName)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No data found for this team.");
        }
        throw new Error(`Failed to load team analysis (${response.status})`);
      }
      const data: TeamData = await response.json();
      setTeamData(data);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? "Unable to load analysis for the selected team.");
      setTeamData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const kpis = useMemo(() => {
    if (!teamData) return [];
    const { kpis } = teamData;
    return [
      { title: "Corner Goal %", value: `${kpis.corner_goal_pct.toFixed(1)}%`, subtitle: `${kpis.corner_goals} goals / ${kpis.total_corners} corners` },
      { title: "Free Kick Goal %", value: `${kpis.fk_goal_pct.toFixed(1)}%`, subtitle: `${kpis.fk_goals} goals / ${kpis.total_free_kicks} free kicks` },
      { title: "Total Set-Pieces", value: kpis.total_set_pieces, subtitle: `${kpis.total_shots} shots` },
      { title: "Set-Piece Goals", value: kpis.total_goals, subtitle: "Corners + free kicks" },
    ];
  }, [teamData]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-primary/10">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white">Explore Set-Piece Performance</h2>
          <p className="text-sm text-gray-400">
            Select a team to dive into their attacking set-pieces. Compare success rates, map outcomes, and pinpoint the most effective player combinations.
          </p>
        </div>
        <TeamSelector teams={teams} selectedTeam={selectedTeam} onSelect={handleTeamSelect} />
        {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}
      </section>

      {isLoading ? (
        <div className="flex w-full justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
        </div>
      ) : null}

      {teamData && !isLoading ? (
        <div className="flex flex-col gap-10">
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{kpis.map((kpi) => (
            <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} />
          ))}</section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <PitchMap events={teamData.events} />
            <PlayerAnalysis takers={teamData.top_takers} receivers={teamData.top_receivers} />
          </section>
        </div>
      ) : null}
    </div>
  );
}
