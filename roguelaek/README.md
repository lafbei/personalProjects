# 🎮 Roguelaek - Turn-Based RPG Game

A turn-based role-playing game where you control a party of adventurers on an epic quest to defeat the final boss. Built with React, TypeScript, and Styled Components.

## 🚀 Getting Started

### Requirements
- Node.js `20.19+` or `22.12+`
- npm `10+` recommended

### Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Other scripts

```bash
npm run build
npm run preview
npm run lint
```

## 🎯 Game Features

### Core Gameplay
- **Party System**: Manage a group of up to 3 adventurers
- **Character Classes**: Warrior, Mage, Rogue, Cleric, and Ranger
- **Turn-Based Combat**: Strategic battles against enemies and bosses
- **Equipment System**: Weapons, armor, and accessories with different rarities
- **Skill Trees**: Unlock and upgrade character abilities
- **Quest Progression**: Navigate through combat, shops, rest areas, and events

### Character Progression
- **Experience & Levels**: Gain XP from battles to level up
- **Skill Points**: Unlock new abilities when leveling up
- **Equipment Slots**: Weapon, Armor, and Accessory
- **Stats**: Health, Mana, Attack, Defense, Speed, Critical Chance

### Equipment Rarity System
- Common (Gray)
- Uncommon (Green)
- Rare (Blue)
- Epic (Purple)
- Legendary (Gold)

## 📁 Project Structure

```
src/
├── types/
│   └── game.ts              # All TypeScript interfaces and types
├── components/
│   ├── CharacterCard.tsx    # Individual character display
│   ├── PartyPanel.tsx       # Party overview
│   ├── CombatView.tsx       # Turn-based combat interface
│   ├── SkillTree.tsx        # Skill selection and unlocking
│   ├── InventoryPanel.tsx   # Equipment management
│   └── QuestMap.tsx         # Quest progression view
├── data/
│   └── mockData.ts          # Sample characters, items, enemies
└── App.tsx                  # Main game logic and state
```

## 🎨 Component Overview

### CharacterCard
Displays character information including:
- Name, class, and level
- Health and mana bars with visual indicators
- Attack and defense stats
- Equipped items
- Status effects

### PartyPanel
Shows all party members in a grid layout with selection functionality for managing individual characters.

### CombatView
Turn-based combat interface featuring:
- Split battlefield (party vs enemies)
- Turn order indicator
- Action buttons (Attack, Skills, Defend, End Turn)
- Combat log with color-coded messages
- Health bars for all combatants

### SkillTree
Character skill progression system with:
- Categorized skills (Offensive, Defensive, Support, Ultimate)
- Level requirements
- Mana costs and cooldowns
- Visual unlock indicators

### InventoryPanel
Equipment management interface with:
- Three equipment slots (weapon, armor, accessory)
- Rarity-based color coding
- Stat bonuses display
- Click to equip/unequip items

### QuestMap
Shows the quest progression path with different node types:
- Combat encounters
- Rest areas
- Merchant shops
- Special events
- Boss battles

## 🧩 Type System

### Core Types
- `Character`: Player character with stats, equipment, and skills
- `Enemy`: Hostile entity with AI behavior
- `Equipment`: Items that can be equipped
- `Skill`: Abilities characters can use
- `QuestNode`: Points of interest on the quest map
- `CombatState`: Active battle information
- `GameState`: Overall game state

### Enums
- `CharacterClass`: Warrior, Mage, Rogue, Cleric, Ranger
- `EquipmentSlot`: weapon, armor, accessory
- `SkillCategory`: offensive, defensive, support, ultimate
- `StatusEffect`: poison, stun, bleeding, shield, haste, regeneration

## 🎮 Gameplay Flow

1. **Party View**: Start by viewing your party members
2. **Equipment**: Select a character and equip items to improve their stats
3. **Skills**: Spend skill points to unlock new abilities
4. **Quest Map**: Choose quest nodes to progress
5. **Combat**: Engage in turn-based battles
6. **Rewards**: Earn experience, gold, and equipment
7. **Level Up**: Gain skill points and improved stats
8. **Final Boss**: Face the Shadow Lord in an epic confrontation

## 🛠️ Technical Stack

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Styled Components**: CSS-in-JS styling
- **Vite**: Build tool and dev server
- **Lucide React**: Icon library

## 🎨 Styling Approach

All components use **Styled Components** for styling:
- Gradient backgrounds for visual depth
- Hover effects and transitions
- Responsive grid layouts
- Color-coded rarity system
- Dark theme optimized for gaming

## 🔄 State Management

Currently using React's `useState` for local state management. The main `GameState` object contains:
- Party members
- Inventory
- Gold currency
- Quest progress
- Active combat state

## 🚧 To Be Implemented

The skeleton is ready for you to implement:
- Combat mechanics (damage calculation, turn order)
- AI for enemy actions
- Save/Load game functionality
- More character classes and skills
- Item crafting system
- Procedural quest generation
- Sound effects and music
- Animations and particle effects

## 📝 Next Steps

1. Implement combat logic in `CombatView`
2. Add more skills for each character class
3. Create enemy AI behavior
4. Implement quest node interactions
5. Add rest and shop functionality
6. Balance character stats and difficulty
7. Add persistence (localStorage or database)
8. Create more diverse equipment
9. Add character customization

## 🤝 Contributing

This is a personal project skeleton. Feel free to extend it with your own features and improvements!
