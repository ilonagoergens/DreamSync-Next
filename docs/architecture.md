# DreamSync App - Architektur & Funktionsweise

## 1. Technologie-Stack

### Frontend
- React 18 mit TypeScript
- Vite als Build-Tool
- Tailwind CSS für Styling
- Lucide React für Icons
- Zustand für State Management

### Datenspeicherung
- localStorage für persistente Datenspeicherung
- Keine externe Datenbank erforderlich

## 2. Kernkomponenten

### Vision Board
- Drag & Drop Funktionalität mit @dnd-kit
- Bildupload und -verwaltung
- Kategorisierung in Lebensbereiche
- Responsive Grid-Layout

### Energie-Tracking
- Tägliche Energie-Level Erfassung (1-5)
- Visualisierung mit Charts
- Trend-Analyse
- Notizen-Funktion

### Ziel-Tracking
- Manifestations-Tracker
- Status-Management (aktiv/abgeschlossen)
- Fortschrittsanzeige
- Kategorisierung

### Empfehlungen
- Personalisierte Vorschläge basierend auf Energie-Level
- Verschiedene Aktivitätstypen (Meditation, Sport, etc.)
- Anpassbare Empfehlungen
- Link-Integration für externe Ressourcen

## 3. Datenstruktur

### Vision Board Items
```typescript
interface BoardItem {
  id: string;
  imageUrl: string;
  section: string;
  text?: string;
  position: {x: number, y: number};
  size: {width: number, height: number};
}
```

### Energie-Einträge
```typescript
interface EnergyEntry {
  id: string;
  date: string;
  level: number; // 1-5
  notes: string;
}
```

### Manifestationen/Ziele
```typescript
interface Manifestation {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}
```

### Empfehlungen
```typescript
interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'music' | 'breathing' | etc;
  energyLevel: 'low' | 'medium' | 'high';
  link?: string;
}
```

## 4. User Tracking

### Erfasste Metriken
- Seitenaufrufe und Ladezeiten
- Button-Klicks mit Kontext
- Scroll-Tiefe
- Nutzerinteraktionen

### Export-Formate
- CSV-Export für alle Tracking-Daten
- Separate Dateien für verschiedene Metriken
- Kompatibel mit Analyse-Tools

## 5. Features

### Datenpersistenz
- Automatische Speicherung in localStorage
- Import/Export-Funktionalität
- Daten-Backup-Möglichkeit

### Dark Mode
- System-Präferenz-Erkennung
- Manuelles Umschalten
- Persistente Einstellung

### Responsive Design
- Mobile-First Ansatz
- Adaptive Layouts
- Touch-optimierte Interaktionen

### Performance
- Lazy Loading für Komponenten
- Optimierte Bildverarbeitung
- Effizientes State Management

## 6. Erweiterbarkeit

### Modular aufgebaut
- Komponenten-basierte Architektur
- Wiederverwendbare UI-Elemente
- Einfache Integration neuer Features

### Zukunftssicher
- TypeScript für Type-Safety
- Moderne React-Patterns
- Skalierbare Struktur

## 7. Sicherheit

### Datenschutz
- Lokale Datenspeicherung
- Keine Server-Kommunikation
- Keine persönlichen Daten erforderlich

### Robustheit
- Error Boundaries
- Datenvalidierung
- Sichere Bildverarbeitung