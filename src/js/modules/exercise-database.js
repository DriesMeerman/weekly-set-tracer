// Exercise Database Module
// Handles loading and managing exercise data from JSON files

export class ExerciseDatabase {
  constructor() {
    this.exercises = [];
    this.muscleGroups = [];
    this.categories = {};
    this.defaultTargets = { min: 10, max: 15 };
    this.windowOptions = [3, 7, 14, 28];
  }

  async init() {
    try {
      console.log('📚 Loading exercise database...');

      // In a real app, this would load from the JSON file
      // For now, we'll use a basic structure
      this.exercises = [
        {
          id: 'bench',
          name: 'bench',
          displayName: 'Bench Press',
          aliases: ['bench press', 'bench', 'chest press'],
          muscleGroups: {
            'Chest': 1.0,
            'Triceps': 0.5,
            'Front Delts': 0.33
          },
          category: 'push',
          description: 'Compound chest exercise'
        }
      ];

      this.muscleGroups = [
        'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
        'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
      ];

      this.categories = {
        push: 'Exercises that involve pushing movements',
        pull: 'Exercises that involve pulling movements',
        legs: 'Exercises that primarily target lower body muscles',
        core: 'Exercises that target abdominal and core muscles'
      };

      console.log(`✅ Loaded ${this.exercises.length} exercises`);

    } catch (error) {
      console.error('❌ Failed to load exercise database:', error);
      throw error;
    }
  }

  getExerciseByName(name) {
    const normalizedName = name.toLowerCase().trim();

    return this.exercises.find(exercise =>
      exercise.name === normalizedName ||
      exercise.aliases.some(alias => alias.toLowerCase() === normalizedName)
    );
  }

  getMuscleGroups() {
    return [...this.muscleGroups];
  }

  getCategories() {
    return { ...this.categories };
  }

  getDefaultTargets() {
    return { ...this.defaultTargets };
  }

  getWindowOptions() {
    return [...this.windowOptions];
  }

  getAllExercises() {
    return [...this.exercises];
  }
}
