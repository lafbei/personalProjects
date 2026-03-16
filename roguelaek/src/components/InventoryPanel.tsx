import styled from 'styled-components';
import type { Equipment, Character } from '../types/game';
import { Backpack } from 'lucide-react';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 24px;
  color: white;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
`;

const EquippedSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 16px 0;
  color: #fbbf24;
`;

const EquipmentSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const Slot = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SlotLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.7;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const InventoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const ItemCard = styled.div<{ rarity: string }>`
  background: ${props => {
    switch (props.rarity) {
      case 'legendary': return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
      case 'epic': return 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)';
      case 'rare': return 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
      case 'uncommon': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ItemName = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
`;

const ItemType = styled.span`
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const ItemDescription = styled.p`
  margin: 8px 0;
  font-size: 0.85rem;
  line-height: 1.3;
`;

const ItemStats = styled.div`
  font-size: 0.85rem;
  margin-top: 8px;
  
  div {
    margin: 2px 0;
  }
`;

const EmptySlot = styled.div`
  font-size: 2rem;
  opacity: 0.3;
  margin-bottom: 4px;
`;

interface InventoryPanelProps {
  character: Character;
  inventory: Equipment[];
  onEquipItem: (itemId: string, slot: 'weapon' | 'armor' | 'accessory') => void;
  onUnequipItem: (slot: 'weapon' | 'armor' | 'accessory') => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  character,
  inventory,
  onEquipItem,
  onUnequipItem
}) => {
  const renderEquippedItem = (item: Equipment | undefined, slot: string, emoji: string) => (
    <Slot
      onClick={item ? () => onUnequipItem(slot as any) : undefined}
      style={{ 
        borderStyle: item ? 'solid' : 'dashed',
        background: item ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        cursor: item ? 'pointer' : 'default'
      }}
    >
      <SlotLabel>{slot}</SlotLabel>
      {item ? (
        <>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{emoji}</div>
          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
        </>
      ) : (
        <EmptySlot>{emoji}</EmptySlot>
      )}
    </Slot>
  );

  const getStatDisplay = (item: Equipment) => {
    const stats = [];
    if (item.stats.attack) stats.push(`⚔️ +${item.stats.attack} ATK`);
    if (item.stats.defense) stats.push(`🛡️ +${item.stats.defense} DEF`);
    if (item.stats.maxHealth) stats.push(`❤️ +${item.stats.maxHealth} HP`);
    if (item.stats.maxMana) stats.push(`💧 +${item.stats.maxMana} MP`);
    if (item.stats.speed) stats.push(`⚡ +${item.stats.speed} SPD`);
    return stats;
  };

  return (
    <Container>
      <Header>
        <Backpack size={32} />
        <Title>Inventory - {character.name}</Title>
      </Header>

      <EquippedSection>
        <SectionTitle>Equipped Items</SectionTitle>
        <EquipmentSlots>
          {renderEquippedItem(character.equipment.weapon, 'weapon', '⚔️')}
          {renderEquippedItem(character.equipment.armor, 'armor', '🛡️')}
          {renderEquippedItem(character.equipment.accessory, 'accessory', '💍')}
        </EquipmentSlots>
      </EquippedSection>

      <div>
        <SectionTitle>Available Equipment ({inventory.length} items)</SectionTitle>
        <InventoryGrid>
          {inventory.map(item => (
            <ItemCard
              key={item.id}
              rarity={item.rarity}
              onClick={() => onEquipItem(item.id, item.type)}
            >
              <ItemHeader>
                <ItemName>{item.name}</ItemName>
                <ItemType>{item.type}</ItemType>
              </ItemHeader>
              <ItemDescription>{item.description}</ItemDescription>
              <ItemStats>
                {getStatDisplay(item).map((stat, idx) => (
                  <div key={idx}>{stat}</div>
                ))}
              </ItemStats>
            </ItemCard>
          ))}
        </InventoryGrid>

        {inventory.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>
            No items in inventory
          </div>
        )}
      </div>
    </Container>
  );
};
