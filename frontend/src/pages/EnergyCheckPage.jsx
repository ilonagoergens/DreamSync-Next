// src/pages/EnergyCheckPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Smile, Frown, Meh, BarChart3, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '../store';
import { energyApi } from '../lib/api';

function EnergyCheckPage() {
  const userId = useAppStore(state => state.userId);
  const removeEnergyEntry = useAppStore((state) => state.removeEnergyEntry);
  const energyEntries = useAppStore((state) => state.energyEntries);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLevel, setSelectedLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await energyApi.getAll();
        useAppStore.setState({ energyEntries: res.data });  // ✅ global
        useAppStore.setState({ energyEntries: res.data }); // nur global
        // ✅ lokal
      } catch (error) {
        console.error("❌ Fehler beim Laden der Energie-Einträge:", error);
      }
    }
  
    fetchEntries();
  }, []);
  
  
  const handleAddEntry = async () => {
    const newEntry = { userId, date: selectedDate, level: selectedLevel, notes };
    try {
      const response = await energyApi.create(newEntry);
      useAppStore.setState((state) => ({
        energyEntries: [...state.energyEntries, response.data],
      }));
      
      setNotes('');
      setSelectedLevel(3);
      setIsAddingEntry(false);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };
  

  const handleRemoveEntry = async (id) => {
    try {
      await energyApi.delete(id);
      removeEnergyEntry(id); // ✅ Zustand über Store aktualisieren
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };
  

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

  const formatChartDate = (date) =>
    new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit'
    });

  const getFilteredEntries = () => {
    const now = new Date();
    let cutoff = new Date();
    if (timeframe === 'week') cutoff.setDate(now.getDate() - 7);
    if (timeframe === 'month') cutoff.setMonth(now.getMonth() - 1);
    if (timeframe === 'year') cutoff.setFullYear(now.getFullYear() - 1);

    return energyEntries
      .filter(e => new Date(e.date) >= cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getAverageEnergyLevel = (entries) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + e.level, 0);
    return (sum / entries.length).toFixed(1);
  };

  const getEnergyLevelColor = (level) => {
    if (level <= 2) return 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    if (level === 3) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
  };

  const getBarColor = (level) => {
    if (level <= 2) return '#ef4444';
    if (level === 3) return '#eab308';
    return '#22c55e';
  };

  const getEnergyLevelIcon = (level) => {
    if (level <= 2) return <Frown className="w-5 h-5" />;
    if (level === 3) return <Meh className="w-5 h-5" />;
    return <Smile className="w-5 h-5" />;
  };

  const filteredEntries = getFilteredEntries();
  const chartData = filteredEntries.map(e => ({
    date: formatChartDate(e.date),
    level: e.level,
    color: getBarColor(e.level),
    fullDate: e.date
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.fullDate)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`${getEnergyLevelColor(entry.level)} px-2 py-0.5 rounded-full`}>
            Energie-Level: {entry.level}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Energie-Check</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Verfolge dein Energielevel</p>
        </div>
        <button
          onClick={() => setIsAddingEntry(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Neuer Eintrag</span>
        </button>
      </div>

      {/* Chart & Zeitfilter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Energie-Verlauf</h3>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeframe(range)}
                className={`px-3 py-1.5 text-sm rounded-md ${
                  timeframe === range
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range === 'week' ? 'Woche' : range === 'month' ? 'Monat' : 'Jahr'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 mb-6">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Keine Daten für diesen Zeitraum.</p>
          )}
        </div>

        {/* Drei Statistik-Kästchen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Durchschnittliche Energie</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getAverageEnergyLevel(filteredEntries)}/5
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Einträge</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredEntries.length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Zeitraum</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {timeframe === 'week' ? 'Woche' : timeframe === 'month' ? 'Monat' : 'Jahr'}
            </p>
          </div>
        </div>
      </div>

      {/* Liste der Einträge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Einträge</h3>
        {filteredEntries.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">
            Füge deinen ersten Energie-Check hinzu, um deine Energie-Level zu verfolgen.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full ${getEnergyLevelColor(entry.level)} flex items-center justify-center`}>
                  {getEnergyLevelIcon(entry.level)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(entry.date)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-sm ${getEnergyLevelColor(entry.level)}`}>
                      Level {entry.level}
                    </span>
                  </div>
                  {entry.notes && (
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{entry.notes}</p>
                  )}
                </div>
                <button onClick={() => handleRemoveEntry(entry.id)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal zum Hinzufügen */}
      {isAddingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Neuer Energie-Eintrag</h3>
              <button onClick={() => setIsAddingEntry(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energie-Level</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`flex-1 py-2 rounded-md ${
                        selectedLevel === level
                          ? getEnergyLevelColor(level)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notizen</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Wie fühlst du dich heute?"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsAddingEntry(false)} className="px-4 py-2 border border-gray-300 rounded-md">
                  Abbrechen
                </button>
                <button onClick={handleAddEntry} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnergyCheckPage;
