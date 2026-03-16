// src/components/panels/RightPanel.tsx
import type { GameAction, Player, Factory, Plantation, Territory } from '../../types';
import BuildPanel from './BuildOptionsPanel';
import ColonizePanel from './ColonizeOptionsPanel';
import CampaignPanel from './CampaignOptionsPanel';

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
  mode, player,
  buildOptions, colonizeOptions, campaignOptions,
  onBuild, onColonize, onConquer, onClose
}: Props) {
  return (
    <aside className="w-full md:w-96 border-l bg-white p-4 overflow-y-auto">
      {mode === 'BUILD'     && <BuildPanel player={player} options={buildOptions} onBuild={onBuild} onClose={onClose} />}
      {mode === 'COLONIZE'  && <ColonizePanel player={player} options={colonizeOptions} onColonize={onColonize} onClose={onClose} />}
      {mode === 'CAMPAIGN'  && <CampaignPanel player={player} options={campaignOptions} onConquer={onConquer} onClose={onClose} />}
    </aside>
  );
}
