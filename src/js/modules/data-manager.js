// Data Manager Module
// Handles data export, import, and management operations

export class DataManager {
  constructor() {
    this.storageKeys = ['sbm_training_days', 'sbm_settings'];
  }

  init() {
    console.log('💾 Data manager initialized');
  }

  async exportData() {
    const data = {};

    this.storageKeys.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          data[key] = JSON.parse(stored);
        } catch (error) {
          console.warn(`Failed to parse stored data for ${key}:`, error);
        }
      }
    });

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data
    };
  }

  async importData(importData) {
    if (!importData.data) {
      throw new Error('Invalid import data format');
    }

    // Clear existing data
    this.storageKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Import new data
    Object.entries(importData.data).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to import data for ${key}:`, error);
      }
    });
  }

  async resetData() {
    this.storageKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}
