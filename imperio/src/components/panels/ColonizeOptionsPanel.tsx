import type { Player, Plantation } from "../../types";

type Props = {
  player: Player;
  options: Plantation[];
  onColonize: (id: string) => void;
  onClose: () => void;
};

export default function ColonizeOptionsPanel({ player, options, onColonize, onClose }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Colonize • Plantations</h2>
        <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="text-sm opacity-80">
        Gold: <span className="font-mono">{player.gold}</span>
      </p>

      <ul className="grid gap-3">
        {options.map((p) => (
          <li key={p.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs opacity-70">Cost: {p.cost}</div>
            </div>
            <button
              className="px-3 py-1 rounded-lg bg-black text-white disabled:opacity-40"
              disabled={player.gold < p.cost}
              onClick={() => onColonize(p.id)}
            >
              Establish
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="text-sm opacity-70">No plantations available.</li>}
      </ul>
    </div>
  );
}
