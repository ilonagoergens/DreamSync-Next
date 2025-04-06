import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  ListChecks,
  Briefcase,
  Heart,
  Users,
  Sparkles,
  Download,
  Move,
} from "lucide-react";
import { Rnd } from "react-rnd";
import { toPng } from "html-to-image";
import { visionApi } from "../lib/api";

function VisionBoardPage() {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedSection, setSelectedSection] = useState("career");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const fileInputRef = useRef(null);
  const visionBoardRef = useRef(null);
  const sectionRefs = useRef({});

  const sections = [
    { id: "career", title: "Karriere & Finanzen", icon: "Briefcase" },
    { id: "relationships", title: "Beziehungen & Liebe", icon: "Heart" },
    { id: "personal", title: "Persönliches Wachstum", icon: "Sparkles" },
    { id: "health", title: "Gesundheit & Wohlbefinden", icon: "Users" },
  ];

  // 🟢 Items aus DB laden
  useEffect(() => {
    async function loadItems() {
      try {
        const response = await visionApi.getAll();
        setItems(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Vision Board Items:", error);
      }
    }

    loadItems();
  }, []);

  const handleAddItem = async () => {
    if (!uploadedImage) return;

    const sectionElement = sectionRefs.current[selectedSection];
    let initialX = 10;
    let initialY = 10;

    if (sectionElement) {
      const sectionWidth = sectionElement.clientWidth - 150;
      const sectionHeight = sectionElement.clientHeight - 150;
      initialX = Math.max(0, Math.floor(Math.random() * sectionWidth));
      initialY = Math.max(0, Math.floor(Math.random() * sectionHeight));
    }

    const newItem = {
      image_url: uploadedImage,
      section: selectedSection,
      text: newItemText,
      width: 150,
      height: 150,
      x: initialX,
      y: initialY,
      zIndex: Math.max(0, ...items.map((i) => i.zIndex || 0)) + 1,
    };

    try {
      const response = await visionApi.create(newItem);
      setItems((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    } finally {
      setNewItemText("");
      setUploadedImage(null);
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await visionApi.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const updateItem = async (id, updates) => {
    try {
      const updatedItem = items.find((i) => i.id === id);
      if (!updatedItem) return;

      const newItem = { ...updatedItem, ...updates };
      await visionApi.update(id, {
        image_url: newItem.imageUrl || newItem.image_url,
        section: newItem.section,
        text: newItem.text,
        x: newItem.x ?? 0,
        y: newItem.y ?? 0,
        width: newItem.width ?? 150,
        height: newItem.height ?? 150,
        zIndex: newItem.zIndex ?? 0,
      });

      setItems((prev) => prev.map((i) => (i.id === id ? newItem : i)));
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
    }
  };

  const moveItemToSection = (id, targetSection) => {
    const sectionElement = sectionRefs.current[targetSection];
    let newX = 10;
    let newY = 10;

    if (sectionElement) {
      const width = 150;
      const height = 150;
      newX = Math.max(
        0,
        Math.floor(Math.random() * (sectionElement.clientWidth - width))
      );
      newY = Math.max(
        0,
        Math.floor(Math.random() * (sectionElement.clientHeight - height))
      );
    }

    updateItem(id, {
      section: targetSection,
      x: newX,
      y: newY,
      zIndex: Math.max(0, ...items.map((i) => i.zIndex || 0)) + 1,
    });
  };

  const downloadVisionBoard = async () => {
    if (!visionBoardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(visionBoardRef.current, {
        quality: 0.95,
        backgroundColor: "#f9fafb",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `vision-board-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Fehler beim Download:", err);
    }
    setIsDownloading(false);
  };

  const getIcon = (icon) => {
    switch (icon) {
      case "Briefcase":
        return <Briefcase size={16} />;
      case "Heart":
        return <Heart size={16} />;
      case "Users":
        return <Users size={16} />;
      case "Sparkles":
        return <Sparkles size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
        <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span> Mein Vision Board</span>

        </h2>
        <div className="flex gap-2">
          <button
            onClick={downloadVisionBoard}
            disabled={isDownloading || !items.length}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex gap-1 items-center"
          >
            <Download size={18} />
            {isDownloading ? "Herunterladen..." : "Herunterladen"}
          </button>
          <button
            onClick={() => setIsAddingItem(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex gap-1 items-center"
          >
            <Plus size={18} /> Neues Bild
          </button>
        </div>
      </div>

      <div
        ref={visionBoardRef}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {sections.map((sec) => (
          <div key={sec.id} className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex gap-2 items-center mb-2 text-sm text-gray-600">
              <div className="w-5 h-5">{getIcon(sec.icon)}</div>
              <span>{sec.title}</span>
            </div>
            <div
              ref={(el) => (sectionRefs.current[sec.id] = el)}
              className="relative min-h-[300px] bg-gray-50 rounded-lg overflow-hidden"
            >
              {items
                .filter((i) => i.section === sec.id)
                .map((item) => (
                  <Rnd
                    key={item.id}
                    default={{
                      x: item.x,
                      y: item.y,
                      width: item.width,
                      height: item.height,
                    }}
                    bounds="parent"
                    onDragStop={(e, d) =>
                      updateItem(item.id, { x: d.x, y: d.y })
                    }
                    onResizeStop={(e, dir, ref, delta, pos) =>
                      updateItem(item.id, {
                        width: parseInt(ref.style.width),
                        height: parseInt(ref.style.height),
                        x: pos.x,
                        y: pos.y,
                      })
                    }
                  >
                    <div className="relative w-full h-full group">
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover rounded shadow"
                      />
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-white rounded-full p-1 shadow"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedItemId(item.id)}
                          className="bg-white rounded-full p-1 shadow"
                        >
                          <Move size={14} />
                        </button>
                        {selectedItemId === item.id && (
                          <div className="absolute right-0 mt-6 bg-white shadow rounded z-50 text-sm">
                            {sections.map((target) => (
                              <button
                                key={target.id}
                                onClick={() =>
                                  moveItemToSection(item.id, target.id)
                                }
                                className="block px-3 py-2 hover:bg-gray-100 w-full text-left"
                              >
                                {getIcon(target.icon)} {target.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.text && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 rounded-b">
                          {item.text}
                        </div>
                      )}
                    </div>
                  </Rnd>
                ))}
            </div>
          </div>
        ))}
      </div>

      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Neues Bild hinzufügen</h3>
              <button onClick={() => setIsAddingItem(false)}>
                <X size={20} />
              </button>
            </div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Kurze Beschreibung (optional)"
              className="w-full border px-2 py-1 rounded"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="w-full"
            />
            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Vorschau"
                className="w-full h-40 object-cover rounded"
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingItem(false)}
                className="px-4 py-2 border rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={!uploadedImage}
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisionBoardPage;
