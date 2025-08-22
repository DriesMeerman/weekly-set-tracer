#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Exercise database schema
const exerciseSchema = {
  type: 'object',
  required: ['version', 'lastUpdated', 'exercises', 'categories', 'muscleGroups', 'defaultTargets', 'windowOptions'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    lastUpdated: { type: 'string' },
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'displayName', 'aliases', 'muscleGroups', 'category', 'description'],
        properties: {
          id: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          displayName: { type: 'string', minLength: 1 },
          aliases: { type: 'array', items: { type: 'string' }, minItems: 1 },
          muscleGroups: {
            type: 'object',
            additionalProperties: { type: 'number', minimum: 0, maximum: 2 }
          },
          category: { type: 'string', enum: ['push', 'pull', 'legs', 'core'] },
          description: { type: 'string', minLength: 10 }
        }
      }
    },
    categories: {
      type: 'object',
      required: ['push', 'pull', 'legs', 'core'],
      properties: {
        push: { type: 'string' },
        pull: { type: 'string' },
        legs: { type: 'string' },
        core: { type: 'string' }
      }
    },
    muscleGroups: {
      type: 'array',
      items: { type: 'string' },
      minItems: 13,
      maxItems: 13
    },
    defaultTargets: {
      type: 'object',
      required: ['min', 'max'],
      properties: {
        min: { type: 'number', minimum: 1, maximum: 50 },
        max: { type: 'number', minimum: 1, maximum: 50 }
      }
    },
    windowOptions: {
      type: 'array',
      items: { type: 'number', minimum: 1, maximum: 365 },
      minItems: 1
    }
  }
};

// Muscle group validation
const validMuscleGroups = [
  'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
  'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
];

function validateExerciseData(data) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(exerciseSchema);

  console.log('🔍 Validating exercise database...\n');

  // Validate against schema
  const isValid = validate(data);

  if (!isValid) {
    console.error('❌ Schema validation failed:');
    validate.errors.forEach(error => {
      console.error(`  - ${error.instancePath}: ${error.message}`);
    });
    return false;
  }

  console.log('✅ Schema validation passed');

  // Additional business logic validations
  let allValid = true;

  // Check if all muscle groups in exercises exist in the muscleGroups array
  const usedMuscleGroups = new Set();
  data.exercises.forEach(exercise => {
    Object.keys(exercise.muscleGroups).forEach(muscle => {
      usedMuscleGroups.add(muscle);
    });
  });

  const missingMuscleGroups = [...usedMuscleGroups].filter(muscle =>
    !data.muscleGroups.includes(muscle)
  );

  if (missingMuscleGroups.length > 0) {
    console.error(`❌ Exercises reference muscle groups not in muscleGroups array: ${missingMuscleGroups.join(', ')}`);
    allValid = false;
  }

  // Check if all muscle groups in the array are used
  const unusedMuscleGroups = data.muscleGroups.filter(muscle =>
    !usedMuscleGroups.has(muscle)
  );

  if (unusedMuscleGroups.length > 0) {
    console.warn(`⚠️  Unused muscle groups: ${unusedMuscleGroups.join(', ')}`);
  }

  // Check for duplicate exercise IDs
  const exerciseIds = data.exercises.map(e => e.id);
  const duplicateIds = exerciseIds.filter((id, index) => exerciseIds.indexOf(id) !== index);

  if (duplicateIds.length > 0) {
    console.error(`❌ Duplicate exercise IDs: ${duplicateIds.join(', ')}`);
    allValid = false;
  }

  // Check for duplicate exercise names
  const exerciseNames = data.exercises.map(e => e.name);
  const duplicateNames = exerciseNames.filter((name, index) => exerciseNames.indexOf(name) !== index);

  if (duplicateNames.length > 0) {
    console.error(`❌ Duplicate exercise names: ${duplicateNames.join(', ')}`);
    allValid = false;
  }

  // Check if default targets make sense
  if (data.defaultTargets.min >= data.defaultTargets.max) {
    console.error('❌ Default targets: min must be less than max');
    allValid = false;
  }

  // Check window options are reasonable
  if (data.windowOptions.some(w => w < 1 || w > 365)) {
    console.error('❌ Window options must be between 1 and 365 days');
    allValid = false;
  }

  if (allValid) {
    console.log('✅ All validations passed');
    console.log(`📊 Database contains ${data.exercises.length} exercises`);
    console.log(`💪 Covers ${data.muscleGroups.length} muscle groups`);
    console.log(`🎯 Default targets: ${data.defaultTargets.min}-${data.defaultTargets.max} sets`);
    console.log(`📅 Window options: ${data.windowOptions.join(', ')} days`);
  }

  return allValid;
}

function main() {
  try {
    const dataPath = path.join(__dirname, '../src/data/exercises.json');

    if (!fs.existsSync(dataPath)) {
      console.error('❌ Exercise database file not found:', dataPath);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (validateExerciseData(data)) {
      console.log('\n🎉 Exercise database is valid and ready to use!');
      process.exit(0);
    } else {
      console.log('\n❌ Exercise database validation failed. Please fix the issues above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error validating exercise database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateExerciseData };
