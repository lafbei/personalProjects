// Core game types for turn-based RPG

export type CharacterClass = 'Warrior' | 'Mage' | 'Rogue' | 'Cleric' | 'Ranger';

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type SkillCategory = 'offensive' | 'defensive' | 'support' | 'ultimate';

export type StatusEffect = 'poison' | 'stun' | 'bleeding' | 'shield' | 'haste' | 'regeneration';

// Character attributes
export interface CharacterStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
}

// Equipment system
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentSlot;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: Partial<CharacterStats>;
  description: string;
}

// Skill/Ability system
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  damage?: number;
  healing?: number;
  statusEffect?: StatusEffect;
  targetType: 'single' | 'all' | 'self';
  unlockLevel: number;
}

// Active status effects on a character
export interface ActiveStatusEffect {
  type: StatusEffect;
  duration: number;
  potency: number;
}

// Player character
export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  stats: CharacterStats;
  baseStats: CharacterStats;
  equipment: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  skills: Skill[];
  availableSkillPoints: number;
  statusEffects: ActiveStatusEffect[];
  isAlive: boolean;
}

// Enemy types
export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: CharacterStats;
  skills: Skill[];
  statusEffects: ActiveStatusEffect[];
  isAlive: boolean;
  isBoss: boolean;
  experienceReward: number;
  lootTable: Equipment[];
}

// Combat system
export type CombatAction = {
  actorId: string;
  actionType: 'attack' | 'skill' | 'item' | 'defend';
  targetId: string;
  skillId?: string;
  itemId?: string;
};

export interface CombatLog {
  message: string;
  timestamp: number;
  type: 'damage' | 'heal' | 'status' | 'info';
}

export interface CombatState {
  isActive: boolean;
  turn: number;
  playerParty: Character[];
  enemies: Enemy[];
  turnOrder: string[]; // IDs of characters/enemies in speed order
  currentActorId: string;
  combatLog: CombatLog[];
  isVictory: boolean;
  isDefeat: boolean;
}

// Quest & Progression
export interface QuestNode {
  id: string;
  type: 'combat' | 'shop' | 'rest' | 'event' | 'boss';
  title: string;
  description: string;
  completed: boolean;
  enemies?: Enemy[];
  rewards?: {
    experience: number;
    equipment?: Equipment[];
    gold?: number;
  };
}

export interface GameState {
  party: Character[];
  inventory: Equipment[];
  gold: number;
  currentQuestNode: number;
  questNodes: QuestNode[];
  combat: CombatState | null;
}
