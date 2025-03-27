import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Music,
  Wind,
  Brain,
  Footprints,
  Video,
  BookOpen,
  Heart,
  Zap,
  Plus,
  X,
  Edit2,
  Save,
} from "lucide-react";
import { useAppStore } from "../store";
import { recommendationApi } from "../lib/api";
import { defaultRecommendations } from "../lib/defaultRecommendations";


function RecommendationsPage() {
  const userId = useAppStore((state) => state.userId);
  const energyEntries = useAppStore((state) => state.energyEntries);
  const [recommendations, setRecommendations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const getIconForType = (type) => {
    switch (type) {
      case "meditation":
        return <Brain className="text-purple-500" />;
      case "music":
        return <Music className="text-blue-500" />;
      case "breathing":
        return <Wind className="text-cyan-500" />;
      case "walk":
        return <Footprints className="text-green-500" />;
      case "video":
        return <Video className="text-orange-500" />;
      case "reading":
        return <BookOpen className="text-yellow-500" />;
      case "productivity":
        return <Zap className="text-lime-500" />;
      default:
        return <Heart className="text-red-500" />;
    }
  };

  const activityTypes = [
    { value: "meditation", label: "Meditation" },
    { value: "music", label: "Musik" },
    { value: "breathing", label: "Atemübung" },
    { value: "walk", label: "Bewegung" },
    { value: "video", label: "Video" },
    { value: "reading", label: "Lesen" },
    { value: "productivity", label: "Produktivität" },
  ];

  const energyInfo = useMemo(() => {
    if (energyEntries.length === 0) return null;
    const latest = [...energyEntries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
    const level = Number(latest.level);
    let category, text, color;
    if (level <= 2) {
      category = "low";
      text = "Niedrig";
      color = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    } else if (level >= 4) {
      category = "high";
      text = "Hoch";
      color =
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    } else {
      category = "medium";
      text = "Mittel";
      color =
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
    return { level, category, text, color };
  }, [energyEntries]);



  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!energyInfo?.category || !userId) return;
      try {
        const res = await recommendationApi.getAll(energyInfo.category);
        const backendRecs = res.data || [];
        const defaultRecs = defaultRecommendations[energyInfo.category] || [];
        setRecommendations([...defaultRecs, ...backendRecs]);
        
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden der Empfehlungen");
      }
    };
    fetchRecommendations();
  }, [energyInfo?.category, userId]);

  const handleAddOrUpdateRecommendation = async () => {
    if (
      !editingRecommendation?.title?.trim() ||
      !editingRecommendation?.description?.trim()
    )
      return;

    try {
      if (isEditing) {
        await recommendationApi.update(
          editingRecommendation.id,
          editingRecommendation
        );
      } else {
        await recommendationApi.create(editingRecommendation); // ✅ Nur das Objekt übergeben
      }

      setIsEditing(false);
      setEditingRecommendation(null);

      const res = await recommendationApi.getAll(energyInfo.category);
      const backendRecs = res.data || [];
      const defaultRecs = defaultRecommendations[energyInfo.category] || [];
      setRecommendations([...defaultRecs, ...backendRecs]);
      
    } catch (err) {
      setError("Fehler beim Speichern");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await recommendationApi.delete(id);

      const res = await recommendationApi.getAll(energyInfo.category);
      setRecommendations(res.data || []);
    } catch (err) {
      setError("Fehler beim Löschen");
      console.error(err);
    }
  };

  const openEditModal = (rec) => {
    setIsEditing(true);
    setEditingRecommendation({
      ...rec,
      energyLevel: rec.energy_level || energyInfo.category, // 🔥 Fix!
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingRecommendation({
      title: "",
      description: "",
      type: "meditation",
      link: "",
      energyLevel: energyInfo.category,
    });
  };

  if (!energyInfo) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">
          Bitte Energie-Check ausfüllen, um Empfehlungen zu erhalten.
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600">{error}</div>}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-blue-600" />
          Deine Empfehlungen
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <Plus size={18} />
          Neue Empfehlung
        </button>
      </div>

      <p className="text-gray-600">
        Energie-Level:
        <span className={`ml-2 px-2 py-0.5 rounded-full ${energyInfo.color}`}>
          {energyInfo.text} (Level {energyInfo.level})
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md relative group"
          >
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(rec)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(rec.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {getIconForType(rec.type)}
              </div>
              <div>
                <h3 className="font-bold">{rec.title}</h3>
                <p className="text-sm text-gray-500">
                  {activityTypes.find((t) => t.value === rec.type)?.label}
                </p>
              </div>
            </div>
            <p className="text-gray-700">{rec.description}</p>
            {rec.link && (
              <a
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-blue-600 hover:underline"
              >
                Zum Angebot
              </a>
            )}
          </div>
        ))}
      </div>

      {editingRecommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {isEditing ? "Empfehlung bearbeiten" : "Neue Empfehlung"}
              </h3>
              <button
                onClick={() => setEditingRecommendation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Titel"
                value={editingRecommendation.title}
                onChange={(e) =>
                  setEditingRecommendation({
                    ...editingRecommendation,
                    title: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2"
              />
              <textarea
                placeholder="Beschreibung"
                value={editingRecommendation.description}
                onChange={(e) =>
                  setEditingRecommendation({
                    ...editingRecommendation,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2"
              />
              <select
                value={editingRecommendation.type}
                onChange={(e) =>
                  setEditingRecommendation({
                    ...editingRecommendation,
                    type: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2"
              >
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Link (optional)"
                value={editingRecommendation.link}
                onChange={(e) =>
                  setEditingRecommendation({
                    ...editingRecommendation,
                    link: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingRecommendation(null)}
                  className="px-4 py-2 border rounded-md text-gray-700"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddOrUpdateRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                >
                  <Save size={18} />
                  <span>{isEditing ? "Aktualisieren" : "Hinzufügen"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationsPage;
