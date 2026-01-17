import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// ============================================
// AURION SaaS - VITE CONFIGURATION
// Optimized for production at scale
// Supports 10,000+ concurrent users
// ============================================

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      // React with SWC (faster than Babel)
      react(),
      
      // PWA for offline support and performance
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'AURION - AI SaaS Platform',
          short_name: 'AURION',
          description: 'Enterprise AI tools platform with credits system',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/vite.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          // Cache strategies optimized for SaaS
          runtimeCaching: [
            {
              // API calls - Network first with cache fallback
              urlPattern: /^https:\/\/.*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Static assets - Cache first
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              // Fonts - Cache first (rarely change)
              urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              // External APIs (Clerk, Supabase, Stripe)
              urlPattern: /^https:\/\/(.*\.clerk\..*|.*\.supabase\..*|.*\.stripe\..*)/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'external-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 2, // 2 minutes
                },
                networkTimeoutSeconds: 15,
              },
            },
          ],
          // Skip waiting for immediate updates
          skipWaiting: true,
          clientsClaim: true,
          // Clean old caches
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false, // Disable in dev
        },
      }),
    ],

    // ============================================
    // BUILD OPTIMIZATION - Production Grade
    // ============================================
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
      sourcemap: false,
      
    rollupOptions: {
      output: {
          // Aggressive code splitting for optimal caching
          manualChunks: (id) => {
            // Core React - rarely changes
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/react-router-dom')) {
              return 'react-vendor';
            }
            
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
          
          // State management
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-vendor';
            }
            
            // Database only (exclude Clerk from vendor chunks)
            if (id.includes('@supabase')) {
              return 'data-vendor';
            }
            
            // Animations - lazy loaded
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'animation-vendor';
            }
            
            // Charts - lazy loaded
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            
            // Lodash utilities
            if (id.includes('lodash')) {
              return 'utils-vendor';
            }
          },
          
          // Optimize chunk naming for CDN caching
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || 'chunk';
            return `assets/${name}-[hash].js`;
          },
        entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop() || 'asset';
            if (/png|jpe?g|svg|gif|webp|ico/i.test(extType)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/woff2?|ttf|otf|eot/i.test(extType)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
      },
        
        // External dependencies that should not be bundled
        external: [],
        
        // Treeshake more aggressively
        treeshake: {
          preset: 'smallest',
          manualPureFunctions: ['console.log', 'console.debug'],
    },
  },
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Asset inlining threshold (4KB)
      assetsInlineLimit: 4096,
    },

    // ============================================
    // RESOLVE ALIASES
    // ============================================
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },

    // ============================================
    // CSS CONFIGURATION
    // ============================================
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: false,
  },

    // ============================================
    // DEPENDENCY OPTIMIZATION
    // ============================================
  optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'clsx',
        'tailwind-merge',
        'lucide-react',
      ],
      exclude: ['@clerk/clerk-react'],
      // Force re-optimization on changes
      force: false,
    },

    // ============================================
    // ESBUILD OPTIMIZATION
    // ============================================
    esbuild: {
      // Remove console.log in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Legal comments handling
      legalComments: 'none',
      // Target modern browsers
      target: 'esnext',
    },

    // ============================================
    // SERVER CONFIGURATION (Dev)
    // ============================================
  server: {
    host: true,
    port: 5173,
    strictPort: true,
      // CORS configuration for development
      cors: true,
      // HMR configuration
      hmr: {
        overlay: true,
      },
    },

    // ============================================
    // PREVIEW CONFIGURATION
    // ============================================
  preview: {
    host: true,
    port: 4173,
      cors: true,
    },

    // ============================================
    // DEFINE GLOBAL CONSTANTS
    // ============================================
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: isProduction,
  },
  };
});
