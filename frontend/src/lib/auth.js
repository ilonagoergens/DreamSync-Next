import { create } from 'zustand';
import { authApi } from '../lib/api';

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'),

  loginWithEmail: async (email, password) => {
    console.log("➡️ loginWithEmail im Store aufgerufen mit:", email, password); 
    try {
      const data = await authApi.loginWithEmail(email, password);
      console.log("⬅️ API-Response in loginWithEmail:", data);
      if (!data?.token || !data?.userId || !data?.profile) {
        throw new Error('Ungültige Anmeldedaten');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userProfile', JSON.stringify(data.profile));

      set({
        isAuthenticated: true,
        userId: data.userId,
        userProfile: data.profile,
      });
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Anmeldung fehlgeschlagen');
    }
  },

  registerWithEmail: async (email, password) => {
    try {
      const data = await authApi.registerWithEmail(email, password);
      if (!data?.token || !data?.userId || !data?.profile) {
        throw new Error('Registrierung fehlgeschlagen');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userProfile', JSON.stringify(data.profile));

      set({
        isAuthenticated: true,
        userId: data.userId,
        userProfile: data.profile,
      });
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registrierung fehlgeschlagen');
    }
  },

  logout: () => {
    authApi.logout();
    localStorage.clear();
    set({ isAuthenticated: false, userId: null, userProfile: null });
  },
}));