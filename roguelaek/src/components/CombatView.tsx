import styled from 'styled-components';
import type { CombatState } from '../types/game';
import { Skull, Swords } from 'lucide-react';

const CombatContainer = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #7c2d12 100%);
  border-radius: 12px;
  padding: 24px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
`;

const CombatHeader = styled.div`
  text-align: center;
  color: white;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const TurnIndicator = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 8px;
`;

const Battlefield = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  flex: 1;
  align-items: center;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Combatant = styled.div<{ isActive?: boolean; isDead?: boolean }>`
  background: ${props => props.isActive ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: ${props => props.isActive ? '2px solid gold' : '2px solid transparent'};
  border-radius: 8px;
  padding: 12px;
  color: white;
  opacity: ${props => props.isDead ? 0.4 : 1};
  transition: all 0.3s;
`;

const CombatantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CombatantName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const HealthBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const HealthFill = styled.div<{ percentage: number }>`
  width: ${props => props.percentage}%;
  height: 100%;
  background: ${props => 
    props.percentage > 60 ? '#10b981' : 
    props.percentage > 30 ? '#f59e0b' : '#ef4444'};
  transition: width 0.3s ease;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 24px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'primary' ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 
    'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LogContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 12px;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 16px;
`;

const LogEntry = styled.div<{ type: 'damage' | 'heal' | 'status' | 'info' }>`
  color: ${props => {
    switch (props.type) {
      case 'damage': return '#ef4444';
      case 'heal': return '#10b981';
      case 'status': return '#f59e0b';
      default: return '#e5e7eb';
    }
  }};
  font-size: 0.9rem;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

interface CombatViewProps {
  combat: CombatState;
  onAttack: (targetId: string) => void;
  onUseSkill: (skillId: string, targetId: string) => void;
  onDefend: () => void;
  onEndTurn: () => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  combat,
  onAttack,
  onDefend,
  onEndTurn
}) => {
  const currentActor = [...combat.playerParty, ...combat.enemies].find(
    c => c.id === combat.currentActorId
  );

  const isPlayerTurn = combat.playerParty.some(c => c.id === combat.currentActorId);
  const currentPlayerIsAlive = currentActor?.isAlive ?? false;

  return (
    <CombatContainer>
      <CombatHeader>
        <Title>
          <Swords style={{ display: 'inline', marginRight: '8px' }} />
          Combat
          <Skull style={{ display: 'inline', marginLeft: '8px' }} />
        </Title>
        <TurnIndicator>
          Turn {combat.turn} • {currentActor?.name}'s turn
        </TurnIndicator>
      </CombatHeader>

      <Battlefield>
        <Side>
          <h3 style={{ color: 'white', margin: '0 0 8px 0' }}>Your Party</h3>
          {combat.playerParty.map(character => {
            const healthPercentage = (character.stats.health / character.stats.maxHealth) * 100;
            return (
              <Combatant
                key={character.id}
                isActive={character.id === combat.currentActorId}
                isDead={!character.isAlive}
              >
                <CombatantHeader>
                  <CombatantName>{character.name}</CombatantName>
                  <span>Lvl {character.level}</span>
                </CombatantHeader>
                <div style={{ fontSize: '0.9rem' }}>
                  {character.stats.health} / {character.stats.maxHealth} HP
                </div>
                <HealthBar>
                  <HealthFill percentage={healthPercentage} />
                </HealthBar>
              </Combatant>
            );
          })}
        </Side>

        <Side>
          <h3 style={{ color: 'white', margin: '0 0 8px 0' }}>Enemies</h3>
          {combat.enemies.map(enemy => {
            const healthPercentage = (enemy.stats.health / enemy.stats.maxHealth) * 100;
            return (
              <Combatant
                key={enemy.id}
                isActive={enemy.id === combat.currentActorId}
                isDead={!enemy.isAlive}
                onClick={isPlayerTurn && currentPlayerIsAlive && enemy.isAlive ? () => onAttack(enemy.id) : undefined}
                style={{ cursor: isPlayerTurn && currentPlayerIsAlive && enemy.isAlive ? 'pointer' : 'default' }}
              >
                <CombatantHeader>
                  <CombatantName>
                    {enemy.name} {enemy.isBoss && '👑'}
                  </CombatantName>
                  <span>Lvl {enemy.level}</span>
                </CombatantHeader>
                <div style={{ fontSize: '0.9rem' }}>
                  {enemy.stats.health} / {enemy.stats.maxHealth} HP
                </div>
                <HealthBar>
                  <HealthFill percentage={healthPercentage} />
                </HealthBar>
              </Combatant>
            );
          })}
        </Side>
      </Battlefield>

      {isPlayerTurn && currentPlayerIsAlive && (
        <ActionButtons>
          <ActionButton 
            variant="primary" 
            onClick={() => {
              const firstAliveEnemy = combat.enemies.find(e => e.isAlive);
              if (firstAliveEnemy) onAttack(firstAliveEnemy.id);
            }}
            disabled={!combat.enemies.some(e => e.isAlive)}
          >
            Quick Attack
          </ActionButton>
          <ActionButton variant="secondary" disabled>
            Skills (WIP)
          </ActionButton>
          <ActionButton variant="secondary" onClick={onDefend}>
            Defend
          </ActionButton>
          <ActionButton variant="secondary" onClick={onEndTurn}>
            End Turn
          </ActionButton>
        </ActionButtons>
      )}

      <LogContainer>
        {combat.combatLog.slice(-5).map((log, index) => (
          <LogEntry key={`${log.timestamp}-${index}`} type={log.type}>
            {log.message}
          </LogEntry>
        ))}
      </LogContainer>
    </CombatContainer>
  );
};
