// Training Tracker Module
// Handles training data, calculations, and storage

export class TrainingTracker {
  constructor() {
    this.trainingDays = new Map();
    this.storageKey = 'sbm_training_days';
  }

  async init() {
    try {
      console.log('📊 Initializing training tracker...');
      this.loadFromStorage();
      console.log('✅ Training tracker initialized');
    } catch (error) {
      console.error('❌ Failed to initialize training tracker:', error);
      throw error;
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.trainingDays = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load training data from storage:', error);
    }
  }

  saveToStorage() {
    try {
      const data = Object.fromEntries(this.trainingDays);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save training data to storage:', error);
    }
  }

    async addExerciseEntry(exercise, sets, reps, weight, date) {
    const dateKey = this.formatDate(date);

    if (!this.trainingDays.has(dateKey)) {
      this.trainingDays.set(dateKey, {
        id: dateKey,
        note: '',
        entries: []
      });
    }

    const day = this.trainingDays.get(dateKey);

    // Calculate muscle group allocations based on exercise
    const muscleSets = {};
    Object.entries(exercise.muscleGroups).forEach(([muscle, allocation]) => {
      muscleSets[muscle] = sets * allocation;
    });

    const entry = {
      id: `e_${Date.now()}`,
      type: 'exercise',
      exerciseId: exercise.id,
      exerciseName: exercise.displayName,
      sets,
      reps,
      weight,
      muscleSets,
      timestamp: Date.now()
    };

    day.entries.push(entry);
    this.saveToStorage();
  }



  async updateDayNote(date, note) {
    const dateKey = this.formatDate(date);

    if (!this.trainingDays.has(dateKey)) {
      this.trainingDays.set(dateKey, {
        id: dateKey,
        note: '',
        entries: []
      });
    }

    const day = this.trainingDays.get(dateKey);
    day.note = note;
    this.saveToStorage();
  }

  async getMuscleTotals(endDate, windowDays) {
    const totals = {};
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - windowDays + 1);

    // Initialize totals for all muscle groups
    const muscleGroups = [
      'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
      'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
    ];

    muscleGroups.forEach(muscle => {
      totals[muscle] = 0;
    });

    // Calculate totals for the window
    for (const [dateKey, day] of this.trainingDays) {
      const dayDate = new Date(dateKey);
      if (dayDate >= startDate && dayDate <= endDate) {
        day.entries.forEach(entry => {
          Object.entries(entry.muscleSets).forEach(([muscle, sets]) => {
            if (totals.hasOwnProperty(muscle)) {
              totals[muscle] += sets;
            }
          });
        });
      }
    }

    return totals;
  }

  async getDayData(date) {
    const dateKey = this.formatDate(date);
    return this.trainingDays.get(dateKey) || {
      id: dateKey,
      note: '',
      entries: []
    };
  }

  async getTrainingHistory() {
    return Array.from(this.trainingDays.values())
      .sort((a, b) => new Date(b.id) - new Date(a.id));
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
}
