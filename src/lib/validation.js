// Validierung für Formulareingaben
export const validateInput = {
  required: (value) => {
    if (!value || value.trim() === '') {
      return 'Dieses Feld ist erforderlich';
    }
    return null;
  },

  minLength: (value, min) => {
    if (value && value.length < min) {
      return `Mindestens ${min} Zeichen erforderlich`;
    }
    return null;
  },

  maxLength: (value, max) => {
    if (value && value.length > max) {
      return `Maximal ${max} Zeichen erlaubt`;
    }
    return null;
  },

  url: (value) => {
    if (value) {
      try {
        new URL(value);
        return null;
      } catch {
        return 'Bitte geben Sie eine gültige URL ein';
      }
    }
    return null;
  },

  energyLevel: (value) => {
    const level = Number(value);
    if (isNaN(level) || level < 1 || level > 5) {
      return 'Energie-Level muss zwischen 1 und 5 liegen';
    }
    return null;
  },

  date: (value) => {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Ungültiges Datum';
    }
    
    if (date > new Date()) {
      return 'Datum kann nicht in der Zukunft liegen';
    }
    
    return null;
  },

  imageFile: (file) => {
    if (!file) return null;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Nur JPG, PNG und GIF Dateien sind erlaubt';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Datei darf nicht größer als 5MB sein';
    }

    return null;
  }
};

// Validierung für Zustandsänderungen
export const validateState = {
  boardItem: (item) => {
    const errors = {};

    if (!item.id) errors.id = 'ID ist erforderlich';
    if (!item.imageUrl) errors.imageUrl = 'Bild-URL ist erforderlich';
    if (!item.section) errors.section = 'Bereich ist erforderlich';
    
    if (item.text && item.text.length > 100) {
      errors.text = 'Text darf maximal 100 Zeichen lang sein';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  },

  energyEntry: (entry) => {
    const errors = {};

    if (!entry.id) errors.id = 'ID ist erforderlich';
    if (!entry.date) errors.date = 'Datum ist erforderlich';
    if (!entry.level) errors.level = 'Energie-Level ist erforderlich';
    
    const levelError = validateInput.energyLevel(entry.level);
    if (levelError) errors.level = levelError;

    const dateError = validateInput.date(entry.date);
    if (dateError) errors.date = dateError;

    if (entry.notes && entry.notes.length > 500) {
      errors.notes = 'Notizen dürfen maximal 500 Zeichen lang sein';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  },

  recommendation: (rec) => {
    const errors = {};

    if (!rec.id) errors.id = 'ID ist erforderlich';
    if (!rec.title) errors.title = 'Titel ist erforderlich';
    if (!rec.description) errors.description = 'Beschreibung ist erforderlich';
    if (!rec.type) errors.type = 'Typ ist erforderlich';
    if (!rec.energyLevel) errors.energyLevel = 'Energie-Level ist erforderlich';

    if (rec.title && rec.title.length > 100) {
      errors.title = 'Titel darf maximal 100 Zeichen lang sein';
    }

    if (rec.description && rec.description.length > 500) {
      errors.description = 'Beschreibung darf maximal 500 Zeichen lang sein';
    }

    if (rec.link) {
      const urlError = validateInput.url(rec.link);
      if (urlError) errors.link = urlError;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
};
