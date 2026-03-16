import styled from 'styled-components';
import type { Character } from '../types/game';
import { CharacterCard } from './CharacterCard';

const PanelContainer = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const PanelTitle = styled.h2`
  color: white;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: bold;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

interface PartyPanelProps {
  party: Character[];
  onCharacterSelect?: (character: Character) => void;
  selectedCharacterId?: string;
}

export const PartyPanel: React.FC<PartyPanelProps> = ({ 
  party, 
  onCharacterSelect,
  selectedCharacterId 
}) => {
  return (
    <PanelContainer>
      <PanelTitle>Your Party</PanelTitle>
      <CharacterGrid>
        {party.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={onCharacterSelect ? () => onCharacterSelect(character) : undefined}
            isSelected={character.id === selectedCharacterId}
          />
        ))}
      </CharacterGrid>
    </PanelContainer>
  );
};
