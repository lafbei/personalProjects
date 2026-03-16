import type { Character, Equipment, Skill, Enemy, QuestNode } from '../types/game';

// Mock Skills
export const mockSkills: Skill[] = [
  {
    id: 'warrior_slash',
    name: 'Power Slash',
    description: 'A powerful melee attack that deals heavy damage to a single enemy.',
    category: 'offensive',
    manaCost: 10,
    cooldown: 2,
    currentCooldown: 0,
    damage: 50,
    targetType: 'single',
    unlockLevel: 1
  },
  {
    id: 'warrior_cleave',
    name: 'Cleave',
    description: 'Strike all enemies with a wide arc attack.',
    category: 'offensive',
    manaCost: 25,
    cooldown: 4,
    currentCooldown: 0,
    damage: 35,
    targetType: 'all',
    unlockLevel: 5
  },
  {
    id: 'warrior_shield',
    name: 'Shield Wall',
    description: 'Greatly increase defense for 3 turns.',
    category: 'defensive',
    manaCost: 15,
    cooldown: 5,
    currentCooldown: 0,
    statusEffect: 'shield',
    targetType: 'self',
    unlockLevel: 3
  },
  {
    id: 'mage_fireball',
    name: 'Fireball',
    description: 'Launch a ball of fire at an enemy.',
    category: 'offensive',
    manaCost: 20,
    cooldown: 1,
    currentCooldown: 0,
    damage: 60,
    targetType: 'single',
    unlockLevel: 1
  },
  {
    id: 'mage_heal',
    name: 'Healing Light',
    description: 'Restore health to an ally.',
    category: 'support',
    manaCost: 15,
    cooldown: 2,
    currentCooldown: 0,
    healing: 40,
    targetType: 'single',
    unlockLevel: 2
  },
  {
    id: 'rogue_backstab',
    name: 'Backstab',
    description: 'Critical strike from the shadows.',
    category: 'offensive',
    manaCost: 12,
    cooldown: 3,
    currentCooldown: 0,
    damage: 70,
    targetType: 'single',
    unlockLevel: 1
  },
  {
    id: 'rogue_poison',
    name: 'Poison Blade',
    description: 'Apply poison to your weapon, dealing damage over time.',
    category: 'offensive',
    manaCost: 10,
    cooldown: 4,
    currentCooldown: 0,
    damage: 20,
    statusEffect: 'poison',
    targetType: 'single',
    unlockLevel: 4
  }
];

// Mock Equipment
export const mockEquipment: Equipment[] = [
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 10, health: 0, maxHealth: 0, mana: 0, maxMana: 0, defense: 0, speed: 0, critChance: 0 },
    description: 'A basic iron sword.'
  },
  {
    id: 'steel_armor',
    name: 'Steel Armor',
    type: 'armor',
    rarity: 'uncommon',
    stats: { defense: 15, maxHealth: 20, health: 0, mana: 0, maxMana: 0, attack: 0, speed: 0, critChance: 0 },
    description: 'Sturdy steel armor that provides good protection.'
  },
  {
    id: 'flame_sword',
    name: 'Flame Sword',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 25, health: 0, maxHealth: 0, mana: 0, maxMana: 0, defense: 0, speed: 5, critChance: 0 },
    description: 'A sword imbued with the power of fire.'
  },
  {
    id: 'mage_staff',
    name: 'Arcane Staff',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 15, maxMana: 30, health: 0, maxHealth: 0, mana: 0, defense: 0, speed: 0, critChance: 0 },
    description: 'A staff that amplifies magical power.'
  },
  {
    id: 'power_ring',
    name: 'Ring of Power',
    type: 'accessory',
    rarity: 'epic',
    stats: { attack: 10, defense: 10, maxHealth: 15, health: 0, mana: 0, maxMana: 0, speed: 0, critChance: 0 },
    description: 'A magical ring that boosts overall combat abilities.'
  }
];

// Mock Characters
export const createMockParty = (): Character[] => [
  {
    id: 'char_1',
    name: 'Aldric',
    class: 'Warrior',
    level: 3,
    experience: 150,
    experienceToNextLevel: 300,
    stats: {
      health: 120,
      maxHealth: 120,
      mana: 30,
      maxMana: 30,
      attack: 25,
      defense: 20,
      speed: 10,
      critChance: 10
    },
    baseStats: {
      health: 100,
      maxHealth: 100,
      mana: 30,
      maxMana: 30,
      attack: 20,
      defense: 15,
      speed: 10,
      critChance: 10
    },
    equipment: {
      weapon: mockEquipment[0],
      armor: mockEquipment[1]
    },
    skills: [mockSkills[0], mockSkills[2]],
    availableSkillPoints: 1,
    statusEffects: [],
    isAlive: true
  },
  {
    id: 'char_2',
    name: 'Elara',
    class: 'Mage',
    level: 3,
    experience: 150,
    experienceToNextLevel: 300,
    stats: {
      health: 70,
      maxHealth: 70,
      mana: 100,
      maxMana: 100,
      attack: 35,
      defense: 10,
      speed: 12,
      critChance: 15
    },
    baseStats: {
      health: 70,
      maxHealth: 70,
      mana: 80,
      maxMana: 80,
      attack: 30,
      defense: 10,
      speed: 12,
      critChance: 15
    },
    equipment: {
      weapon: mockEquipment[3]
    },
    skills: [mockSkills[3], mockSkills[4]],
    availableSkillPoints: 1,
    statusEffects: [],
    isAlive: true
  },
  {
    id: 'char_3',
    name: 'Raven',
    class: 'Rogue',
    level: 2,
    experience: 80,
    experienceToNextLevel: 200,
    stats: {
      health: 85,
      maxHealth: 85,
      mana: 40,
      maxMana: 40,
      attack: 30,
      defense: 12,
      speed: 18,
      critChance: 25
    },
    baseStats: {
      health: 85,
      maxHealth: 85,
      mana: 40,
      maxMana: 40,
      attack: 30,
      defense: 12,
      speed: 18,
      critChance: 25
    },
    equipment: {},
    skills: [mockSkills[5]],
    availableSkillPoints: 0,
    statusEffects: [],
    isAlive: true
  }
];

// Mock Enemies
export const createMockEnemies = (level: number): Enemy[] => [
  {
    id: 'enemy_1',
    name: 'Goblin Scout',
    level: level,
    stats: {
      health: 50 + (level * 10),
      maxHealth: 50 + (level * 10),
      mana: 20,
      maxMana: 20,
      attack: 15 + (level * 2),
      defense: 8 + level,
      speed: 12,
      critChance: 5
    },
    skills: [],
    statusEffects: [],
    isAlive: true,
    isBoss: false,
    experienceReward: 50 * level,
    lootTable: []
  },
  {
    id: 'enemy_2',
    name: 'Orc Warrior',
    level: level,
    stats: {
      health: 80 + (level * 15),
      maxHealth: 80 + (level * 15),
      mana: 10,
      maxMana: 10,
      attack: 20 + (level * 3),
      defense: 15 + (level * 2),
      speed: 8,
      critChance: 8
    },
    skills: [],
    statusEffects: [],
    isAlive: true,
    isBoss: false,
    experienceReward: 75 * level,
    lootTable: []
  }
];

export const createBossEnemy = (level: number): Enemy => ({
  id: 'boss_1',
  name: 'Shadow Lord',
  level: level,
  stats: {
    health: 300 + (level * 50),
    maxHealth: 300 + (level * 50),
    mana: 100,
    maxMana: 100,
    attack: 40 + (level * 5),
    defense: 30 + (level * 3),
    speed: 15,
    critChance: 20
  },
  skills: [],
  statusEffects: [],
  isAlive: true,
  isBoss: true,
  experienceReward: 500 * level,
  lootTable: [mockEquipment[2], mockEquipment[4]]
});

// Mock Quest Nodes
export const createMockQuestNodes = (): QuestNode[] => [
  {
    id: 'node_1',
    type: 'combat',
    title: 'Forest Ambush',
    description: 'Goblins have ambushed you on the forest path!',
    completed: false,
    enemies: createMockEnemies(1),
    rewards: { experience: 100, gold: 50 }
  },
  {
    id: 'node_2',
    type: 'rest',
    title: 'Peaceful Camp',
    description: 'Rest and recover your strength.',
    completed: false,
    rewards: { experience: 0 }
  },
  {
    id: 'node_3',
    type: 'shop',
    title: 'Traveling Merchant',
    description: 'A merchant offers rare items for sale.',
    completed: false
  },
  {
    id: 'node_4',
    type: 'combat',
    title: 'Mountain Pass',
    description: 'Orcs guard the mountain pass!',
    completed: false,
    enemies: createMockEnemies(3),
    rewards: { experience: 200, gold: 100, equipment: [mockEquipment[2]] }
  },
  {
    id: 'node_5',
    type: 'event',
    title: 'Mysterious Shrine',
    description: 'A shrine glows with ancient power...',
    completed: false,
    rewards: { experience: 150 }
  },
  {
    id: 'node_6',
    type: 'boss',
    title: 'Final Confrontation',
    description: 'Face the Shadow Lord in an epic battle!',
    completed: false,
    enemies: [createBossEnemy(10)],
    rewards: { experience: 1000, gold: 500, equipment: [mockEquipment[4]] }
  }
];
