#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const muscleGroups = [
  'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
  'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
];

const categories = ['push', 'pull', 'legs', 'core'];

async function addExercise() {
  console.log('🏋️  Add New Exercise to Database\n');

  try {
    // Load existing data
    const dataPath = path.join(__dirname, '../src/data/exercises.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Get exercise details
    const id = await question('Exercise ID (lowercase, no spaces): ');
    const name = await question('Exercise name (lowercase, no spaces): ');
    const displayName = await question('Display name (human readable): ');

    // Get aliases
    const aliasesInput = await question('Aliases (comma-separated): ');
    const aliases = aliasesInput.split(',').map(a => a.trim()).filter(a => a);

    // Get muscle group allocations
    console.log('\n💪 Muscle Group Allocations:');
    console.log('Enter the allocation factor for each muscle group (0 = none, 1.0 = primary, 0.5 = secondary, etc.)');
    console.log('Press Enter to skip muscle groups you don\'t want to target\n');

    const muscleGroupsAllocation = {};

    for (const muscle of muscleGroups) {
      const allocation = await question(`${muscle}: `);
      if (allocation && allocation.trim() !== '') {
        const value = parseFloat(allocation);
        if (isNaN(value) || value < 0 || value > 2) {
          console.log(`⚠️  Invalid allocation for ${muscle}, skipping...`);
          continue;
        }
        muscleGroupsAllocation[muscle] = value;
      }
    }

    // Get category
    console.log('\n📂 Categories:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat} - ${data.categories[cat]}`);
    });

    let category;
    while (!category) {
      const categoryInput = await question('Select category (1-4): ');
      const categoryIndex = parseInt(categoryInput) - 1;
      if (categoryIndex >= 0 && categoryIndex < categories.length) {
        category = categories[categoryIndex];
      } else {
        console.log('❌ Invalid category selection. Please choose 1-4.');
      }
    }

    // Get description
    const description = await question('Description (min 10 characters): ');

    // Validate inputs
    if (description.length < 10) {
      throw new Error('Description must be at least 10 characters long');
    }

    if (Object.keys(muscleGroupsAllocation).length === 0) {
      throw new Error('At least one muscle group must be targeted');
    }

    // Check for duplicates
    if (data.exercises.some(e => e.id === id)) {
      throw new Error(`Exercise with ID "${id}" already exists`);
    }

    if (data.exercises.some(e => e.name === name)) {
      throw new Error(`Exercise with name "${name}" already exists`);
    }

    // Create new exercise
    const newExercise = {
      id,
      name,
      displayName,
      aliases,
      muscleGroups: muscleGroupsAllocation,
      category,
      description
    };

    // Show preview
    console.log('\n📝 Exercise Preview:');
    console.log(JSON.stringify(newExercise, null, 2));

    const confirm = await question('\n✅ Add this exercise? (y/N): ');

    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      // Add to database
      data.exercises.push(newExercise);

      // Update last updated timestamp
      data.lastUpdated = new Date().toISOString().split('T')[0];

      // Sort exercises alphabetically by display name
      data.exercises.sort((a, b) => a.displayName.localeCompare(b.displayName));

      // Write back to file
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      console.log('\n🎉 Exercise added successfully!');
      console.log(`📊 Total exercises: ${data.exercises.length}`);

      // Validate the updated database
      console.log('\n🔍 Validating updated database...');
      const { validateExerciseData } = require('./validate-data.js');
      validateExerciseData(data);

    } else {
      console.log('❌ Exercise not added.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  try {
    await addExercise();
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addExercise };
