# Sets by Muscle 💪

A lightweight, front-end-only web application for tracking strength training sets per muscle group. Perfect for planning around variable PT sessions and avoiding accidental over/under-training.

## 🎯 Project Overview

**Sets by Muscle** is a single-page web app that runs entirely in your browser with no backend required. It helps you:

## 🌐 Live Demo

**[View the live app here](https://driesmeerman.github.io/weekly-set-tracer/)**

> **Note:** Replace `[YOUR_USERNAME]` with your actual GitHub username in the URL above.

- Quickly log sets per muscle group for specific training days
- Visualize your training balance with bar charts and muscle heat maps
- Track weekly targets (10-15 sets per muscle group recommended)
- Search and filter your training history
- Export/import your data for backup and migration

## ✨ Key Features

### 🏋️ Training Management
- **Quick Add**: Type "3 sets bench" and automatically allocate sets to mapped muscles
- **Manual Entry**: Add sets directly to specific muscle groups
- **Training Days**: Organize workouts by date with notes and entries
- **Edit/Delete**: Modify or remove individual entries or entire days

### 📊 Analytics & Visualization
- **Rolling Totals**: View muscle group totals over customizable windows (3/7/14/28 days)
- **Bar Charts**: See your most-trained muscle groups at a glance
- **Muscle Heat Map**: Visual representation where redder = more training volume
- **Interactive Muscle Diagrams**: SVG muscle diagrams with dynamic highlighting based on training intensity
- **Target Status**: Get hints on whether you're under, good, or over your weekly targets

### 🔍 Search & History
- **Advanced Search**: Filter by date range, text, or muscle group
- **Training History**: Browse all your training days with notes and summaries
- **Data Export/Import**: Backup your data as JSON or restore from backups

### 💪 Muscle Visualization
- **Interactive Diagrams**: Front and back view muscle diagrams with hover tooltips
- **Dynamic Highlighting**: Muscles are colored based on training intensity (yellow → red scale)
- **View Switching**: Toggle between front and back muscle views
- **Touch Optimized**: Mobile-friendly interactions with touch feedback
- **Real-time Updates**: Muscle highlighting updates automatically based on your training data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with localStorage support

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd laila-muslce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

## 🚀 Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch** - The GitHub Action automatically builds and deploys
2. **No manual steps required** - Every push triggers a new deployment
3. **Live at** `https://[YOUR_USERNAME].github.io/laila-muslce/`

### Manual Deployment

For other hosting platforms:

```bash
npm run build
# Upload the contents of the dist/ folder to your web server
```

## 🛠️ Build Tooling

### Project Structure
```
laila-muslce/
├── src/                    # Source code
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   ├── data/              # Exercise data and configurations
│   └── assets/            # Images, SVGs, etc.
├── dist/                   # Built output (generated)
├── tools/                  # Build and data management tools
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run clean` - Clean build artifacts
- `npm run data:add` - Add new exercise to the database
- `npm run data:validate` - Validate exercise data structure
- `npm run data:export` - Export current exercise database

### Exercise Data Management

The app uses a JSON-based exercise database that maps exercise names to muscle group allocations. This data is:

- **Easy to extend**: Add new exercises via simple JSON files
- **Build-time integrated**: Automatically bundled during build
- **Version controlled**: Changes are tracked in git
- **Validated**: Schema validation ensures data integrity

#### Adding New Exercises

1. **Edit the exercise database** in `src/data/exercises.json`
2. **Run validation** to ensure data integrity:
   ```bash
   npm run data:validate
   ```
3. **Rebuild** the application:
   ```bash
   npm run build
   ```

#### Exercise Data Format

```json
{
  "name": "exercise_name",
  "displayName": "Exercise Display Name",
  "muscleGroups": {
    "Chest": 1.0,
    "Triceps": 0.5,
    "Front Delts": 0.33
  },
  "category": "push",
  "description": "Optional description"
}
```

## 🏗️ Architecture

### Frontend Stack
- **Vanilla JavaScript** - No frameworks, pure ES6+ modules
- **CSS3** - Modern CSS with custom properties and Grid/Flexbox
- **SVG** - Charts and muscle heat maps
- **localStorage** - Client-side data persistence

### Build System
- **Vite** - Fast development and optimized builds
- **ESBuild** - Lightning-fast JavaScript bundling
- **PostCSS** - CSS processing and optimization
- **Rollup** - Production bundling with tree-shaking

### Data Flow
1. **User Input** → Quick add parser or manual entry
2. **Data Processing** → Muscle allocation and storage
3. **State Management** → Local storage with schema validation
4. **UI Updates** → Reactive updates based on data changes
5. **Visualization** → Charts and heat maps generated from state

## 📱 Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES6 modules, localStorage, CSS Grid, SVG

## 🔧 Configuration

### Muscle Groups
The app tracks 13 primary muscle groups:
- Upper Body: Chest, Back, Lats, Traps, Rear Delts, Front Delts, Biceps, Triceps
- Lower Body: Quads, Hamstrings, Glutes, Calves
- Core: Core

### Training Targets
- **Default Range**: 10-15 sets per muscle group per week
- **Customizable**: Adjust targets per muscle group in settings
- **Visual Indicators**: Under (<10), Good (10-15), High (>15)

## 🚀 Deployment

### Static Hosting
The built application can be deployed to any static hosting service:

- **GitHub Pages**: Push to `gh-pages` branch
- **Netlify**: Drag and drop `dist/` folder
- **Vercel**: Connect repository for automatic deployments
- **Traditional hosting**: Upload `dist/` contents to web server

### Build Output
The build process generates:
- `index.html` - Main application file
- `assets/` - Optimized CSS, JS, and assets
- `data/` - Exercise database and configurations

## 🧪 Testing

### Manual Testing Checklist
- [ ] Quick add parsing for all exercise types
- [ ] Manual entry for all muscle groups
- [ ] Training day creation, editing, and deletion
- [ ] Data persistence across browser sessions
- [ ] Export/import functionality
- [ ] Responsive design on mobile devices
- [ ] Accessibility features (keyboard navigation, screen readers)

### Automated Testing (Future)
- Unit tests for core functions
- Integration tests for data flow
- E2E tests for user workflows
- Performance testing for build optimization

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Style
- **JavaScript**: ES6+ with consistent formatting
- **CSS**: BEM methodology with custom properties
- **HTML**: Semantic markup with accessibility in mind
- **Data**: JSON with clear schema and validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Laila** - The primary persona who inspired this project
- **PT Community** - For feedback on training tracking needs
- **Open Source** - Built with modern web standards and tools

## 📞 Support

- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions
- **Documentation**: Check the [Wiki](wiki) for detailed guides

---

**Built with ❤️ for the fitness community**

*Track your sets, balance your training, and crush your goals!*
