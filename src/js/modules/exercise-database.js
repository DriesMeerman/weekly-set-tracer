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

      // Load from the JSON file
      const response = await fetch('/data/exercises.json');
      if (!response.ok) {
        throw new Error('Failed to load exercise database');
      }

      const data = await response.json();
      this.exercises = data.exercises;
      this.muscleGroups = data.muscleGroups;
      this.categories = data.categories;
      this.defaultTargets = data.defaultTargets;
      this.windowOptions = data.windowOptions;

      console.log(`✅ Loaded ${this.exercises.length} exercises from JSON`);

    } catch (error) {
      console.error('❌ Failed to load exercise database:', error);
      // Fallback to basic structure
      this.exercises = [
        {
          id: 'bench',
          name: 'bench',
          displayName: 'Bench Press',
          aliases: ['bench press', 'bench', 'chest press', 'barbell bench', 'flat bench'],
          muscleGroups: {
            'Chest': 1.0,
            'Triceps': 0.5,
            'Front Delts': 0.33
          },
          category: 'push',
          description: 'Compound chest exercise that primarily targets chest with secondary triceps and front deltoid activation',
          defaultReps: 8,
          defaultSets: 3,
          equipment: ['barbell', 'bench'],
          difficulty: 'intermediate'
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
      console.log('⚠️ Using fallback exercise data');
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

  getExerciseById(id) {
    return this.exercises.find(exercise => exercise.id === id);
  }

  searchExercises(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    this.exercises.forEach(exercise => {
      let score = 0;

      // Exact name match (highest priority)
      if (exercise.name === normalizedQuery) {
        score += 100;
      }

      // Display name contains query
      if (exercise.displayName.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }

      // Alias matches
      const aliasMatch = exercise.aliases.some(alias =>
        alias.toLowerCase().includes(normalizedQuery)
      );
      if (aliasMatch) {
        score += 30;
      }

      // Partial name match
      if (exercise.name.includes(normalizedQuery)) {
        score += 20;
      }

      // Description contains query
      if (exercise.description.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }

      // Enhanced muscle group search (higher priority)
      const muscleMatch = Object.keys(exercise.muscleGroups).some(muscle => {
        const muscleLower = muscle.toLowerCase();
        // Check if query matches muscle name exactly or partially
        if (muscleLower === normalizedQuery) {
          return true;
        }
        if (muscleLower.includes(normalizedQuery)) {
          return true;
        }
        // Check for common muscle abbreviations
        if (normalizedQuery === 'bi' && muscleLower.includes('bicep')) {
          return true;
        }
        if (normalizedQuery === 'tri' && muscleLower.includes('tricep')) {
          return true;
        }
        if (normalizedQuery === 'delts' && muscleLower.includes('delt')) {
          return true;
        }
        if (normalizedQuery === 'quads' && muscleLower.includes('quad')) {
          return true;
        }
        if (normalizedQuery === 'hams' && muscleLower.includes('hamstring')) {
          return true;
        }
        return false;
      });

      if (muscleMatch) {
        score += 25; // Increased priority for muscle group matches
      }

      // Category search
      if (exercise.category.toLowerCase().includes(normalizedQuery)) {
        score += 15;
      }

      if (score > 0) {
        results.push({ ...exercise, searchScore: score });
      }
    });

    // Sort by relevance score (highest first)
    return results.sort((a, b) => b.searchScore - a.searchScore).slice(0, 10);
  }

  searchByMuscleGroup(muscleGroup) {
    const normalizedMuscle = muscleGroup.toLowerCase().trim();
    return this.exercises.filter(exercise =>
      Object.keys(exercise.muscleGroups).some(muscle =>
        muscle.toLowerCase().includes(normalizedMuscle) ||
        (normalizedMuscle === 'bi' && muscle.toLowerCase().includes('bicep')) ||
        (normalizedMuscle === 'tri' && muscle.toLowerCase().includes('tricep')) ||
        (normalizedMuscle === 'delts' && muscle.toLowerCase().includes('delt')) ||
        (normalizedMuscle === 'quads' && muscle.toLowerCase().includes('quad')) ||
        (normalizedMuscle === 'hams' && muscle.toLowerCase().includes('hamstring'))
      )
    );
  }
}
