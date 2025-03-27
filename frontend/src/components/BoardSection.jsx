import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Briefcase, Heart, Users, Sparkles } from 'lucide-react';

export const BoardSection = ({ section, children }) => {
  const { setNodeRef } = useDroppable({
    id: section.id,
  });

  const getIcon = () => {
    switch (section.icon) {
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{section.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="min-h-40 grid grid-cols-2 gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
      >
        {children}
        {React.Children.count(children) === 0 && (
          <div className="col-span-2 flex items-center justify-center h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Bilder hierher ziehen
            </p>
          </div>
        )}
      </div>
    </div>
  );
};