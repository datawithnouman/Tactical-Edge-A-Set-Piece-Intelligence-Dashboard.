'use client';

type TeamSelectorProps = {
  teams: string[];
  selectedTeam: string | null;
  onSelect: (team: string) => void;
};

export default function TeamSelector({ teams, selectedTeam, onSelect }: TeamSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="team-selector" className="text-sm uppercase tracking-wide text-gray-400">
        Team
      </label>
      <select
        id="team-selector"
        className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-white shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        value={selectedTeam ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select a team
        </option>
        {teams.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>
    </div>
  );
}
