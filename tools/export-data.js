#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function exportExerciseData(format = 'json') {
  try {
    const dataPath = path.join(__dirname, '../src/data/exercises.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '../exports');

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    switch (format.toLowerCase()) {
      case 'json':
        exportAsJSON(data, outputDir, timestamp);
        break;
      case 'csv':
        exportAsCSV(data, outputDir, timestamp);
        break;
      case 'markdown':
        exportAsMarkdown(data, outputDir, timestamp);
        break;
      case 'all':
        exportAsJSON(data, outputDir, timestamp);
        exportAsCSV(data, outputDir, timestamp);
        exportAsMarkdown(data, outputDir, timestamp);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    console.log(`✅ Exercise data exported successfully to ${outputDir}/`);

  } catch (error) {
    console.error('❌ Error exporting exercise data:', error.message);
    process.exit(1);
  }
}

function exportAsJSON(data, outputDir, timestamp) {
  const filename = `exercises-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`📄 JSON export: ${filename}`);
}

function exportAsCSV(data, outputDir, timestamp) {
  const filename = `exercises-${timestamp}.csv`;
  const filepath = path.join(outputDir, filename);

  let csv = 'ID,Name,Display Name,Aliases,Category,Description';

  // Add muscle group headers
  data.muscleGroups.forEach(muscle => {
    csv += `,${muscle}`;
  });
  csv += '\n';

  // Add exercise data
  data.exercises.forEach(exercise => {
    const row = [
      exercise.id,
      exercise.name,
      `"${exercise.displayName}"`,
      `"${exercise.aliases.join(', ')}"`,
      exercise.category,
      `"${exercise.description}"`
    ];

    // Add muscle group allocations
    data.muscleGroups.forEach(muscle => {
      row.push(exercise.muscleGroups[muscle] || 0);
    });

    csv += row.join(',') + '\n';
  });

  fs.writeFileSync(filepath, csv);
  console.log(`📊 CSV export: ${filename}`);
}

function exportAsMarkdown(data, outputDir, timestamp) {
  const filename = `exercises-${timestamp}.md`;
  const filepath = path.join(outputDir, filename);

  let markdown = `# Exercise Database Export\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Version:** ${data.version}\n`;
  markdown += `**Total Exercises:** ${data.exercises.length}\n\n`;

  // Summary table
  markdown += `## Summary\n\n`;
  markdown += `| Category | Count | Description |\n`;
  markdown += `|----------|-------|-------------|\n`;

  Object.entries(data.categories).forEach(([category, description]) => {
    const count = data.exercises.filter(e => e.category === category).length;
    markdown += `| ${category} | ${count} | ${description} |\n`;
  });

  markdown += `\n## Exercises by Category\n\n`;

  // Group exercises by category
  const exercisesByCategory = {};
  data.exercises.forEach(exercise => {
    if (!exercisesByCategory[exercise.category]) {
      exercisesByCategory[exercise.category] = [];
    }
    exercisesByCategory[exercise.category].push(exercise);
  });

  Object.entries(exercisesByCategory).forEach(([category, exercises]) => {
    markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;

    exercises.forEach(exercise => {
      markdown += `#### ${exercise.displayName}\n\n`;
      markdown += `- **ID:** \`${exercise.id}\`\n`;
      markdown += `- **Aliases:** ${exercise.aliases.join(', ')}\n`;
      markdown += `- **Description:** ${exercise.description}\n`;
      markdown += `- **Muscle Groups:**\n`;

      Object.entries(exercise.muscleGroups).forEach(([muscle, allocation]) => {
        const level = allocation === 1.0 ? 'Primary' : allocation >= 0.5 ? 'Secondary' : 'Tertiary';
        markdown += `  - ${muscle}: ${allocation} (${level})\n`;
      });

      markdown += `\n`;
    });
  }

  // Muscle group summary
  markdown += `## Muscle Group Coverage\n\n`;
  markdown += `| Muscle Group | Exercise Count | Total Allocation |\n`;
  markdown += `|---------------|----------------|------------------|\n`;

  data.muscleGroups.forEach(muscle => {
    const exercises = data.exercises.filter(e => e.muscleGroups[muscle]);
    const totalAllocation = exercises.reduce((sum, e) => sum + (e.muscleGroups[muscle] || 0), 0);

    markdown += `| ${muscle} | ${exercises.length} | ${totalAllocation.toFixed(2)} |\n`;
  });

  fs.writeFileSync(filepath, markdown);
  console.log(`📝 Markdown export: ${filename}`);
}

function main() {
  const format = process.argv[2] || 'json';

  console.log('📤 Exporting exercise database...\n');

  if (!['json', 'csv', 'markdown', 'all'].includes(format.toLowerCase())) {
    console.error('❌ Invalid format. Supported formats: json, csv, markdown, all');
    console.log('\nUsage: npm run data:export [format]');
    console.log('Formats:');
    console.log('  json     - JSON format (default)');
    console.log('  csv      - CSV format');
    console.log('  markdown - Markdown format');
    console.log('  all      - All formats');
    process.exit(1);
  }

  exportExerciseData(format);
}

if (require.main === module) {
  main();
}

module.exports = { exportExerciseData };
