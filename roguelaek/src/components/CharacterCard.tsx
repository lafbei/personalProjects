import styled from 'styled-components';
import type { Character } from '../types/game';
import { Heart, Shield, Zap, Swords } from 'lucide-react';

const Card = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CharacterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CharacterName = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
`;

const CharacterClass = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
`;

const Level = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HealthBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

const HealthFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: ${props => 
    props.percentage > 60 ? '#10b981' : 
    props.percentage > 30 ? '#f59e0b' : '#ef4444'};
  transition: width 0.3s ease;
`;

const ManaBar = styled(HealthBar)``;
const ManaFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
`;

const EquipmentSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const EquipmentLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 4px;
`;

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  isSelected?: boolean;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onClick,
  isSelected = false 
}) => {
  const healthPercentage = (character.stats.health / character.stats.maxHealth) * 100;
  const manaPercentage = (character.stats.mana / character.stats.maxMana) * 100;

  return (
    <Card onClick={onClick} style={{ 
      border: isSelected ? '2px solid gold' : 'none',
      cursor: onClick ? 'pointer' : 'default'
    }}>
      <CharacterHeader>
        <CharacterName>{character.name}</CharacterName>
        <CharacterClass>{character.class}</CharacterClass>
      </CharacterHeader>

      <Level>Level {character.level} • {character.experience}/{character.experienceToNextLevel} XP</Level>

      <div>
        <HealthBar>
          <HealthFill percentage={healthPercentage} />
        </HealthBar>
        <StatRow>
          <Heart />
          <span>{character.stats.health} / {character.stats.maxHealth} HP</span>
        </StatRow>
      </div>

      <div>
        <ManaBar>
          <ManaFill percentage={manaPercentage} />
        </ManaBar>
        <StatRow>
          <Zap />
          <span>{character.stats.mana} / {character.stats.maxMana} MP</span>
        </StatRow>
      </div>

      <StatsGrid>
        <StatRow>
          <Swords />
          <span>ATK: {character.stats.attack}</span>
        </StatRow>
        <StatRow>
          <Shield />
          <span>DEF: {character.stats.defense}</span>
        </StatRow>
      </StatsGrid>

      {(character.equipment.weapon || character.equipment.armor) && (
        <EquipmentSection>
          <EquipmentLabel>Equipment:</EquipmentLabel>
          {character.equipment.weapon && (
            <div style={{ fontSize: '0.85rem' }}>⚔️ {character.equipment.weapon.name}</div>
          )}
          {character.equipment.armor && (
            <div style={{ fontSize: '0.85rem' }}>🛡️ {character.equipment.armor.name}</div>
          )}
        </EquipmentSection>
      )}
    </Card>
  );
};
