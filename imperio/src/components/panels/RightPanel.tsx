// src/components/panels/RightPanel.tsx
import type { GameAction, Player, Factory, Plantation, Territory } from "../../types";
import AssetsPanel from "./AssetsPanel";
import BuildPanel from "./BuildPanel";
import ColonizePanel from "./ColonizePanel";
import CampaignPanel from "./CampaignPanel";

type Props = {
  mode: GameAction;
  player: Player;
  buildOptions: Factory[];
  colonizeOptions: Plantation[];
  campaignOptions: Territory[];
  onBuild: (id: string) => void;
  onColonize: (id: string) => void;
  onConquer: (id: string) => void;
  onClose: () => void;
};

export default function RightPanel({
  mode,
  player,
  buildOptions,
  colonizeOptions,
  campaignOptions,
  onBuild,
  onColonize,
  onConquer,
  onClose,
}: Props) {
  return (
    <aside className="w-full md:w-96 border-l bg-white p-4 overflow-y-auto">
      {mode === "IDLE" && <AssetsPanel player={player} />}
      {mode === "BUILD" && (
        <BuildPanel player={player} options={buildOptions} onBuild={onBuild} onClose={onClose} />
      )}
      {mode === "COLONIZE" && (
        <ColonizePanel
          player={player}
          options={colonizeOptions}
          onColonize={onColonize}
          onClose={onClose}
        />
      )}
      {mode === "CAMPAIGN" && (
        <CampaignPanel
          player={player}
          options={campaignOptions}
          onConquer={onConquer}
          onClose={onClose}
        />
      )}
    </aside>
  );
}
