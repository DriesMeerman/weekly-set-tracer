/**
 * Muscle Visualizer Module
 * Handles SVG muscle diagrams and dynamic highlighting based on workout data
 */
export class MuscleVisualizer {
  constructor() {
    console.log('🏗️ MuscleVisualizer constructor called');
    this.currentView = 'front'; // 'front' or 'back'
    this.muscleIntensity = {};
    this.colorScale = {
      low: '#dbeafe',      // Light blue
      medium: '#93c5fd',   // Medium blue
      high: '#3b82f6',     // Blue
      veryHigh: '#1d4ed8', // Dark blue
      max: '#dc2626'       // Red
    };
    this.muscleMapping = {
      // Front view mappings
      'Chest': 'chest',
      'Shoulders': 'shoulders',
      'Biceps': 'biceps',
      'Triceps': 'triceps',
      'Forearms': 'forearms',
      'Abs': 'abs',
      'Obliques': 'obliques',
      'Quads': 'quads',
      'Hamstrings': 'hamstrings',
      'Calves': 'calves',
      'Glutes': 'glutes',

      // Back view mappings
      'Upper Back': 'upper-back',
      'Lats': 'lats',
      'Lower Back': 'lower-back',

      // Combined mappings (both views)
      'Front Delts': 'shoulders',
      'Rear Delts': 'shoulders-back',
      'Side Delts': 'shoulders',

      // Additional mappings from your exercise data
      'Back': 'upper-back',
      'Core': 'abs',
      'Legs': 'quads',
      'Arms': 'biceps',
      'Shoulder': 'shoulders',
      'Bicep': 'biceps',
      'Tricep': 'triceps',
      'Quad': 'quads',
      'Hamstring': 'hamstrings',
      'Calf': 'calves',
      'Glute': 'glutes',
      'Deltoid': 'shoulders',
      'Trapezius': 'upper-back',
      'Rhomboid': 'upper-back'
    };
  }

  /**
   * Wait for DOM to be ready
   */
  async waitForDOM() {
    return new Promise((resolve) => {
      const checkDOM = () => {
        if (document.getElementById('muscle-diagram')) {
          console.log('✅ DOM is ready');
          resolve();
        } else {
          console.log('⏳ Still waiting for DOM...');
          setTimeout(checkDOM, 100);
        }
      };
      checkDOM();
    });
  }

  /**
   * Initialize the muscle visualizer
   */
  async init() {
    try {
      console.log('💪 Initializing muscle visualizer...');

      // Check if DOM is ready
      if (!document.getElementById('muscle-diagram')) {
        console.log('⏳ DOM not ready, waiting...');
        await this.waitForDOM();
      }

      // Load SVG diagrams
      await this.loadSVGDiagrams();

      // Set up view switching
      this.setupViewSwitching();

      // Render the initial view
      this.renderCurrentView();

      // Set up muscle hover effects
      this.setupMuscleInteractions();

      console.log('✅ Muscle visualizer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize muscle visualizer:', error);
      // Even if initialization fails, try to show a basic SVG
      this.showBasicSVG();
    }
  }

  /**
   * Load SVG diagrams from assets
   */
  async loadSVGDiagrams() {
    try {
      console.log('📚 Loading SVG diagrams...');

      // Try multiple paths for SVG loading
      let frontResponse, backResponse;

      // Try relative path first
      try {
        frontResponse = await fetch('./assets/muscles-front.svg');
        if (!frontResponse.ok) throw new Error(`Status: ${frontResponse.status}`);
      } catch (e) {
        console.log('🔄 Trying absolute path for front SVG...');
        frontResponse = await fetch('/assets/muscles-front.svg');
        if (!frontResponse.ok) throw new Error(`Status: ${frontResponse.status}`);
      }

      try {
        backResponse = await fetch('./assets/muscles-back.svg');
        if (!backResponse.ok) throw new Error(`Status: ${backResponse.status}`);
      } catch (e) {
        console.log('🔄 Trying absolute path for back SVG...');
        backResponse = await fetch('/assets/muscles-back.svg');
        if (!backResponse.ok) throw new Error(`Status: ${backResponse.status}`);
      }

      const frontSVG = await frontResponse.text();
      const backSVG = await backResponse.text();

      // Store SVG content
      this.frontSVG = frontSVG;
      this.backSVG = backSVG;

      console.log('📚 SVG diagrams loaded successfully');
      console.log(`📏 Front SVG length: ${frontSVG.length} characters`);
      console.log(`📏 Back SVG length: ${backSVG.length} characters`);
      console.log(`📏 Front SVG preview: ${frontSVG.substring(0, 100)}...`);

      // Test if SVG content is valid
      if (frontSVG.includes('<svg') && backSVG.includes('<svg')) {
        console.log('✅ SVG content appears valid');
      } else {
        console.warn('⚠️ SVG content may be invalid');
      }
    } catch (error) {
      console.error('❌ Failed to load SVG diagrams:', error);
      throw error;
    }
  }

  /**
   * Set up view switching between front and back
   */
  setupViewSwitching() {
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
      viewToggle.addEventListener('click', () => {
        this.switchView();
      });
    }

    // Debug button
    const debugButton = document.getElementById('debug-render');
    if (debugButton) {
      debugButton.addEventListener('click', () => {
        console.log('🐛 Debug render triggered');
        console.log('Current view:', this.currentView);
        console.log('Front SVG loaded:', !!this.frontSVG);
        console.log('Back SVG loaded:', !!this.backSVG);
        console.log('Front SVG length:', this.frontSVG ? this.frontSVG.length : 'Not loaded');
        console.log('Back SVG length:', this.backSVG ? this.backSVG.length : 'Not loaded');

        // Check DOM
        const container = document.getElementById('muscle-diagram');
        console.log('Container found:', !!container);
        if (container) {
          console.log('Container innerHTML length:', container.innerHTML.length);
          const svg = container.querySelector('svg');
          console.log('SVG element found:', !!svg);
        }

        this.checkAndRender();
      });
    }

    // Test SVG loading button
    const testButton = document.getElementById('test-svg');
    if (testButton) {
      testButton.addEventListener('click', async () => {
        console.log('🧪 Test SVG loading triggered');
        const svgContent = await this.testSVGLoading();
        if (svgContent) {
          const container = document.getElementById('muscle-diagram');
          if (container) {
            container.innerHTML = svgContent;
            console.log('✅ Test SVG rendered');
          }
        }
      });
    }

    // Test with sample data button
    const sampleDataButton = document.getElementById('test-sample-data');
    if (sampleDataButton) {
      sampleDataButton.addEventListener('click', () => {
        console.log('🧪 Testing with sample data...');
        const sampleData = this.createSampleData();
        console.log('📊 Sample data created:', sampleData);

        const muscleIntensity = this.calculateMuscleIntensity(sampleData, 7);
        console.log('💪 Muscle intensity calculated:', muscleIntensity);

        this.updateMuscleData(muscleIntensity);
        console.log('✅ Sample data applied');

        // Force a re-render to show the highlights
        this.renderCurrentView();
      });
    }

    // Force show basic SVG button
    const forceShowButton = document.getElementById('force-show');
    if (forceShowButton) {
      forceShowButton.addEventListener('click', () => {
        console.log('🆘 Force showing basic SVG...');
        this.showBasicSVG();
      });
    }
  }

  /**
   * Switch between front and back views
   */
  switchView() {
    this.currentView = this.currentView === 'front' ? 'back' : 'front';
    this.renderCurrentView();
    this.updateMuscleHighlights();

    // Update toggle button
    const viewToggle = document.getElementById('view-toggle');
    if (viewToggle) {
      viewToggle.textContent = this.currentView === 'front' ? '🔄 Show Back' : '🔄 Show Front';
    }
  }

  /**
   * Render the current view (front or back)
   */
    renderCurrentView() {
    console.log('🎨 Rendering current view:', this.currentView);
    const container = document.getElementById('muscle-diagram');

    if (!container) {
      console.error('❌ Container not found for rendering');
      return;
    }

    let svgContent = '';

    if (this.currentView === 'front' && this.frontSVG) {
      svgContent = this.frontSVG;
      console.log('📏 Front SVG content length:', svgContent.length);
      console.log('📏 Front SVG preview:', svgContent.substring(0, 100));
    } else if (this.currentView === 'back' && this.backSVG) {
      svgContent = this.backSVG;
      console.log('📏 Back SVG content length:', svgContent.length);
      console.log('📏 Back SVG preview:', svgContent.substring(0, 100));
    } else {
      console.error('❌ SVG content not available for view:', this.currentView);
      // Fallback SVG for testing
      const fallbackSVG = `
        <svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 400px;">
          <rect width="300" height="600" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
          <text x="150" y="300" text-anchor="middle" font-size="24" fill="#6b7280">
            Muscle Diagram Loading...
          </text>
          <text x="150" y="330" text-anchor="middle" font-size="16" fill="#9ca3af">
            ${this.currentView} view
          </text>
          <!-- Simple test muscle -->
          <circle cx="150" cy="200" r="30" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
          <text x="150" y="205" text-anchor="middle" font-size="12" fill="#1e40af">Chest</text>
        </svg>
      `;
      container.innerHTML = fallbackSVG;
      console.log('🔄 Fallback SVG rendered');
      return;
    }

    if (svgContent) {
      // Clear container first
      container.innerHTML = '';

      // Insert SVG content
      container.innerHTML = svgContent;

      // Debug: Check what was actually inserted
      console.log('🔍 Container innerHTML length after insertion:', container.innerHTML.length);
      const svgElement = container.querySelector('svg');
      console.log('🔍 SVG element found after insertion:', !!svgElement);
      if (svgElement) {
        console.log('🔍 SVG dimensions:', {
          width: svgElement.offsetWidth,
          height: svgElement.offsetHeight,
          clientWidth: svgElement.clientWidth,
          clientHeight: svgElement.clientHeight,
          style: svgElement.style.cssText
        });
      }

      console.log('✅ SVG rendered successfully');

      // Re-apply muscle interactions
      this.setupMuscleInteractions();
    }
  }

  /**
   * Set up muscle hover and click interactions
   */
  setupMuscleInteractions() {
    const muscleGroups = document.querySelectorAll('.muscle-group');

    muscleGroups.forEach(muscle => {
      // Hover effects
      muscle.addEventListener('mouseenter', (e) => {
        this.showMuscleTooltip(e.target, e);
      });

      muscle.addEventListener('mouseleave', () => {
        this.hideMuscleTooltip();
      });

      // Click effects
      muscle.addEventListener('click', (e) => {
        this.handleMuscleClick(e.target);
      });

      // Touch events for mobile
      muscle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.showMuscleTooltip(e.target, e.touches[0]);
      });

      muscle.addEventListener('touchend', () => {
        this.hideMuscleTooltip();
      });
    });
  }

  /**
   * Show tooltip for muscle group
   */
  showMuscleTooltip(muscleElement, event) {
    const muscleId = muscleElement.id;
    const muscleName = this.getMuscleDisplayName(muscleId);
    const intensity = this.muscleIntensity[muscleName] || 0;

    // Create tooltip
    let tooltip = document.getElementById('muscle-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'muscle-tooltip';
      tooltip.className = 'muscle-tooltip';
      document.body.appendChild(tooltip);
    }

    // Position tooltip
    const rect = muscleElement.getBoundingClientRect();
    const x = event.clientX || event.pageX;
    const y = event.clientY || event.pageY;

    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;

    // Update tooltip content
    tooltip.innerHTML = `
      <div class="tooltip-header">${muscleName}</div>
      <div class="tooltip-content">
        <div class="intensity-bar">
          <div class="intensity-fill" style="width: ${intensity * 100}%"></div>
        </div>
        <div class="intensity-text">Intensity: ${Math.round(intensity * 100)}%</div>
      </div>
    `;

    tooltip.style.display = 'block';
  }

  /**
   * Hide muscle tooltip
   */
  hideMuscleTooltip() {
    const tooltip = document.getElementById('muscle-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Handle muscle click
   */
  handleMuscleClick(muscleElement) {
    const muscleId = muscleElement.id;
    const muscleName = this.getMuscleDisplayName(muscleId);

    console.log(`💪 Muscle clicked: ${muscleName}`);

    // You can add custom logic here, like:
    // - Filtering exercises by muscle group
    // - Showing detailed muscle information
    // - Highlighting related exercises
  }

  /**
   * Get display name for muscle ID
   */
  getMuscleDisplayName(muscleId) {
    const reverseMapping = {};
    Object.entries(this.muscleMapping).forEach(([name, id]) => {
      reverseMapping[id] = name;
    });

    return reverseMapping[muscleId] || muscleId;
  }

  /**
   * Update muscle highlights based on workout data
   */
  updateMuscleHighlights() {
    // Clear previous highlights
    this.clearMuscleHighlights();

    // Apply new highlights
    Object.entries(this.muscleIntensity).forEach(([muscleName, intensity]) => {
      this.highlightMuscle(muscleName, intensity);
    });
  }

  /**
   * Highlight a specific muscle based on intensity
   */
  highlightMuscle(muscleName, intensity) {
    const muscleId = this.muscleMapping[muscleName];
    if (!muscleId) return;

    const muscleElement = document.getElementById(muscleId);
    if (!muscleElement) return;

    // Determine color based on intensity
    const color = this.getIntensityColor(intensity);

    // Apply highlight
    muscleElement.style.fill = color;
    muscleElement.style.stroke = this.getDarkerColor(color);
    muscleElement.style.strokeWidth = '2';

    // Add highlight class
    muscleElement.classList.add('muscle-highlight');
  }

  /**
   * Clear all muscle highlights
   */
  clearMuscleHighlights() {
    const highlightedMuscles = document.querySelectorAll('.muscle-highlight');
    highlightedMuscles.forEach(muscle => {
      muscle.style.fill = '';
      muscle.style.stroke = '';
      muscle.style.strokeWidth = '';
      muscle.classList.remove('muscle-highlight');
    });
  }

  /**
   * Get color based on intensity level
   */
  getIntensityColor(intensity) {
    if (intensity <= 0.2) return this.colorScale.low;
    if (intensity <= 0.4) return this.colorScale.medium;
    if (intensity <= 0.6) return this.colorScale.high;
    if (intensity <= 0.8) return this.colorScale.veryHigh;
    return this.colorScale.max;
  }

  /**
   * Get darker version of a color for stroke
   */
  getDarkerColor(color) {
    // Simple darkening - you could use a more sophisticated color manipulation library
    return color.replace(')', ', 0.8)').replace('rgb', 'rgba');
  }

  /**
   * Update muscle intensity data from workout tracker
   */
  updateMuscleData(muscleData) {
    this.muscleIntensity = muscleData;
    this.updateMuscleHighlights();
  }

  /**
   * Calculate muscle intensity from training data
   */
    calculateMuscleIntensity(trainingData, timeWindow = 7) {
    const muscleTotals = {};
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (timeWindow * 24 * 60 * 60 * 1000));

    // Ensure trainingData is an array
    if (!Array.isArray(trainingData)) {
      console.warn('⚠️ Training data is not an array:', trainingData);
      console.log('📊 Training data type:', typeof trainingData);
      console.log('📊 Training data:', trainingData);
      return {};
    }

    // Process training data
    trainingData.forEach(day => {
      if (!day || !day.entries) return;

      const dayDate = new Date(day.id);
      if (dayDate >= cutoffDate) {
        day.entries.forEach(entry => {
          if (entry.type === 'exercise' && entry.muscleSets) {
            Object.entries(entry.muscleSets).forEach(([muscle, sets]) => {
              if (!muscleTotals[muscle]) {
                muscleTotals[muscle] = { totalSets: 0, maxWeight: 0 };
              }
              muscleTotals[muscle].totalSets += sets;
              if (entry.weight > muscleTotals[muscle].maxWeight) {
                muscleTotals[muscle].maxWeight = entry.weight;
              }
            });
          }
        });
      }
    });

    // Calculate intensity scores (0-1)
    if (Object.keys(muscleTotals).length === 0) {
      console.log('📊 No muscle data found, returning empty totals');
      return {};
    }

    const maxSets = Math.max(...Object.values(muscleTotals).map(m => m.totalSets), 1);
    const maxWeight = Math.max(...Object.values(muscleTotals).map(m => m.maxWeight), 1);

    Object.keys(muscleTotals).forEach(muscle => {
      const setsScore = muscleTotals[muscle].totalSets / maxSets;
      const weightScore = muscleTotals[muscle].maxWeight / maxWeight;
      muscleTotals[muscle] = (setsScore * 0.7) + (weightScore * 0.3);
    });

    console.log('💪 Calculated muscle intensity:', muscleTotals);
    return muscleTotals;
  }

  /**
   * Get current muscle intensity data
   */
  getMuscleIntensity() {
    return this.muscleIntensity;
  }

  /**
   * Force render the SVG if it's not visible
   */
  forceRender() {
    console.log('🔄 Force rendering muscle diagram...');
    this.renderCurrentView();
  }

  /**
   * Check if SVG is visible and render if needed
   */
  checkAndRender() {
    const container = document.getElementById('muscle-diagram');
    if (!container) {
      console.error('❌ Muscle diagram container not found');
      return;
    }

    const svg = container.querySelector('svg');
    if (!svg) {
      console.log('🔄 SVG not found, re-rendering...');
      this.renderCurrentView();
    } else {
      console.log('✅ SVG is visible');
    }
  }

  /**
   * Test SVG loading manually
   */
  async testSVGLoading() {
    console.log('🧪 Testing SVG loading...');

    try {
      // Test multiple paths
      let response;

      // Try relative path first
      try {
        response = await fetch('./assets/muscles-front.svg');
        console.log('📡 Relative path response status:', response.status);
      } catch (e) {
        console.log('🔄 Trying absolute path...');
        response = await fetch('/assets/muscles-front.svg');
        console.log('📡 Absolute path response status:', response.status);
      }

      if (response.ok) {
        const text = await response.text();
        console.log('📏 Front SVG content length:', text.length);
        console.log('📏 Front SVG starts with:', text.substring(0, 100));

        // Test if it's valid SVG
        if (text.includes('<svg')) {
          console.log('✅ Front SVG appears valid');

          // Store it for use
          this.frontSVG = text;

          // Render it immediately
          this.renderCurrentView();

          return text;
        } else {
          console.error('❌ Front SVG content is not valid SVG');
          console.log('📄 Actual content:', text.substring(0, 200));
          return null;
        }
      } else {
        console.error('❌ Front SVG fetch failed with status:', response.status);
        return null;
      }
    } catch (error) {
      console.error('❌ Front SVG fetch error:', error);
      // Fallback to a simple test SVG
      console.log('🔄 Falling back to simple test SVG...');
      this.showSimpleTestSVG();
      return null;
    }
  }

      /**
   * Show a basic SVG if everything else fails
   */
  showBasicSVG() {
    console.log('🆘 Showing basic SVG as fallback');
    const container = document.getElementById('muscle-diagram');
    if (!container) {
      console.error('❌ Container not found for basic SVG');
      return;
    }

    const basicSVG = `
      <svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 400px;">
        <rect width="300" height="600" fill="#f8fafc" stroke="#d1d5db" stroke-width="2"/>
        <text x="150" y="250" text-anchor="middle" font-size="20" fill="#374151">Basic Muscle Diagram</text>
        <text x="150" y="280" text-anchor="middle" font-size="16" fill="#6b7280">Front View</text>

        <!-- Head -->
        <circle cx="150" cy="80" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="150" y="85" text-anchor="middle" font-size="10" fill="#1e40af">Head</text>

        <!-- Chest -->
        <ellipse cx="150" cy="150" rx="40" ry="25" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="150" y="155" text-anchor="middle" font-size="10" fill="#1e40af">Chest</text>

        <!-- Arms -->
        <circle cx="100" cy="180" r="15" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <circle cx="200" cy="180" r="15" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="100" y="185" text-anchor="middle" font-size="8" fill="#1e40af">L Arm</text>
        <text x="200" y="185" text-anchor="middle" font-size="8" fill="#1e40af">R Arm</text>

        <!-- Abs -->
        <rect x="130" y="200" width="40" height="60" rx="5" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="150" y="235" text-anchor="middle" font-size="10" fill="#1e40af">Abs</text>

        <!-- Legs -->
        <ellipse cx="120" cy="300" rx="20" ry="30" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <ellipse cx="180" cy="300" rx="20" ry="30" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
        <text x="150" y="400" text-anchor="middle" font-size="14" fill="#6b7280">Click buttons above to test</text>
      </svg>
    `;

    container.innerHTML = basicSVG;
    console.log('✅ Basic SVG rendered');
  }

  /**
   * Show a simple test SVG for debugging
   */
  showSimpleTestSVG() {
    console.log('🧪 Showing simple test SVG...');
    const container = document.getElementById('muscle-diagram');
    if (!container) {
      console.error('❌ Container not found for test SVG');
      return;
    }

    const testSVG = `
      <svg viewBox="0 0 300 600" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 400px;">
        <rect width="300" height="600" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="3"/>
        <text x="150" y="200" text-anchor="middle" font-size="24" fill="#0369a1">Test SVG Loaded!</text>
        <text x="150" y="230" text-anchor="middle" font-size="16" fill="#0ea5e9">This confirms SVG rendering works</text>

        <!-- Test shapes -->
        <circle cx="150" cy="100" r="30" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="2"/>
        <rect x="120" y="300" width="60" height="40" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="2"/>

        <text x="150" y="380" text-anchor="middle" font-size="14" fill="#0369a1">Now try "Test Data" to see highlights!</text>
      </svg>
    `;

    container.innerHTML = testSVG;
    console.log('✅ Simple test SVG rendered');
  }

  /**
   * Create sample training data for testing
   */
  createSampleData() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    return [
      {
        id: today.toISOString().split('T')[0],
        entries: [
          {
            type: 'exercise',
            exerciseName: 'Bench Press',
            muscleSets: { 'Chest': 3, 'Triceps': 1.5, 'Shoulders': 1 },
            weight: 80,
            sets: 3,
            reps: 8
          },
          {
            type: 'exercise',
            exerciseName: 'Squats',
            muscleSets: { 'Quads': 3, 'Glutes': 2, 'Hamstrings': 1.5 },
            weight: 100,
            sets: 3,
            reps: 10
          }
        ]
      },
      {
        id: yesterday.toISOString().split('T')[0],
        entries: [
          {
            type: 'exercise',
            exerciseName: 'Pull-ups',
            muscleSets: { 'Back': 3, 'Biceps': 2, 'Shoulders': 1 },
            weight: 0,
            sets: 3,
            reps: 8
          }
        ]
      }
    ];
  }

  /**
   * Reset all muscle highlights
   */
  reset() {
    this.muscleIntensity = {};
    this.clearMuscleHighlights();
  }
}
