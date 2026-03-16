import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { GameState, Character, CharacterStats } from './types/game';
import { PartyPanel } from './components/PartyPanel';
import { CombatView } from './components/CombatView';
import { SkillTree } from './components/SkillTree';
import { InventoryPanel } from './components/InventoryPanel';
import { QuestMap } from './components/QuestMap';
import { createMockParty, createMockQuestNodes, mockEquipment, mockSkills } from './data/mockData';
import { Users, Backpack, Map, Sparkles } from 'lucide-react';

// Helper function to calculate character stats with equipment bonuses
const calculateStatsWithEquipment = (baseStats: CharacterStats, equipment: Character['equipment']): CharacterStats => {
  const stats = { ...baseStats };
  
  // Apply weapon bonuses
  if (equipment.weapon) {
    Object.entries(equipment.weapon.stats).forEach(([key, value]) => {
      if (value && key in stats) {
        stats[key as keyof CharacterStats] += value;
      }
    });
  }
  
  // Apply armor bonuses
  if (equipment.armor) {
    Object.entries(equipment.armor.stats).forEach(([key, value]) => {
      if (value && key in stats) {
        stats[key as keyof CharacterStats] += value;
      }
    });
  }
  
  // Apply accessory bonuses
  if (equipment.accessory) {
    Object.entries(equipment.accessory.stats).forEach(([key, value]) => {
      if (value && key in stats) {
        stats[key as keyof CharacterStats] += value;
      }
    });
  }
  
  // Ensure health doesn't exceed maxHealth
  stats.health = Math.min(stats.health, stats.maxHealth);
  stats.mana = Math.min(stats.mana, stats.maxMana);
  
  return stats;
};

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 20px;
`;

const Header = styled.header`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

const GameTitle = styled.h1`
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Navigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const NavButton = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border: ${props => props.isActive ? '2px solid #60a5fa' : '2px solid transparent'};
  color: white;
  border-radius: 8px;
  padding: 16px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const GameStats = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 16px;
  color: white;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-around;
  font-size: 1.1rem;
`;

type ViewType = 'party' | 'inventory' | 'skills' | 'quest';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    party: createMockParty(),
    inventory: mockEquipment.slice(2), // Start with some items
    gold: 250,
    currentQuestNode: 0,
    questNodes: createMockQuestNodes(),
    combat: null
  });

  const [currentView, setCurrentView] = useState<ViewType>('quest');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Ref to track if we're currently processing AI turn to prevent double-triggering
  const processingAITurn = useRef(false);

  // Handler functions (to be implemented)
  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    if (currentView === 'party') {
      setCurrentView('skills');
    }
  };

  const handleUnlockSkill = (skillId: string) => {
    if (!selectedCharacter) return;
    
    const skill = mockSkills.find(s => s.id === skillId);
    if (!skill) return;

    setGameState(prev => ({
      ...prev,
      party: prev.party.map(char => 
        char.id === selectedCharacter.id
          ? {
              ...char,
              skills: [...char.skills, { ...skill }],
              availableSkillPoints: char.availableSkillPoints - 1
            }
          : char
      )
    }));

    // Update selected character
    setSelectedCharacter(prev => prev ? {
      ...prev,
      skills: [...prev.skills, { ...skill }],
      availableSkillPoints: prev.availableSkillPoints - 1
    } : null);
  };

  const handleEquipItem = (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => {
    if (!selectedCharacter) return;

    const item = gameState.inventory.find(i => i.id === itemId);
    if (!item) return;

    setGameState(prev => {
      const updatedParty = prev.party.map(char => {
        if (char.id === selectedCharacter.id) {
          // Create new equipment object with the new item
          const newEquipment = {
            ...char.equipment,
            [slot]: item
          };
          
          // Recalculate stats with new equipment
          const newStats = calculateStatsWithEquipment(char.baseStats, newEquipment);
          
          return {
            ...char,
            equipment: newEquipment,
            stats: newStats
          };
        }
        return char;
      });
      
      // Update inventory: remove equipped item, add previously equipped item if any
      let newInventory = prev.inventory.filter(i => i.id !== itemId);
      const previouslyEquipped = selectedCharacter.equipment[slot];
      if (previouslyEquipped) {
        newInventory = [...newInventory, previouslyEquipped];
      }
      
      return {
        ...prev,
        party: updatedParty,
        inventory: newInventory
      };
    });

    // Update selected character reference
    setSelectedCharacter(prev => {
      if (!prev) return null;
      const newEquipment = {
        ...prev.equipment,
        [slot]: item
      };
      const newStats = calculateStatsWithEquipment(prev.baseStats, newEquipment);
      return {
        ...prev,
        equipment: newEquipment,
        stats: newStats
      };
    });
  };

  const handleUnequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
    if (!selectedCharacter) return;

    const equippedItem = selectedCharacter.equipment[slot];
    if (!equippedItem) return;

    setGameState(prev => {
      const updatedParty = prev.party.map(char => {
        if (char.id === selectedCharacter.id) {
          // Create new equipment object without the unequipped item
          const newEquipment = {
            ...char.equipment,
            [slot]: undefined
          };
          
          // Recalculate stats without the unequipped item
          const newStats = calculateStatsWithEquipment(char.baseStats, newEquipment);
          
          return {
            ...char,
            equipment: newEquipment,
            stats: newStats
          };
        }
        return char;
      });
      
      return {
        ...prev,
        party: updatedParty,
        inventory: [...prev.inventory, equippedItem]
      };
    });

    // Update selected character reference
    setSelectedCharacter(prev => {
      if (!prev) return null;
      const newEquipment = {
        ...prev.equipment,
        [slot]: undefined
      };
      const newStats = calculateStatsWithEquipment(prev.baseStats, newEquipment);
      return {
        ...prev,
        equipment: newEquipment,
        stats: newStats
      };
    });
  };

  const handleSelectQuestNode = (nodeId: string) => {
    const node = gameState.questNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Example: Start combat if it's a combat node
    if (node.type === 'combat' && node.enemies) {
      const turnOrder = [...gameState.party.map(c => c.id), ...node.enemies!.map(e => e.id)]
        .sort(() => Math.random() - 0.5); // Simple random turn order
      
      setGameState(prev => ({
        ...prev,
        combat: {
          isActive: true,
          turn: 1,
          playerParty: prev.party.map(c => ({ ...c })),
          enemies: node.enemies!.map(e => ({ ...e })),
          turnOrder,
          currentActorId: turnOrder[0], // Start with first actor in turn order
          combatLog: [{ message: 'Combat has begun!', timestamp: Date.now(), type: 'info' }],
          isVictory: false,
          isDefeat: false
        }
      }));
    }
  };

  // Combat handlers
  const handleCombatAttack = (targetId: string) => {
    if (!gameState.combat) return;

    setGameState(prev => {
      if (!prev.combat) return prev;

      const combat = prev.combat;
      const attacker = [...combat.playerParty, ...combat.enemies].find(c => c.id === combat.currentActorId);
      const target = [...combat.playerParty, ...combat.enemies].find(c => c.id === targetId);

      if (!attacker || !target || !target.isAlive) return prev;

      // Calculate damage
      const baseDamage = attacker.stats.attack;
      const defense = target.stats.defense;
      const damage = Math.max(1, baseDamage - Math.floor(defense / 2));

      // Apply damage
      const updatedPlayerParty = combat.playerParty.map(char =>
        char.id === targetId
          ? { ...char, stats: { ...char.stats, health: Math.max(0, char.stats.health - damage) }, isAlive: char.stats.health - damage > 0 }
          : char
      );

      const updatedEnemies = combat.enemies.map(enemy =>
        enemy.id === targetId
          ? { ...enemy, stats: { ...enemy.stats, health: Math.max(0, enemy.stats.health - damage) }, isAlive: enemy.stats.health - damage > 0 }
          : enemy
      );

      // Add to combat log
      const newLog = {
        message: `${attacker.name} attacks ${target.name} for ${damage} damage!`,
        timestamp: Date.now(),
        type: 'damage' as const
      };

      // Check for victory or defeat
      const allEnemiesDead = updatedEnemies.every(e => !e.isAlive);
      const allPlayersDead = updatedPlayerParty.every(c => !c.isAlive);

      return {
        ...prev,
        combat: {
          ...combat,
          playerParty: updatedPlayerParty,
          enemies: updatedEnemies,
          combatLog: [...combat.combatLog, newLog],
          isVictory: allEnemiesDead,
          isDefeat: allPlayersDead
        }
      };
    });

    // Auto-advance turn after a short delay for better UX
    setTimeout(() => handleCombatEndTurn(), 500);
  };

  const handleCombatDefend = () => {
    if (!gameState.combat) return;

    setGameState(prev => {
      if (!prev.combat) return prev;

      const combat = prev.combat;
      const defender = [...combat.playerParty, ...combat.enemies].find(c => c.id === combat.currentActorId);

      if (!defender) return prev;

      const newLog = {
        message: `${defender.name} takes a defensive stance!`,
        timestamp: Date.now(),
        type: 'status' as const
      };

      return {
        ...prev,
        combat: {
          ...combat,
          combatLog: [...combat.combatLog, newLog]
        }
      };
    });

    // Auto-advance turn
    setTimeout(() => handleCombatEndTurn(), 500);
  };

  const handleCombatEndTurn = () => {
    setGameState(prev => {
      if (!prev.combat) return prev;

      const combat = prev.combat;
      
      // Check if combat is over
      if (combat.isVictory || combat.isDefeat) {
        // End combat and apply rewards
        if (combat.isVictory) {
          const expGained = combat.enemies.reduce((sum, e) => sum + e.experienceReward, 0);
          const goldGained = Math.floor(expGained / 2);

          const newLog = {
            message: `Victory! Gained ${expGained} XP and ${goldGained} gold!`,
            timestamp: Date.now(),
            type: 'info' as const
          };

          // Clear combat after showing victory message
          setTimeout(() => {
            setGameState(prev => ({ ...prev, combat: null }));
          }, 3000);

          return {
            ...prev,
            party: prev.party.map(char => {
              const combatChar = combat.playerParty.find(c => c.id === char.id);
              return combatChar ? {
                ...char,
                stats: combatChar.stats,
                isAlive: combatChar.isAlive,
                experience: char.experience + expGained
              } : char;
            }),
            gold: prev.gold + goldGained,
            combat: {
              ...combat,
              combatLog: [...combat.combatLog, newLog]
            }
          };
        } else {
          // Defeat
          const newLog = {
            message: 'Defeat! The party has fallen...',
            timestamp: Date.now(),
            type: 'info' as const
          };

          // Clear combat after showing defeat message
          setTimeout(() => {
            setGameState(prev => ({ ...prev, combat: null }));
          }, 3000);

          return {
            ...prev,
            party: prev.party.map(char => ({
              ...char,
              stats: { ...char.stats, health: 1 },
              isAlive: true
            })),
            gold: Math.floor(prev.gold * 0.9), // Lose 10% gold
            combat: {
              ...combat,
              combatLog: [...combat.combatLog, newLog]
            }
          };
        }
      }

      // Find next actor
      const currentIndex = combat.turnOrder.indexOf(combat.currentActorId);
      const nextIndex = (currentIndex + 1) % combat.turnOrder.length;
      const nextActorId = combat.turnOrder[nextIndex];
      
      // Increment turn if we've cycled back to the start
      const newTurn = nextIndex === 0 ? combat.turn + 1 : combat.turn;

      const updatedCombat = {
        ...combat,
        currentActorId: nextActorId,
        turn: newTurn
      };

      return {
        ...prev,
        combat: updatedCombat
      };
    });
  };

  // Handle AI turns automatically
  useEffect(() => {
    if (!gameState.combat || processingAITurn.current) return;
    
    const combat = gameState.combat;
    const currentActor = [...combat.playerParty, ...combat.enemies].find(
      c => c.id === combat.currentActorId
    );
    
    // If current actor is dead, skip their turn
    if (currentActor && !currentActor.isAlive) {
      processingAITurn.current = true;
      setTimeout(() => {
        handleCombatEndTurn();
        processingAITurn.current = false;
      }, 500);
      return;
    }
    
    // Check if current actor is an enemy and alive
    const isEnemyTurn = combat.enemies.some(e => e.id === combat.currentActorId);
    
    if (isEnemyTurn && currentActor?.isAlive && !combat.isVictory && !combat.isDefeat) {
      processingAITurn.current = true;
      
      // Pick random alive player as target
      const aliveParty = combat.playerParty.filter(c => c.isAlive);
      if (aliveParty.length > 0) {
        const randomTarget = aliveParty[Math.floor(Math.random() * aliveParty.length)];
        setTimeout(() => {
          handleCombatAttack(randomTarget.id);
          processingAITurn.current = false;
        }, 1000);
      } else {
        processingAITurn.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.combat?.currentActorId, gameState.combat?.isVictory, gameState.combat?.isDefeat]);

  const renderView = () => {
    switch (currentView) {
      case 'party':
        return (
          <PartyPanel
            party={gameState.party}
            onCharacterSelect={handleCharacterSelect}
            selectedCharacterId={selectedCharacter?.id}
          />
        );
      
      case 'inventory':
        return selectedCharacter ? (
          <InventoryPanel
            character={selectedCharacter}
            inventory={gameState.inventory}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
            Select a character from the Party view first
          </div>
        );
      
      case 'skills':
        return selectedCharacter ? (
          <SkillTree
            character={selectedCharacter}
            availableSkills={mockSkills}
            onUnlockSkill={handleUnlockSkill}
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
            Select a character from the Party view first
          </div>
        );
      
      case 'quest':
        return gameState.combat ? (
          <CombatView
            combat={gameState.combat}
            onAttack={handleCombatAttack}
            onUseSkill={(skillId, targetId) => console.log('Use skill:', skillId, targetId)}
            onDefend={handleCombatDefend}
            onEndTurn={handleCombatEndTurn}
          />
        ) : (
          <QuestMap
            questNodes={gameState.questNodes}
            currentNodeIndex={gameState.currentQuestNode}
            onSelectNode={handleSelectQuestNode}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <AppContainer>
      <Header>
        <GameTitle>⚔️ ROGUELAEK ⚔️</GameTitle>
      </Header>

      <GameStats>
        <div>💰 Gold: {gameState.gold}</div>
        <div>👥 Party: {gameState.party.filter(c => c.isAlive).length}/{gameState.party.length}</div>
        <div>🎒 Inventory: {gameState.inventory.length} items</div>
        <div>🗺️ Quest Progress: {gameState.currentQuestNode + 1}/{gameState.questNodes.length}</div>
      </GameStats>

      <Navigation>
        <NavButton 
          isActive={currentView === 'quest'} 
          onClick={() => setCurrentView('quest')}
        >
          <Map size={20} />
          Quest Map
        </NavButton>
        <NavButton 
          isActive={currentView === 'party'} 
          onClick={() => setCurrentView('party')}
        >
          <Users size={20} />
          Party
        </NavButton>
        <NavButton 
          isActive={currentView === 'inventory'} 
          onClick={() => setCurrentView('inventory')}
        >
          <Backpack size={20} />
          Inventory
        </NavButton>
        <NavButton 
          isActive={currentView === 'skills'} 
          onClick={() => setCurrentView('skills')}
        >
          <Sparkles size={20} />
          Skills
        </NavButton>
      </Navigation>

      {renderView()}
    </AppContainer>
  );
}

export default App;
