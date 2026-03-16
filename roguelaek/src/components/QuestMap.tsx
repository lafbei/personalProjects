import styled from 'styled-components';
import type { QuestNode } from '../types/game';
import { Swords, Store, Heart, HelpCircle, Crown } from 'lucide-react';

const Container = styled.div`
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 24px;
  color: white;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
`;

const QuestPath = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const NodeCard = styled.div<{ 
  isActive: boolean; 
  isCompleted: boolean; 
  nodeType: string;
}>`
  background: ${props => {
    if (props.isCompleted) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.isActive) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    if (props.nodeType === 'boss') return 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    return 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
  }};
  border-radius: 12px;
  padding: 20px;
  cursor: ${props => props.isActive ? 'pointer' : 'default'};
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: ${props => props.isCompleted ? 0.8 : 1};
  border: ${props => props.isActive ? '3px solid gold' : 'none'};

  &:hover {
    transform: ${props => props.isActive ? 'scale(1.02)' : 'none'};
    box-shadow: ${props => props.isActive ? '0 8px 16px rgba(0, 0, 0, 0.4)' : 'none'};
  }
`;

const NodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const NodeTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NodeType = styled.span`
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: bold;
`;

const NodeDescription = styled.p`
  margin: 8px 0;
  font-size: 1rem;
  line-height: 1.5;
`;

const NodeRewards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const RewardBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
`;

const Connector = styled.div<{ isCompleted: boolean }>`
  width: 4px;
  height: 16px;
  background: ${props => props.isCompleted ? '#10b981' : '#4b5563'};
  margin: 0 auto;
`;

const StatusBadge = styled.div<{ isCompleted: boolean }>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: ${props => props.isCompleted ? '#10b981' : '#fbbf24'};
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
`;

interface QuestMapProps {
  questNodes: QuestNode[];
  currentNodeIndex: number;
  onSelectNode: (nodeId: string) => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  questNodes,
  currentNodeIndex,
  onSelectNode
}) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Swords />;
      case 'shop': return <Store />;
      case 'rest': return <Heart />;
      case 'boss': return <Crown />;
      case 'event': return <HelpCircle />;
      default: return <HelpCircle />;
    }
  };

  return (
    <Container>
      <Title>Quest Path</Title>
      <QuestPath>
        {questNodes.map((node, index) => (
          <div key={node.id}>
            <NodeCard
              isActive={index === currentNodeIndex}
              isCompleted={node.completed}
              nodeType={node.type}
              onClick={index === currentNodeIndex ? () => onSelectNode(node.id) : undefined}
            >
              <NodeHeader>
                <NodeTitle>
                  {getNodeIcon(node.type)}
                  {node.title}
                  {node.completed && ' ✓'}
                </NodeTitle>
                <NodeType>{node.type}</NodeType>
              </NodeHeader>

              <NodeDescription>{node.description}</NodeDescription>

              {node.rewards && (
                <NodeRewards>
                  {node.rewards.experience && (
                    <RewardBadge>✨ {node.rewards.experience} XP</RewardBadge>
                  )}
                  {node.rewards.gold && (
                    <RewardBadge>💰 {node.rewards.gold} Gold</RewardBadge>
                  )}
                  {node.rewards.equipment && (
                    <RewardBadge>
                      🎁 {node.rewards.equipment.length} Items
                    </RewardBadge>
                  )}
                </NodeRewards>
              )}

              {index === currentNodeIndex && !node.completed && (
                <StatusBadge isCompleted={false}>CURRENT</StatusBadge>
              )}
            </NodeCard>

            {index < questNodes.length - 1 && (
              <Connector isCompleted={node.completed} />
            )}
          </div>
        ))}
      </QuestPath>
    </Container>
  );
};
