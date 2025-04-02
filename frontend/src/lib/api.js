import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://3.124.116.208:3000/api";

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
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userProfile", JSON.stringify(response.data.profile));
    }
    return response.data;
  },

  registerWithEmail: async (email, password) => {
    const response = await api.post("/auth/register", { email, password });
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
  getAll: async () => api.get("/vision-items"),
  create: async (data) => api.post("/vision-items", data),
  update: async (id, data) => api.put(`/vision-items/${id}`, data),
  delete: async (id) => api.delete(`/vision-items/${id}`),
};

export const energyApi = {
  getAll: async () => api.get("/energy-entries"),
  create: async (data) => api.post("/energy-entries", data),
  delete: async (id) => api.delete(`/energy-entries/${id}`),
};

export const manifestationApi = {
  getAll: async () => api.get("/manifestations"),
  create: async (data) => api.post("/manifestations", data),
  update: async (id, data) => api.put(`/manifestations/${id}`, data),
  delete: async (id) => api.delete(`/manifestations/${id}`),
};

export const recommendationApi = {
  getAll: async (energyLevel) => api.get("/recommendations", { params: { energyLevel } }),
  create: async (data) => api.post("/recommendations", data),
  update: async (id, data) => api.put(`/recommendations/${id}`, data),
  delete: async (id) => api.delete(`/recommendations/${id}`),
  getEnergyEntries: async () => api.get("/energy-entries"),
};
