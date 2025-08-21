// UI Manager Module
// Handles UI updates and interactions

export class UIManager {
  constructor() {
    this.muscleGroups = [
      'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
      'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
    ];
  }

  init() {
    console.log('🎨 UI manager initialized');
    this.setupMuscleCheckboxes();
    this.setupMuscleFilters();
  }

  setupMuscleCheckboxes() {
    const container = document.getElementById('muscle-checkboxes');
    if (!container) return;

    container.innerHTML = '';

    this.muscleGroups.forEach(muscle => {
      const checkbox = document.createElement('div');
      checkbox.className = 'muscle-checkbox';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = `muscle-${muscle.toLowerCase().replace(/\s+/g, '-')}`;
      input.value = muscle;

      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = muscle;

      checkbox.appendChild(input);
      checkbox.appendChild(label);
      container.appendChild(checkbox);
    });
  }

  setupMuscleFilters() {
    const filter = document.getElementById('muscle-filter');
    if (!filter) return;

    // Clear existing options except the first one
    while (filter.children.length > 1) {
      filter.removeChild(filter.lastChild);
    }

    this.muscleGroups.forEach(muscle => {
      const option = document.createElement('option');
      option.value = muscle;
      option.textContent = muscle;
      filter.appendChild(option);
    });
  }

  updateMuscleTotals(totals) {
    const container = document.getElementById('muscle-totals');
    if (!container) return;

    container.innerHTML = '';

    const sortedMuscles = Object.entries(totals)
      .sort(([,a], [,b]) => b - a);

    sortedMuscles.forEach(([muscle, sets]) => {
      const item = document.createElement('div');
      item.className = 'muscle-total-item';

      const name = document.createElement('span');
      name.className = 'muscle-name';
      name.textContent = muscle;

      const setsSpan = document.createElement('span');
      setsSpan.className = 'muscle-sets';
      setsSpan.textContent = `${sets.toFixed(1)} sets`;

      const status = document.createElement('span');
      status.className = `status-chip ${this.getStatusClass(sets)}`;
      status.textContent = this.getStatusText(sets);

      item.appendChild(name);
      item.appendChild(setsSpan);
      item.appendChild(status);
      container.appendChild(item);
    });
  }

  updateDaySummary(dayData) {
    const noteInput = document.getElementById('day-note');
    const entriesContainer = document.getElementById('day-entries');

    if (noteInput) {
      noteInput.value = dayData.note || '';
    }

    if (entriesContainer) {
      entriesContainer.innerHTML = '';

      if (dayData.entries && dayData.entries.length > 0) {
        dayData.entries.forEach(entry => {
          const entryElement = this.createEntryElement(entry);
          entriesContainer.appendChild(entryElement);
        });
      } else {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-center';
        emptyMessage.textContent = 'No training entries for this day.';
        emptyMessage.style.color = 'var(--text-muted)';
        entriesContainer.appendChild(emptyMessage);
      }
    }
  }

  updateTrainingHistory(history) {
    const container = document.getElementById('training-history');
    if (!container) return;

    container.innerHTML = '';

    if (history.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'text-center';
      emptyMessage.textContent = 'No training history yet.';
      emptyMessage.style.padding = 'var(--spacing-lg)';
      emptyMessage.style.color = 'var(--text-muted)';
      container.appendChild(emptyMessage);
      return;
    }

    history.forEach(day => {
      const dayElement = this.createHistoryDayElement(day);
      container.appendChild(dayElement);
    });
  }

  createEntryElement(entry) {
    const div = document.createElement('div');
    div.className = 'entry-item';
    div.style.padding = 'var(--spacing-sm)';
    div.style.borderBottom = '1px solid var(--border-color)';

    const type = entry.type === 'quick' ? 'Quick Add' : 'Manual';
    const muscles = Object.keys(entry.muscleSets).join(', ');
    const sets = Object.values(entry.muscleSets).reduce((sum, val) => sum + val, 0);

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span><strong>${type}</strong>: ${muscles}</span>
        <span style="color: var(--primary-color); font-weight: 600;">${sets.toFixed(1)} sets</span>
      </div>
    `;

    return div;
  }

  createHistoryDayElement(day) {
    const div = document.createElement('div');
    div.className = 'history-day';
    div.style.padding = 'var(--spacing-md)';
    div.style.borderBottom = '1px solid var(--border-color)';

    const date = new Date(day.id).toLocaleDateString();
    const entryCount = day.entries.length;
    const note = day.note || 'No notes';

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
        <strong>${date}</strong>
        <span style="color: var(--primary-color);">${entryCount} entries</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0;">${note}</p>
    `;

    return div;
  }

  getStatusClass(sets) {
    if (sets < 10) return 'under';
    if (sets <= 15) return 'good';
    return 'high';
  }

  getStatusText(sets) {
    if (sets < 10) return 'Under';
    if (sets <= 15) return 'Good';
    return 'High';
  }
}
