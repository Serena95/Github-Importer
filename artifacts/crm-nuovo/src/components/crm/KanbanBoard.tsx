import React from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, GripVertical, Mail, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { PipelineStage } from '@/types';

interface KanbanBoardProps {
  stages: PipelineStage[];
  items: any[];
  onItemMove: (itemId: string, newStageId: string) => void;
  onAddItem: (stageId: string) => void;
  onItemClick: (item: any) => void;
  renderCard: (item: any) => React.ReactNode;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  stages, 
  items, 
  onItemMove, 
  onAddItem, 
  onItemClick,
  renderCard 
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const itemId = active.id;
    const overId = over.id;

    let newStageId = overId;
    const overItem = items.find(i => i.id === overId);
    if (overItem) {
      newStageId = overItem.stageId;
    }

    const activeItem = items.find(i => i.id === itemId);
    if (activeItem && activeItem.stageId !== newStageId) {
      onItemMove(itemId, newStageId);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-8 h-full min-w-max">
        {stages.sort((a, b) => a.order - b.order).map((stage) => (
          <KanbanColumn 
            key={stage.id} 
            stage={stage} 
            items={items.filter(i => i.stageId === stage.id)} 
            onAddItem={onAddItem}
            onItemClick={onItemClick}
            renderCard={renderCard}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="w-[300px] opacity-80 rotate-2">
            {renderCard(items.find(i => i.id === activeId)!)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface KanbanColumnProps {
  stage: PipelineStage;
  items: any[];
  onAddItem: (stageId: string) => void;
  onItemClick: (item: any) => void;
  renderCard: (item: any) => React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, items, onAddItem, onItemClick, renderCard }) => {
  const { setNodeRef } = useSortable({ id: stage.id });
  const totalValue = items.reduce((sum, i) => sum + (i.value || 0), 0);

  return (
    <div className="flex-shrink-0 w-[300px] flex flex-col h-full">
      <div className="mb-4 px-1">
        <div 
          className="h-1.5 w-full rounded-full mb-3" 
          style={{ backgroundColor: stage.color }}
        ></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-brand-gray uppercase tracking-widest">{stage.name}</h3>
            <span className="bg-white shadow-sm text-brand-gray text-[10px] font-black px-2 py-0.5 rounded-full border border-[#EEEEEE]">
              {items.length}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-brand-gray hover:bg-white">
            <MoreHorizontal size={14} />
          </Button>
        </div>
        <div className="mt-2">
          <span className="text-lg font-black text-brand-blue">€{totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 bg-brand-bg rounded-[8px] p-3 overflow-y-auto border border-[#EEEEEE] transition-colors hover:bg-brand-bg/80"
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onClick={() => onItemClick(item)}>
              {renderCard(item)}
            </SortableItem>
          ))}
        </SortableContext>
        
        <Button 
          variant="ghost" 
          className="w-full justify-center text-brand-blue text-xs h-10 hover:bg-white hover:shadow-sm mt-1 border border-dashed border-brand-blue/20 rounded-[8px]"
          onClick={() => onAddItem(stage.id)}
        >
          <Plus size={14} className="mr-2" />
          AGGIUNGI
        </Button>
      </div>
    </div>
  );
};

const SortableItem = ({ item, children, onClick }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} onClick={onClick} className="mb-3 group">
      <div className="relative">
        {children}
        <div {...listeners} className="absolute top-4 right-4 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>
      </div>
    </div>
  );
};
