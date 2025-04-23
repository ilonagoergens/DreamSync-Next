import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend-app.thankfulgrass-a2fd0f75.westeurope.azurecontainerapps.io/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  loginWithEmail: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userProfile", JSON.stringify(response.data.profile));
    }
    return response.data;
  },

  registerWithEmail: async (email, password) => {
    const response = await api.post("/api/auth/register", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userProfile", JSON.stringify(response.data.profile));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userProfile");
  },
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API-Fehler:", error.response.data);
      if (error.response.status === 401) {
        console.warn("⚠️ Ungültiges Token! Nutzer wird ausgeloggt...");
        authApi.logout();
        window.location.href = "/login";
      }
    } else {
      console.error("❌ Server nicht erreichbar!", error.message);
    }
    return Promise.reject(error);
  }
);

export const visionApi = {
  getAll: async () => api.get("/api/vision-items"),
  create: async (data) => api.post("/api/vision-items", data),
  update: async (id, data) => api.put(`/api/vision-items/${id}`, data),
  delete: async (id) => api.delete(`/api/vision-items/${id}`),
};

export const energyApi = {
  getAll: async () => api.get("/api/energy-entries"),
  create: async (data) => api.post("/api/energy-entries", data),
  delete: async (id) => api.delete(`/api/energy-entries/${id}`),
};

export const manifestationApi = {
  getAll: async () => api.get("/api/manifestations"),
  create: async (data) => api.post("/api/manifestations", data),
  update: async (id, data) => api.put(`/api/manifestations/${id}`, data),
  delete: async (id) => api.delete(`/api/manifestations/${id}`),
};

export const recommendationApi = {
  getAll: async (energyLevel) => api.get("/api/recommendations", { params: { energyLevel } }),
  create: async (data) => api.post("/api/recommendations", data),
  update: async (id, data) => api.put(`/api/recommendations/${id}`, data),
  delete: async (id) => api.delete(`/api/recommendations/${id}`),
  getEnergyEntries: async () => api.get("/api/energy-entries"),
};
