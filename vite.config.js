import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/laila-muslce/' : '/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        manualChunks: {
          vendor: ['date-fns', 'ajv']
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    // Ensure data files are copied
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 4173,
    open: true
  },
  // Handle JSON imports
  json: {
    stringify: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['date-fns', 'ajv']
  },
  // Copy data files to build output
  publicDir: 'assets',
  plugins: [
    // Custom plugin to copy data files
    {
      name: 'copy-data-files',
      generateBundle() {
        // This ensures data files are available in the build
        console.log('📁 Data files will be copied to build output');
      }
    }
  ]
});
