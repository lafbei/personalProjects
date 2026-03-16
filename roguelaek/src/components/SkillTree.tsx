import styled from 'styled-components';
import type { Character, Skill } from '../types/game';
import { Sparkles, Lock } from 'lucide-react';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 24px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SkillPoints = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
`;

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const SkillCard = styled.div<{ isUnlocked: boolean; canUnlock: boolean }>`
  background: ${props => 
    props.isUnlocked ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
    props.canUnlock ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' :
    'linear-gradient(135deg, #4b5563 0%, #374151 100%)'};
  border-radius: 8px;
  padding: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: ${props => props.canUnlock ? 'pointer' : 'default'};
  opacity: ${props => props.isUnlocked || props.canUnlock ? 1 : 0.6};

  &:hover {
    transform: ${props => props.canUnlock ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.canUnlock ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

const SkillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const SkillName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
`;

const SkillCategory = styled.span<{ category: string }>`
  background: ${props => {
    switch (props.category) {
      case 'offensive': return '#dc2626';
      case 'defensive': return '#2563eb';
      case 'support': return '#16a34a';
      case 'ultimate': return '#7c3aed';
      default: return '#6b7280';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const SkillDescription = styled.p`
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SkillStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.85rem;
`;

const StatBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
`;

const UnlockRequirement = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.85rem;
  opacity: 0.9;
`;

interface SkillTreeProps {
  character: Character;
  availableSkills: Skill[];
  onUnlockSkill: (skillId: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  character,
  availableSkills,
  onUnlockSkill
}) => {
  const hasSkill = (skillId: string) => 
    character.skills.some(s => s.id === skillId);

  const canUnlock = (skill: Skill) => 
    !hasSkill(skill.id) && 
    character.level >= skill.unlockLevel && 
    character.availableSkillPoints > 0;

  return (
    <Container>
      <Header>
        <Title>
          <Sparkles />
          Skill Tree - {character.name}
        </Title>
        <SkillPoints>
          {character.availableSkillPoints} Skill Points Available
        </SkillPoints>
      </Header>

      <SkillGrid>
        {availableSkills.map(skill => {
          const unlocked = hasSkill(skill.id);
          const canLearn = canUnlock(skill);

          return (
            <SkillCard
              key={skill.id}
              isUnlocked={unlocked}
              canUnlock={canLearn}
              onClick={canLearn ? () => onUnlockSkill(skill.id) : undefined}
            >
              <SkillHeader>
                <SkillName>
                  {unlocked && '✓ '}
                  {skill.name}
                </SkillName>
                <SkillCategory category={skill.category}>
                  {skill.category}
                </SkillCategory>
              </SkillHeader>

              <SkillDescription>{skill.description}</SkillDescription>

              <SkillStats>
                {skill.manaCost > 0 && <StatBadge>💧 {skill.manaCost} MP</StatBadge>}
                {skill.damage && <StatBadge>⚔️ {skill.damage} DMG</StatBadge>}
                {skill.healing && <StatBadge>❤️ {skill.healing} HP</StatBadge>}
                {skill.cooldown > 0 && <StatBadge>⏱️ {skill.cooldown} turns</StatBadge>}
                <StatBadge>🎯 {skill.targetType}</StatBadge>
              </SkillStats>

              {!unlocked && (
                <UnlockRequirement>
                  {character.level < skill.unlockLevel ? (
                    <>
                      <Lock size={14} />
                      Requires Level {skill.unlockLevel}
                    </>
                  ) : character.availableSkillPoints === 0 ? (
                    <>
                      <Lock size={14} />
                      No skill points available
                    </>
                  ) : (
                    <span>Click to unlock!</span>
                  )}
                </UnlockRequirement>
              )}
            </SkillCard>
          );
        })}
      </SkillGrid>
    </Container>
  );
};
