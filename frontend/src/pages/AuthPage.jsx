import React, { useState } from "react";
import { useAuthStore } from "../lib/auth";
import { useAppStore } from "../store";
import { energyApi, manifestationApi, visionApi } from "../lib/api";

function AuthPage() {
  const loginWithEmail = useAuthStore(state => state.loginWithEmail);
  const registerWithEmail = useAuthStore(state => state.registerWithEmail);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const authFn = isRegistering ? registerWithEmail : loginWithEmail;
      const res = await authFn(email, password);

        console.log("🔑 Login-Response:", res);

        const [energyRes, manifestationRes, visionRes] = await Promise.all([
          energyApi.getAll(),
          manifestationApi.getAll(),
          visionApi.getAll(),
        ]);

        useAppStore.setState({
          token: res.token,
          userId: res.userId,
          energyEntries: energyRes.data,
          manifestations: manifestationRes.data,
          visionItems: visionRes.data,
        });

        console.log("✅ Daten aus der DB geladen!");
    } catch (error) {
      console.error("❌ Auth-Fehler:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
          {isRegistering ? "Registrieren" : "Anmelden"}
        </h2>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isRegistering ? "Registrieren" : "Anmelden"}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          {isRegistering ? "Bereits einen Account?" : "Noch keinen Account?"}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:underline ml-1"
          >
            {isRegistering ? "Anmelden" : "Registrieren"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
