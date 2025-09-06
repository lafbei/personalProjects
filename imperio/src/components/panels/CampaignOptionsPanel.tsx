import type { Player, Territory } from "../../types";

type Props = {
  player: Player;
  options: Territory[];
  onConquer: (id: string) => void;
  onClose: () => void;
};

export default function CampaignOptionsPanel({ player, options, onConquer, onClose }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campaign • Conquer Territories</h2>
        <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="text-sm opacity-80">
        Gold: <span className="font-mono">{player.gold}</span>
      </p>

      <ul className="grid gap-3">
        {options.map((t) => (
          <li key={t.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs opacity-70">
                Defense: {t.defense} • Cost: {t.cost}
              </div>
            </div>
            <button
              className="px-3 py-1 rounded-lg bg-black text-white disabled:opacity-40"
              disabled={player.gold < t.cost}
              onClick={() => onConquer(t.id)}
            >
              Conquer
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="text-sm opacity-70">No targets available.</li>}
      </ul>
    </div>
  );
}
