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
        throw new Error(`Failed to load exercise database: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.error('❌ First 200 characters of response:', text.substring(0, 200));
        throw new Error(`Invalid JSON format: ${parseError.message}`);
      }

      // Validate required fields
      if (!data.exercises || !Array.isArray(data.exercises)) {
        throw new Error('Invalid exercise database: missing or invalid exercises array');
      }

      this.exercises = data.exercises;
      this.muscleGroups = data.muscleGroups || [];
      this.categories = data.categories || {};
      this.defaultTargets = data.defaultTargets || { min: 10, max: 15 };
      this.windowOptions = data.windowOptions || [3, 7, 14, 28];

      console.log(`✅ Loaded ${this.exercises.length} exercises from JSON`);
      console.log(`💪 Muscle groups: ${this.muscleGroups.length}`);
      console.log(`📂 Categories: ${Object.keys(this.categories).length}`);

    } catch (error) {
      console.error('❌ Failed to load exercise database:', error);
      // Don't use fallback data - let the error bubble up to the UI
      throw new Error(`Failed to load exercise database: ${error.message}`);
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
