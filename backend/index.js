import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { generateToken, authMiddleware } from "./auth.js";
import { initializeDatabase, getDatabase, closeDatabase, createVisionItem, updateVisionItem, deleteVisionItem } from "./database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let server;

const allowedOrigins =
   ['https://www.dreamsync.pro']

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function startServer() {
  try {
    await initializeDatabase();
    console.log("✅ Datenbank erfolgreich initialisiert");

    const app = express();

    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);

          } else {
            console.log("❌ Nicht erlaubter Origin:", origin);
            callback(new Error("Nicht erlaubter Origin"));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    app.use(express.json({ limit: "10mb" }));

    // 🔐 Auth Routes
    app.post("/api/auth/register", async (req, res) => {
      try {
        const { email, password } = req.body;
        const db = await getDatabase();

        const existingUser = await db.execute({
          sql: "SELECT * FROM users WHERE email = ?",
          args: [email],
        });

        if (existingUser.rows.length > 0) {
          return res
            .status(400)
            .json({ error: "E-Mail-Adresse wird bereits verwendet" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = generateUUID();

        await db.execute({
          sql: "INSERT INTO users (id, email, password) VALUES (?, ?, ?)",
          args: [userId, email, hashedPassword],
        });

        const token = generateToken(userId);
        res.json({
          token,
          userId,
          profile: { email, name: email.split("@")[0] },
        });
      } catch (error) {
        console.error("❌ Registrierungsfehler:", error);
        res.status(500).json({ error: "Registrierung fehlgeschlagen" });
      }
    });

    app.post("/api/auth/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const db = await getDatabase();

        const result = await db.execute({
          sql: "SELECT * FROM users WHERE email = ?",
          args: [email],
        });

        if (result.rows.length === 0) {
          return res.status(401).json({ error: "Ungültige Anmeldedaten" });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return res.status(401).json({ error: "Ungültige Anmeldedaten" });
        }

        const token = generateToken(user.id);

        res.json({
          token,
          userId: user.id,
          profile: {
            email: user.email,
            name: user.name || email.split("@")[0],
          },
        });
      } catch (error) {
        console.error("❌ Login-Fehler:", error);
        res.status(500).json({ error: "Anmeldung fehlgeschlagen" });
      }
    });

    // 🔄 Energie-Einträge abrufen
    app.get("/api/energy-entries", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;

        const result = await db.execute({
          sql: "SELECT * FROM energy_entries WHERE user_id = ? ORDER BY date DESC",
          args: [userId],
        });

        res.json(result.rows);
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Energie-Einträge:", error);
        res
          .status(500)
          .json({ error: "Einträge konnten nicht geladen werden" });
      }
    });

    app.post("/api/energy-entries", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { level, notes, date } = req.body;

        console.log("➡️ Anfrage zum Speichern:", {
          userId,
          level,
          notes,
          date,
        });

        const id = generateUUID();
        const entryDate = date || new Date().toISOString().split('T')[0];


        await db.execute({
          sql: "INSERT INTO energy_entries (id, user_id, level, notes, date) VALUES (?, ?, ?, ?, ?)",
          args: [id, userId, level, notes || "", entryDate],
        });

        res.status(201).json({ id, userId, level, notes, date: entryDate });
      } catch (error) {
        console.error("❌ Fehler beim Speichern des Energie-Eintrags:", error);
        res.status(500).json({ error: error.message || "Unbekannter Fehler" });
      }
    });

    app.delete("/api/energy-entries/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;
    
        // Eintrag in der Datenbank löschen
        await db.execute({
          sql: "DELETE FROM energy_entries WHERE id = ? AND user_id = ?",
          args: [id, userId],
        });
    
        res.json({ success: true });
      } catch (error) {
        console.error("❌ Fehler beim Löschen des Energie-Eintrags:", error);
        res.status(500).json({ error: "Eintrag konnte nicht gelöscht werden" });
      }
    });
    

    // 🔄 Manifestationen abrufen
    app.get("/api/manifestations", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;

        const result = await db.execute({
          sql: "SELECT * FROM manifestations WHERE user_id = ? ORDER BY date DESC",
          args: [userId],
        });

        res.json(result.rows);
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Manifestationen:", error);
        res
          .status(500)
          .json({ error: "Manifestationen konnten nicht geladen werden" });
      }
    });

    // 🆕 Manifestation aktualisieren
    app.put("/api/manifestations/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;
        const { text, category, notes, date, completed } = req.body;

        await db.execute({
          sql: "UPDATE manifestations SET text = ?, category = ?, notes = ?, date = ?, completed = ? WHERE id = ? AND user_id = ?",
          args: [text, category, notes, date, completed, id, userId],
        });

        res.json({ id, text, category, notes, date, completed });
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren der Manifestation:", error);
        res
          .status(500)
          .json({ error: "Manifestation konnte nicht aktualisiert werden" });
      }
    });

    // 🆕 Manifestation löschen
    app.delete("/api/manifestations/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;

        await db.execute({
          sql: "DELETE FROM manifestations WHERE id = ? AND user_id = ?",
          args: [id, userId],
        });

        res.json({ success: true });
      } catch (error) {
        console.error("❌ Fehler beim Löschen der Manifestation:", error);
        res
          .status(500)
          .json({ error: "Manifestation konnte nicht gelöscht werden" });
      }
    });

    // 🔄 Manifestation erstellen
    app.post("/api/manifestations", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { text, category, notes } = req.body;

        const id = generateUUID();
        const date = new Date().toISOString();

        await db.execute({
          sql: "INSERT INTO manifestations (id, user_id, text, category, notes, date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [id, userId, text, category, notes || "", date, false],
        });

        res.json({ id, userId, text, category, notes, date, completed: false });
      } catch (error) {
        console.error("❌ Fehler beim Speichern der Manifestation:", error);
        res
          .status(500)
          .json({ error: "Manifestation konnte nicht gespeichert werden" });
      }
    });

    // 🔄 Vision Board abrufen
    app.get("/api/vision-items", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;

        const result = await db.execute({
          sql: "SELECT * FROM vision_items WHERE user_id = ?",
          args: [userId],
        });

        res.json(result.rows);
      } catch (error) {
        console.error("❌ Fehler beim Abrufen der Vision Items:", error);
        res
          .status(500)
          .json({ error: "Vision Items konnten nicht geladen werden" });
      }
    });

    app.post("/api/vision-items", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const {
          image_url, section, text, x, y, width, height, zIndex
        } = req.body;
    
        const id = generateUUID();
        const item = {
          id,
          userId,
          imageUrl: image_url,
          section,
          text,
          x,
          y,
          width,
          height,
          zIndex
        };
    
        await createVisionItem(item);
        res.status(201).json({ ...item, image_url });
      } catch (error) {
        console.error("❌ Fehler beim Erstellen eines Vision-Items:", error);
        res.status(500).json({ error: "Vision Item konnte nicht erstellt werden" });
      }
    });

    app.put("/api/vision-items/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;
        const {
          image_url, section, text, x, y, width, height, zIndex
        } = req.body;
    
        const updates = {
          imageUrl: image_url,
          section,
          text,
          x,
          y,
          width,
          height,
          zIndex
        };
    
        const updated = await updateVisionItem(id, userId, updates);
        res.json({ ...updated, image_url });
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren des Vision-Items:", error);
        res.status(500).json({ error: "Vision Item konnte nicht aktualisiert werden" });
      }
    });
    
    app.delete("/api/vision-items/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;
    
        await deleteVisionItem(id, userId);
        res.json({ success: true });
      } catch (error) {
        console.error("❌ Fehler beim Löschen des Vision-Items:", error);
        res.status(500).json({ error: "Vision Item konnte nicht gelöscht werden" });
      }
    });
    
    

    // 🔄 Empfehlungen abrufen
    app.get("/api/recommendations", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { energyLevel } = req.query;

        const result = await db.execute({
          sql: "SELECT * FROM recommendations WHERE user_id = ? AND energy_level = ?",
          args: [userId, energyLevel],
        });

        res.json(result.rows);
      } catch (error) {
        console.error("❌ Fehler beim Laden der Empfehlungen:", error);
        res
          .status(500)
          .json({ error: "Empfehlungen konnten nicht geladen werden" });
      }
    });

    // 🆕 Alle Daten abrufen
    app.get("/api/users/:userId/data", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.params.userId;

        const [energyEntries, manifestations, visionItems] = await Promise.all([
          db.execute({
            sql: "SELECT * FROM energy_entries WHERE user_id = ? ORDER BY date DESC",
            args: [userId],
          }),
          db.execute({
            sql: "SELECT * FROM manifestations WHERE user_id = ? ORDER BY date DESC",
            args: [userId],
          }),
          db.execute({
            sql: "SELECT * FROM vision_items WHERE user_id = ?",
            args: [userId],
          }),
        ]);

        res.json({
          energyEntries: energyEntries.rows,
          manifestations: manifestations.rows,
          visionItems: visionItems.rows,
        });
      } catch (error) {
        console.error("❌ Fehler beim Laden der Gesamtdaten:", error);
        res
          .status(500)
          .json({ error: "Benutzerdaten konnten nicht geladen werden" });
      }
    });

    // 🆕 Neue Empfehlung erstellen
    app.post("/api/recommendations", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { title, description, type, link, energyLevel } = req.body;

        const id = generateUUID();
        const date = new Date().toISOString();

        await db.execute({
          sql: `INSERT INTO recommendations (id, user_id, title, description, type, link, energy_level, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            id,
            userId,
            title,
            description,
            type,
            link || "",
            energyLevel,
            date,
          ],
        });

        res.status(201).json({
          id,
          userId,
          title,
          description,
          type,
          link,
          energyLevel,
          createdAt: date,
        });
      } catch (error) {
        console.error("❌ Fehler beim Erstellen der Empfehlung:", error);
        res
          .status(500)
          .json({ error: "Empfehlung konnte nicht erstellt werden" });
      }
    });

    // 🆙 Empfehlung aktualisieren
    app.put("/api/recommendations/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, description, type, link, energyLevel } = req.body;

        await db.execute({
          sql: `UPDATE recommendations 
            SET title = ?, description = ?, type = ?, link = ?, energy_level = ? 
            WHERE id = ? AND user_id = ?`,
          args: [title, description, type, link || "", energyLevel, id, userId],
        });

        res.json({ success: true });
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren der Empfehlung:", error);
        res
          .status(500)
          .json({ error: "Empfehlung konnte nicht aktualisiert werden" });
      }
    });

    // ❌ FEHLTE NOCH: Empfehlung löschen
    app.delete("/api/recommendations/:id", authMiddleware, async (req, res) => {
      try {
        const db = await getDatabase();
        const userId = req.user.userId;
        const { id } = req.params;

        await db.execute({
          sql: "DELETE FROM recommendations WHERE id = ? AND user_id = ?",
          args: [id, userId],
        });

        res.json({ success: true });
      } catch (error) {
        console.error("❌ Fehler beim Löschen der Empfehlung:", error);
        res
          .status(500)
          .json({ error: "Empfehlung konnte nicht gelöscht werden" });
      }
    });

    const PORT = process.env.PORT || 3000;
    server = app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
    });

    async function shutdown() {
      console.log("⚠️ Server wird heruntergefahren...");
      if (server) await new Promise((resolve) => server.close(resolve));
      try {
        await closeDatabase();
        console.log("✅ Datenbankverbindung geschlossen");
      } catch (err) {
        console.error("❌ Fehler beim Schließen der Datenbank:", err);
      }
      process.exit(0);
    }

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
      shutdown();
    });
  } catch (error) {
    console.error("❌ Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
}

console.log("🚀 Server-Config:");
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✔️ (gesetzt)" : "❌ (NICHT gesetzt!)"
);
console.log("PORT:", process.env.PORT);
console.log("VITE_API_URL:", process.env.VITE_API_URL);

startServer();
