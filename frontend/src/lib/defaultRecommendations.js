import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Default recommendations that are always available
export const defaultRecommendations = {
  low: [
    {
      id: 'default-low-1',
      title: 'Geführte Meditation für mehr Energie',
      description: 'Eine sanfte 10-minütige Meditation, die dir hilft, deine Energie wieder aufzuladen und dich zu erden.',
      type: 'meditation',
      link: 'https://www.youtube.com/watch?v=AdGUYhwojGU',
      isDefault: true,
      energyLevel: 'low'
    },
    {
      id: 'default-low-2',
      title: 'Beruhigende Klanglandschaften',
      description: 'Entspannende Naturklänge und sanfte Musik, die deine Stimmung heben und dich beruhigen.',
      type: 'music',
      link: 'https://www.youtube.com/watch?v=pRtVNjv0NWs',
      isDefault: true,
      energyLevel: 'low'
    },
    {
      id: 'default-low-3',
      title: 'EFT Tapping für Erschöpfung',
      description: 'Eine einfache Tapping-Routine, die dir hilft, Blockaden zu lösen und neue Energie zu finden.',
      type: 'meditation',
      link: 'https://www.youtube.com/watch?v=bFwap7I8btU',
      isDefault: true,
      energyLevel: 'low'
    }
  ],
  medium: [
    {
      id: 'default-medium-1',
      title: '4-7-8 Atemtechnik',
      description: 'Eine kraftvolle Atemübung, die Stress reduziert und dein Nervensystem beruhigt.',
      type: 'breathing',
      link: 'https://www.youtube.com/watch?v=LiUnFJ8P4gM',
      isDefault: true,
      energyLevel: 'medium'
    },
    {
      id: 'default-medium-2',
      title: 'Achtsamer Spaziergang',
      description: '15 Minuten Spaziergang in der Natur',
      type: 'walk',
      isDefault: true,
      energyLevel: 'medium'
    },
    {
      id: 'default-medium-3',
      title: 'Positive Affirmationen',
      description: 'Kraftvolle Affirmationen für innere Ruhe',
      type: 'meditation',
      link: 'https://www.youtube.com/watch?v=H1AM0-9koVc',
      isDefault: true,
      energyLevel: 'medium'
    }
  ],
  high: [
    {
      id: 'default-high-1',
      title: 'Produktivitätstechniken',
      description: 'Lerne die Pomodoro-Technik und andere Methoden, um deinen produktiven Flow zu maximieren.',
      type: 'productivity',
      isDefault: true,
      energyLevel: 'high'
    },
    {
      id: 'default-high-2',
      title: 'Motivierende Talks',
      description: 'Inspirierende Vorträge, die dich motivieren, deine Ziele zu verfolgen.',
      type: 'video',
      link: 'https://www.youtube.com/watch?v=HyaRgych_yk',
      isDefault: true,
      energyLevel: 'high'
    },
    {
      id: 'default-high-3',
      title: 'Bücher für persönliches Wachstum',
      description: 'Empfehlungen für Bücher, die dir helfen, dein Mindset zu stärken.',
      type: 'reading',
      link: 'https://www.audible.de/blog/laura-malina-seiler-buchempfehlungen',
      isDefault: true,
      energyLevel: 'high'
    }
  ]
};

export const useAppStore = create()(
  persist(
    (set, get) => ({
      // Vision Board
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      moveItem: (itemId, sectionId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, section: sectionId } : item
          ),
        })),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      
      // Energy Check
      energyEntries: [],
      addEnergyEntry: (entry) => {
        set((state) => {
          const existingEntryIndex = state.energyEntries.findIndex(e => e.date === entry.date);
          if (existingEntryIndex >= 0) {
            const updatedEntries = [...state.energyEntries];
            updatedEntries[existingEntryIndex] = entry;
            return { energyEntries: updatedEntries };
          }
          return { energyEntries: [...state.energyEntries, entry] };
        });
      },
      removeEnergyEntry: (id) =>
        set((state) => ({
          energyEntries: state.energyEntries.filter((entry) => entry.id !== id),
        })),
      
      // Recommendations
      customRecommendations: {},
      getRecommendations: (energyLevel) => {
        const state = get();
        const defaults = defaultRecommendations[energyLevel] || [];
        const customs = Object.values(state.customRecommendations)
          .flat()
          .filter(rec => rec.energyLevel === energyLevel);
        return [...defaults, ...customs];
      },
      addRecommendation: (energyLevel, recommendation) =>
        set((state) => {
          const currentCustomRecs = Object.values(state.customRecommendations)
            .flat()
            .filter(rec => rec.energyLevel === energyLevel);
          
          // Only allow up to 3 custom recommendations per energy level
          if (currentCustomRecs.length >= 3) return state;

          const newRec = {
            ...recommendation,
            id: Date.now().toString(),
            isDefault: false,
            energyLevel
          };

          return {
            customRecommendations: {
              ...state.customRecommendations,
              [newRec.id]: newRec
            }
          };
        }),
      updateRecommendation: (energyLevel, id, updatedRecommendation) =>
        set((state) => ({
          customRecommendations: {
            ...state.customRecommendations,
            [id]: {
              ...updatedRecommendation,
              id,
              isDefault: false,
              energyLevel
            }
          }
        })),
      removeRecommendation: (energyLevel, id) =>
        set((state) => {
          const { [id]: removed, ...rest } = state.customRecommendations;
          return { customRecommendations: rest };
        }),

      // Manifestations
      manifestations: [],
      addManifestation: (manifestation) =>
        set((state) => ({
          manifestations: [...state.manifestations, manifestation]
        })),
      updateManifestation: (id, updatedManifestation) =>
        set((state) => ({
          manifestations: state.manifestations.map((m) =>
            m.id === id ? { ...m, ...updatedManifestation } : m
          )
        })),
      toggleManifestationComplete: (id) =>
        set((state) => ({
          manifestations: state.manifestations.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          )
        })),
      removeManifestation: (id) =>
        set((state) => ({
          manifestations: state.manifestations.filter((m) => m.id !== id)
        })),
      
      // UI State
      activePage: 'vision-board',
      setActivePage: (page) => set({ activePage: page }),
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'vision-board-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        items: state.items,
        energyEntries: state.energyEntries,
        customRecommendations: state.customRecommendations,
        manifestations: state.manifestations,
      }),
    }
  )
);