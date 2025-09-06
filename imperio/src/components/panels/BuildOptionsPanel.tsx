import type { Player, Factory } from "../../types";

type Props = {
  player: Player;
  options: Factory[];
  onBuild: (id: string) => void;
  onClose: () => void;
};

export default function BuildOptionsPanel({ player, options, onBuild, onClose }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Build Factories</h2>
        <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="text-sm opacity-80">
        Gold: <span className="font-mono">{player.gold}</span>
      </p>

      <ul className="grid gap-3">
        {options.map((f) => (
          <li key={f.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{f.name}</div>
              <div className="text-xs opacity-70">Cost: {f.cost}</div>
            </div>
            <button
              className="px-3 py-1 rounded-lg bg-black text-white disabled:opacity-40"
              disabled={player.gold < f.cost}
              onClick={() => onBuild(f.id)}
            >
              Build
            </button>
          </li>
        ))}
        {options.length === 0 && <li className="text-sm opacity-70">No factories available.</li>}
      </ul>
    </div>
  );
}
