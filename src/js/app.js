// Sets by Muscle - Main Application
// A lightweight web app for tracking strength training sets per muscle group

import { ExerciseDatabase } from './modules/exercise-database.js';
import { TrainingTracker } from './modules/training-tracker.js';
import { DataManager } from './modules/data-manager.js';
import { UIManager } from './modules/ui-manager.js';
import { ChartRenderer } from './modules/chart-renderer.js';

class SetsByMuscleApp {
    constructor() {
    this.exerciseDatabase = new ExerciseDatabase();
    this.trainingTracker = new TrainingTracker();
    this.dataManager = new DataManager();
    this.uiManager = new UIManager();
    this.chartRenderer = new ChartRenderer();

    this.currentDate = new Date();
    this.windowDays = 7;
    this.selectedExercise = null;

    this.init();
  }

    async init() {
    try {
      console.log('🏋️  Initializing Sets by Muscle...');

      // Initialize components
      await this.exerciseDatabase.init();
      console.log('📚 Exercise database loaded with', this.exerciseDatabase.getAllExercises().length, 'exercises');
      await this.trainingTracker.init();
      this.dataManager.init();
      this.uiManager.init();
      this.chartRenderer.init();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize UI with current data
      this.updateUI();

      console.log('✅ Sets by Muscle initialized successfully!');

    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  setupEventListeners() {
    // Date and window controls
    const dateInput = document.getElementById('training-date');
    const windowSelect = document.getElementById('window-days');

    if (dateInput) {
      dateInput.value = this.formatDate(this.currentDate);
      dateInput.addEventListener('change', (e) => {
        this.currentDate = new Date(e.target.value);
        this.updateUI();
      });
    }

    if (windowSelect) {
      windowSelect.addEventListener('change', (e) => {
        this.windowDays = parseInt(e.target.value);
        this.updateUI();
      });
    }

        // Exercise search functionality
    const exerciseSearch = document.getElementById('exercise-search');
    const searchResults = document.getElementById('search-results');
    const exerciseDetails = document.getElementById('exercise-details');
    const addExerciseBtn = document.getElementById('add-exercise-btn');

    if (exerciseSearch) {
      exerciseSearch.addEventListener('input', (e) => this.handleExerciseSearch(e.target.value));
      exerciseSearch.addEventListener('focus', () => this.showSearchResults());
      exerciseSearch.addEventListener('blur', () => {
        // Delay hiding to allow clicking on results
        setTimeout(() => this.hideSearchResults(), 200);
      });
    }

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener('click', () => this.handleAddExercise());
    }

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSearchResults();
      }
    });

    // Manual entry functionality
    const manualAddBtn = document.getElementById('manual-add-btn');
    if (manualAddBtn) {
      manualAddBtn.addEventListener('click', () => this.handleManualAdd());
    }

    // Data management
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const resetBtn = document.getElementById('reset-btn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleImport(e));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset());
    }

    // Note editing
    const dayNote = document.getElementById('day-note');
    if (dayNote) {
      dayNote.addEventListener('blur', () => this.saveDayNote());
    }
  }

      handleExerciseSearch(query) {
    if (!query.trim()) {
      this.hideSearchResults();
      return;
    }

    console.log('🔍 Searching for:', query);
    const results = this.exerciseDatabase.searchExercises(query);
    console.log('📋 Search results:', results);
    this.displaySearchResults(results);
  }

    displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item"><p>No exercises found</p></div>';
      searchResults.classList.remove('hidden');
      return;
    }

    searchResults.innerHTML = results.map(exercise => {
      const primaryMuscles = Object.entries(exercise.muscleGroups)
        .filter(([, allocation]) => allocation >= 0.5)
        .map(([muscle]) => muscle);

      const secondaryMuscles = Object.entries(exercise.muscleGroups)
        .filter(([, allocation]) => allocation < 0.5 && allocation > 0)
        .map(([muscle]) => muscle);

      return `
        <div class="search-result-item" data-exercise-id="${exercise.id}">
          <div class="search-result-name">${exercise.displayName}</div>
          <div class="search-result-muscles">
            <span class="primary-muscles">💪 ${primaryMuscles.join(', ')}</span>
            ${secondaryMuscles.length > 0 ? `<span class="secondary-muscles">• ${secondaryMuscles.join(', ')}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => this.selectExercise(item.dataset.exerciseId));
    });

    searchResults.classList.remove('hidden');
  }

  selectExercise(exerciseId) {
    const exercise = this.exerciseDatabase.getExerciseById(exerciseId);
    if (!exercise) return;

    // Update UI to show exercise details
    const exerciseDetails = document.getElementById('exercise-details');
    const exerciseName = document.getElementById('selected-exercise-name');
    const exerciseDescription = document.getElementById('selected-exercise-description');
    const muscleTags = document.getElementById('muscle-tags');
    const setsInput = document.getElementById('sets-input');
    const repsInput = document.getElementById('reps-input');

    if (exerciseDetails && exerciseName && exerciseDescription && muscleTags) {
      exerciseName.textContent = exercise.displayName;
      exerciseDescription.textContent = exercise.description;

      // Create muscle tags
      muscleTags.innerHTML = Object.keys(exercise.muscleGroups).map(muscle =>
        `<span class="muscle-tag">${muscle}</span>`
      ).join('');

      // Set default values
      if (setsInput) setsInput.value = exercise.defaultSets || 3;
      if (repsInput) repsInput.value = exercise.defaultReps || 8;

      exerciseDetails.classList.remove('hidden');
    }

    // Hide search results
    this.hideSearchResults();

    // Store selected exercise
    this.selectedExercise = exercise;
  }

  showSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults && searchResults.children.length > 0) {
      searchResults.classList.remove('hidden');
    }
  }

  hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.classList.add('hidden');
    }
  }

  async handleAddExercise() {
    if (!this.selectedExercise) {
      this.showFeedback('Please select an exercise first.', 'error');
      return;
    }

    const setsInput = document.getElementById('sets-input');
    const repsInput = document.getElementById('reps-input');
    const weightInput = document.getElementById('weight-input');

    if (!setsInput || !repsInput || !weightInput) return;

    const sets = parseInt(setsInput.value);
    const reps = parseInt(repsInput.value);
    const weight = parseFloat(weightInput.value);

    if (isNaN(sets) || sets < 1) {
      this.showFeedback('Please enter a valid number of sets.', 'error');
      return;
    }

    if (isNaN(reps) || reps < 1) {
      this.showFeedback('Please enter a valid number of reps.', 'error');
      return;
    }

    try {
      await this.trainingTracker.addExerciseEntry(
        this.selectedExercise,
        sets,
        reps,
        weight,
        this.currentDate
      );

      this.showFeedback(`Added ${sets} sets of ${this.selectedExercise.displayName}`, 'success');

      // Reset form
      this.resetExerciseForm();
      this.updateUI();

    } catch (error) {
      this.showFeedback('Failed to add exercise. Please try again.', 'error');
      console.error('Add exercise error:', error);
    }
  }

  resetExerciseForm() {
    const exerciseDetails = document.getElementById('exercise-details');
    const exerciseSearch = document.getElementById('exercise-search');

    if (exerciseDetails) exerciseDetails.classList.add('hidden');
    if (exerciseSearch) exerciseSearch.value = '';

    this.selectedExercise = null;
  }

  async handleManualAdd() {
    const selectedMuscles = this.getSelectedMuscles();
    const setsInput = document.getElementById('manual-sets');

    if (!setsInput) return;

    const sets = parseFloat(setsInput.value);
    if (isNaN(sets) || sets <= 0) {
      this.showFeedback('Please enter a valid number of sets.', 'error');
      return;
    }

    if (selectedMuscles.length === 0) {
      this.showFeedback('Please select at least one muscle group.', 'error');
      return;
    }

    try {
      await this.trainingTracker.addManualEntry(selectedMuscles, sets, this.currentDate);
      this.showFeedback(`Added ${sets} sets to ${selectedMuscles.join(', ')}`, 'success');
      this.updateUI();
    } catch (error) {
      this.showFeedback('Failed to add manual entry. Please try again.', 'error');
      console.error('Manual add error:', error);
    }
  }

  getSelectedMuscles() {
    const checkboxes = document.querySelectorAll('#muscle-checkboxes input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  async handleExport() {
    try {
      const data = await this.dataManager.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `sets-by-muscle-${this.formatDate(new Date())}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showFeedback('Data exported successfully!', 'success');
    } catch (error) {
      this.showFeedback('Failed to export data. Please try again.', 'error');
      console.error('Export error:', error);
    }
  }

  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await this.dataManager.importData(data);
      this.showFeedback('Data imported successfully!', 'success');
      this.updateUI();

      // Reset file input
      event.target.value = '';
    } catch (error) {
      this.showFeedback('Failed to import data. Please check the file format.', 'error');
      console.error('Import error:', error);
    }
  }

  async handleReset() {
    const confirmed = await this.showConfirmModal(
      'Reset All Data',
      'This will permanently delete all your training data. This action cannot be undone. Are you sure?'
    );

    if (confirmed) {
      try {
        await this.dataManager.resetData();
        this.showFeedback('All data has been reset.', 'success');
        this.updateUI();
      } catch (error) {
        this.showFeedback('Failed to reset data. Please try again.', 'error');
        console.error('Reset error:', error);
      }
    }
  }

  async saveDayNote() {
    const noteInput = document.getElementById('day-note');
    if (!noteInput) return;

    try {
      await this.trainingTracker.updateDayNote(this.currentDate, noteInput.value);
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }

  async updateUI() {
    try {
      // Update muscle totals
      const totals = await this.trainingTracker.getMuscleTotals(this.currentDate, this.windowDays);
      this.uiManager.updateMuscleTotals(totals);

      // Update charts
      this.chartRenderer.renderBarChart(totals);
      this.chartRenderer.renderHeatMap(totals);

      // Update day summary
      const dayData = await this.trainingTracker.getDayData(this.currentDate);
      this.uiManager.updateDaySummary(dayData);

      // Update training history
      const history = await this.trainingTracker.getTrainingHistory();
      this.uiManager.updateTrainingHistory(history);

    } catch (error) {
      console.error('Failed to update UI:', error);
    }
  }

    showFeedback(message, type = 'info') {
    const feedback = document.getElementById('exercise-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    feedback.classList.remove('hidden');

    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 5000);
  }

  async showConfirmModal(title, message) {
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalMessage = document.getElementById('modal-message');
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');

      if (!modal || !modalTitle || !modalMessage || !confirmBtn || !cancelBtn) {
        resolve(false);
        return;
      }

      modalTitle.textContent = title;
      modalMessage.textContent = message;

      const handleConfirm = () => {
        modal.classList.add('hidden');
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        modal.classList.add('hidden');
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
      };

      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);

      modal.classList.remove('hidden');
    });
  }

  showError(message) {
    this.showFeedback(message, 'error');
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SetsByMuscleApp();
});

// Export for testing/debugging
window.SetsByMuscleApp = SetsByMuscleApp;
