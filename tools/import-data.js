#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function importExerciseData() {
  console.log('📥 Import Exercise Data\n');

  try {
    // Get import file path
    const importPath = await question('Path to import file: ');

    if (!fs.existsSync(importPath)) {
      throw new Error(`Import file not found: ${importPath}`);
    }

    // Load import data
    let importData;
    try {
      const fileContent = fs.readFileSync(importPath, 'utf8');
      importData = JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to parse import file: ${error.message}`);
    }

    // Load existing data
    const dataPath = path.join(__dirname, '../src/data/exercises.json');
    const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('\n📊 Import Summary:');
    console.log(`- Import file: ${path.basename(importPath)}`);
    console.log(`- Import exercises: ${importData.exercises?.length || 0}`);
    console.log(`- Existing exercises: ${existingData.exercises.length}`);

    // Validate import data structure
    if (!importData.exercises || !Array.isArray(importData.exercises)) {
      throw new Error('Import file must contain an exercises array');
    }

    // Check for conflicts
    const conflicts = [];
    const newExercises = [];

    importData.exercises.forEach(importExercise => {
      const existingExercise = existingData.exercises.find(e => e.id === importExercise.id);

      if (existingExercise) {
        conflicts.push({
          id: importExercise.id,
          existing: existingExercise.displayName,
          imported: importExercise.displayName
        });
      } else {
        newExercises.push(importExercise);
      }
    });

    // Show conflicts
    if (conflicts.length > 0) {
      console.log('\n⚠️  Conflicts detected:');
      conflicts.forEach(conflict => {
        console.log(`  - ${conflict.id}: "${conflict.existing}" vs "${conflict.imported}"`);
      });

      const resolveConflicts = await question('\nResolve conflicts by replacing existing exercises? (y/N): ');

      if (resolveConflicts.toLowerCase() !== 'y' && resolveConflicts.toLowerCase() !== 'yes') {
        console.log('❌ Import cancelled due to conflicts.');
        return;
      }
    }

    // Show new exercises
    if (newExercises.length > 0) {
      console.log('\n🆕 New exercises to add:');
      newExercises.forEach(exercise => {
        console.log(`  - ${exercise.displayName} (${exercise.id})`);
      });
    }

    // Confirm import
    const confirm = await question('\n✅ Proceed with import? (y/N): ');

    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Import cancelled.');
      return;
    }

    // Backup existing data
    const backupPath = path.join(__dirname, `../backups/exercises-backup-${Date.now()}.json`);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, JSON.stringify(existingData, null, 2));
    console.log(`💾 Backup created: ${path.relative(process.cwd(), backupPath)}`);

    // Merge data
    const mergedData = { ...existingData };

    // Replace conflicting exercises
    conflicts.forEach(conflict => {
      const index = mergedData.exercises.findIndex(e => e.id === conflict.id);
      const importExercise = importData.exercises.find(e => e.id === conflict.id);

      if (index !== -1 && importExercise) {
        mergedData.exercises[index] = importExercise;
        console.log(`🔄 Replaced: ${conflict.existing} → ${conflict.imported}`);
      }
    });

    // Add new exercises
    newExercises.forEach(exercise => {
      mergedData.exercises.push(exercise);
      console.log(`➕ Added: ${exercise.displayName}`);
    });

    // Sort exercises
    mergedData.exercises.sort((a, b) => a.displayName.localeCompare(b.displayName));

    // Update metadata
    mergedData.lastUpdated = new Date().toISOString().split('T')[0];

    // Validate merged data
    console.log('\n🔍 Validating merged data...');
    const { validateExerciseData } = require('./validate-data.js');

    if (!validateExerciseData(mergedData)) {
      throw new Error('Merged data validation failed. Restoring from backup...');
    }

    // Write merged data
    fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2));

    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Total exercises: ${mergedData.exercises.length}`);
    console.log(`🔄 Replaced: ${conflicts.length}`);
    console.log(`➕ Added: ${newExercises.length}`);

  } catch (error) {
    console.error('\n❌ Error during import:', error.message);

    // Try to restore from backup if available
    const backupDir = path.join(__dirname, '../backups');
    if (fs.existsSync(backupDir)) {
      const backups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('exercises-backup-'))
        .sort()
        .reverse();

      if (backups.length > 0) {
        console.log('\n🔄 Attempting to restore from latest backup...');
        const latestBackup = path.join(backupDir, backups[0]);

        try {
          const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
          const dataPath = path.join(__dirname, '../src/data/exercises.json');
          fs.writeFileSync(dataPath, JSON.stringify(backupData, null, 2));
          console.log('✅ Restored from backup successfully.');
        } catch (restoreError) {
          console.error('❌ Failed to restore from backup:', restoreError.message);
        }
      }
    }

    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  try {
    await importExerciseData();
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importExerciseData };
