// Chart Renderer Module
// Handles rendering of charts and visualizations

export class ChartRenderer {
  constructor() {
    this.muscleGroups = [
      'Chest', 'Back', 'Lats', 'Traps', 'Rear Delts', 'Front Delts',
      'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core'
    ];
  }

  init() {
    console.log('📊 Chart renderer initialized');
  }

  renderBarChart(totals) {
    const container = document.getElementById('bar-chart');
    if (!container) return;

    if (Object.keys(totals).length === 0) {
      container.innerHTML = '<p>No training data to display</p>';
      return;
    }

    const sortedData = Object.entries(totals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Show top 10

    const maxValue = Math.max(...Object.values(totals));
    const chartHeight = 250;
    const barWidth = 30;
    const barSpacing = 10;
    const totalWidth = sortedData.length * (barWidth + barSpacing);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', totalWidth);
    svg.setAttribute('height', chartHeight);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    // Create bars
    sortedData.forEach(([muscle, sets], index) => {
      const x = index * (barWidth + barSpacing);
      const height = (sets / maxValue) * (chartHeight - 60);
      const y = chartHeight - 60 - height;

      // Bar
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', height);
      rect.setAttribute('fill', '#2563eb');
      rect.setAttribute('rx', '2');

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', chartHeight - 40);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#475569');
      text.textContent = muscle;

      // Value
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 5);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '12');
      valueText.setAttribute('font-weight', '600');
      valueText.setAttribute('fill', '#0f172a');
      valueText.textContent = sets.toFixed(1);

      svg.appendChild(rect);
      svg.appendChild(text);
      svg.appendChild(valueText);
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  renderHeatMap(totals) {
    const container = document.getElementById('muscle-heat-map');
    if (!container) return;

    if (Object.keys(totals).length === 0) {
      container.innerHTML = '<p>No training data to display</p>';
      return;
    }

    const maxValue = Math.max(...Object.values(totals));
    const gridSize = 4; // 4x4 grid for 13 muscle groups (some will be empty)
    const cellSize = 80;
    const spacing = 10;
    const totalSize = gridSize * (cellSize + spacing);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', totalSize);
    svg.setAttribute('height', totalSize);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    // Create muscle group grid
    this.muscleGroups.forEach((muscle, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = col * (cellSize + spacing);
      const y = row * (cellSize + spacing);

      const sets = totals[muscle] || 0;
      const intensity = Math.min(sets / 15, 1); // Normalize to 0-1, max at 15 sets

      // Calculate color based on intensity
      const color = this.getHeatMapColor(intensity);

      // Cell background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', cellSize);
      rect.setAttribute('height', cellSize);
      rect.setAttribute('fill', color);
      rect.setAttribute('stroke', '#e2e8f0');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('rx', '4');

      // Muscle name
      const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nameText.setAttribute('x', x + cellSize / 2);
      nameText.setAttribute('y', y + 20);
      nameText.setAttribute('text-anchor', 'middle');
      nameText.setAttribute('font-size', '10');
      nameText.setAttribute('font-weight', '600');
      nameText.setAttribute('fill', intensity > 0.5 ? '#ffffff' : '#0f172a');
      nameText.textContent = muscle;

      // Sets value
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + cellSize / 2);
      valueText.setAttribute('y', y + 40);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('font-size', '12');
      valueText.setAttribute('font-weight', '700');
      valueText.setAttribute('fill', intensity > 0.5 ? '#ffffff' : '#0f172a');
      valueText.textContent = `${sets.toFixed(1)}`;

      // Status indicator
      const status = this.getStatusClass(sets);
      const statusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      statusText.setAttribute('x', x + cellSize / 2);
      statusText.setAttribute('y', y + 60);
      statusText.setAttribute('text-anchor', 'middle');
      statusText.setAttribute('font-size', '8');
      statusText.setAttribute('font-weight', '500');
      statusText.setAttribute('fill', intensity > 0.5 ? '#ffffff' : '#475569');
      statusText.textContent = status.toUpperCase();

      svg.appendChild(rect);
      svg.appendChild(nameText);
      svg.appendChild(valueText);
      svg.appendChild(statusText);
    });

    container.innerHTML = '';
    container.appendChild(svg);
  }

  getHeatMapColor(intensity) {
    // Interpolate from light gray to red
    const red = Math.round(220 + (35 - 220) * intensity);
    const green = Math.round(232 + (99 - 232) * intensity);
    const blue = Math.round(240 + (235 - 240) * intensity);

    return `rgb(${red}, ${green}, ${blue})`;
  }

  getStatusClass(sets) {
    if (sets < 10) return 'under';
    if (sets <= 15) return 'good';
    return 'high';
  }
}
