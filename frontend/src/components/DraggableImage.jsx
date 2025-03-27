import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { X } from 'lucide-react';

export const DraggableImage = ({ item, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative group aspect-square cursor-grab active:cursor-grabbing"
    >
      <img
        src={item.imageUrl}
        alt=""
        className="w-full h-full object-cover rounded-lg shadow-sm"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="absolute top-1 right-1 bg-white/80 dark:bg-gray-800/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};