import React from 'react';
import { 
  Target, 
  BarChart3, 
  ListChecks, 
  Sparkles, 
  MessageSquareQuote, 
  Wand2, 
  BookOpen, 
  Heart 
} from 'lucide-react';

export const Navigation = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'vision-board', label: 'Vision Board', icon: <Target className="w-5 h-5" /> },
    { id: 'energy-check', label: 'Energie-Check', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'manifestation-tracker', label: 'Fortschritt', icon: <ListChecks className="w-5 h-5" /> },
    { id: 'recommendations', label: 'Empfehlungen', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'quotes', label: 'Zitate', icon: <MessageSquareQuote className="w-5 h-5" /> },
    { id: 'manifestation', label: 'Manifestation', icon: <Wand2 className="w-5 h-5" /> },
    { id: 'resources', label: 'Ressourcen', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'gratitude', label: 'Dankbarkeit', icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md py-2 sticky top-0 z-10">
      <div className="container mx-auto px-8">
        <ul className="flex items-center gap-1 overflow-x-auto pb-2 hide-scrollbar">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activePage === item.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};