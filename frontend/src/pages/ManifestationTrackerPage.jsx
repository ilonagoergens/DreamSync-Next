import React, { useState } from 'react';
import { Plus, ListChecks, CheckCircle2, Circle, Calendar, X, Edit2, Save } from 'lucide-react';
import { useAppStore } from '../store';

function ManifestationTrackerPage() {
  const userId = useAppStore(state => state.userId);

  const addManifestation = useAppStore(state => state.addManifestation);
  const updateManifestation = useAppStore(state => state.updateManifestation);
  const toggleManifestationComplete = useAppStore(state => state.toggleManifestationComplete);
  const removeManifestation = useAppStore(state => state.removeManifestation);
  const manifestations = useAppStore(state => state.manifestations);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleAddOrUpdateGoal = () => {
    if (!editingGoal?.text?.trim()) return;

    if (isEditing) {
      updateManifestation(editingGoal.id, editingGoal);
    } else {
      const newGoal = {
        ...editingGoal,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        completed: false,
        userId,
      };
      addManifestation(newGoal);
    }

    setIsAddingGoal(false);
    setIsEditing(false);
    setEditingGoal(null);
  };

  const openEditModal = (goal) => {
    setIsEditing(true);
    setEditingGoal(goal);
    setIsAddingGoal(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingGoal({
      text: '',
      category: 'personal',
      notes: '',
    });
    setIsAddingGoal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categories = [
    { value: 'personal', label: 'Persönliche Entwicklung' },
    { value: 'career', label: 'Karriere' },
    { value: 'relationships', label: 'Beziehungen' },
    { value: 'health', label: 'Gesundheit' },
    { value: 'financial', label: 'Finanzen' },
    { value: 'spiritual', label: 'Spiritualität' },
  ];

  const sortedManifestations = [...manifestations].sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by date (newest first)
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Ziele & Manifestationen</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Verfolge deine Ziele und manifestiere deine Wünsche
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Neues Ziel</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {manifestations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Du hast noch keine Ziele hinzugefügt.
            </p>
            <button
              onClick={openAddModal}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              <span>Erstes Ziel hinzufügen</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedManifestations.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  goal.completed
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <button
                  onClick={() => toggleManifestationComplete(goal.id)}
                  className={`mt-1 ${
                    goal.completed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className={`font-medium ${
                        goal.completed
                          ? 'text-green-800 dark:text-green-200 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {goal.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(goal.date)}
                        </span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {categories.find(c => c.value === goal.category)?.label}
                        </span>
                      </div>
                      {goal.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {goal.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(goal)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => removeManifestation(goal.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Ziel bearbeiten' : 'Neues Ziel'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingGoal(false);
                  setEditingGoal(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ziel
                </label>
                <input
                  type="text"
                  value={editingGoal?.text || ''}
                  onChange={(e) => setEditingGoal(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  placeholder="Was möchtest du erreichen?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategorie
                </label>
                <select
                  value={editingGoal?.category || 'personal'}
                  onChange={(e) => setEditingGoal(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notizen (optional)
                </label>
                <textarea
                  value={editingGoal?.notes || ''}
                  onChange={(e) => setEditingGoal(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                  rows={3}
                  placeholder="Zusätzliche Details oder Gedanken"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setIsAddingGoal(false);
                    setEditingGoal(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddOrUpdateGoal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{isEditing ? 'Aktualisieren' : 'Hinzufügen'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManifestationTrackerPage;