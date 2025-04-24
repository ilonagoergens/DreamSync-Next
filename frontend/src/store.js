import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// API-Funktion für Backend-Requests
const apiFetch = async (url, method = "GET", body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorMessage = await response.json().catch(() => response.statusText);
      throw new Error(`Fehler: ${errorMessage.error || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("❌ API-Fehler:", error);
    throw error;
  }
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      userId: null,
      token: null,

      setUserId: async (id, token) => {
        if (!id || !token) {
          console.warn("⚠️ Kein Benutzer oder Token vorhanden. Logout...");
          set({ userId: null, token: null, items: [], energyEntries: [], manifestations: [] });
          return;
        }

        console.log("✅ Benutzer authentifiziert:", id);
        set({ userId: id, token });

        try {
          const data = await apiFetch(`/users/${id}/data`, "GET", null, token);
          set({
            energyEntries: data.energyEntries || [],
            manifestations: data.manifestations || [],
            items: data.visionItems || [],
          });
        } catch (error) {
          console.error("❌ Fehler beim Laden der Benutzerdaten:", error);
        }
      },

      logout: () => {
        console.log("👋 Logout durchgeführt.");
        set({ userId: null, token: null, items: [], energyEntries: [], manifestations: [] });
        localStorage.removeItem("token");
      },

      items: [],
      addItem: async (item) => {
        const userId = get().userId;
        const token = get().token || localStorage.getItem("token");
        if (!userId || !token) return;

        try {
          const savedItem = await apiFetch("/vision-items", "POST", { ...item, user_id: userId }, token);
          set((state) => ({ items: [...state.items, savedItem] }));
        } catch (error) {
          console.error("❌ Fehler beim Speichern des Items:", error);
        }
      },

      removeItem: async (itemId) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          await apiFetch(`/vision-items/${itemId}`, "DELETE", null, get().token);
          set((state) => ({ items: state.items.filter((item) => item.id !== itemId) }));
        } catch (error) {
          console.error("❌ Fehler beim Löschen des Items:", error);
        }
      },

      energyEntries: [],
      addEnergyEntry: async (entry) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const savedEntry = await apiFetch("/energy-entries", "POST", { ...entry, user_id: userId }, get().token);
          set((state) => ({ energyEntries: [...state.energyEntries, savedEntry] }));
        } catch (error) {
          console.error("❌ Fehler beim Speichern des Energie-Eintrags:", error);
        }
      },

      removeEnergyEntry: async (id) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          await apiFetch(`/energy-entries/${id}`, "DELETE", null, get().token);
          console.log("✅ Energie-Eintrag erfolgreich gelöscht (Frontend):", id);
          set((state) => ({ energyEntries: state.energyEntries.filter((entry) => entry.id !== id) }));
        } catch (error) {
          console.error("❌ Fehler beim Löschen des Energie-Eintrags:", error);
        }
      },

      manifestations: [],
      addManifestation: async (manifestation) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const savedManifestation = await apiFetch("/manifestations", "POST", { ...manifestation, user_id: userId }, get().token);
          set((state) => ({ manifestations: [...state.manifestations, savedManifestation] }));
        } catch (error) {
          console.error("❌ Fehler beim Speichern der Manifestation:", error);
        }
      },

      updateManifestation: async (id, updates) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          const updated = await apiFetch(`/manifestations/${id}`, "PUT", updates, get().token);
          set((state) => ({
            manifestations: state.manifestations.map((m) => (m.id === id ? updated : m))
          }));
        } catch (error) {
          console.error("❌ Fehler beim Aktualisieren der Manifestation:", error);
        }
      },

      toggleManifestationComplete: async (id) => {
        const state = get();
        const manifestation = state.manifestations.find((m) => m.id === id);
        if (!manifestation) return;

        const updated = { ...manifestation, completed: !manifestation.completed };
        await get().updateManifestation(id, updated);
      },

      removeManifestation: async (id) => {
        const userId = get().userId;
        if (!userId) return;

        try {
          await apiFetch(`/manifestations/${id}`, "DELETE", null, get().token);
          set((state) => ({ manifestations: state.manifestations.filter((m) => m.id !== id) }));
        } catch (error) {
          console.error("❌ Fehler beim Löschen der Manifestation:", error);
        }
      },
    }),
    {
      name: "vision-board-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        userId: state.userId,
        energyEntries: state.energyEntries,
        manifestations: state.manifestations,
        items: state.items,
      }),
    }
  )
);