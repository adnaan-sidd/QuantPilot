import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js']
    },
    define: {
      // Polyfill process.env for the AI service
      'process.env.API_KEY': JSON.stringify(env.API_KEY) 
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
