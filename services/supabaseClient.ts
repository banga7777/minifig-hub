
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use hardcoded fallbacks
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}
  
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://jlbqyxaktbcrjylzqrqm.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYnF5eGFrdGJjcmp5bHpxcnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTEzNDIsImV4cCI6MjA4MDgyNzM0Mn0.BOBg8X_unHCr7MAxzsJ2rlP-TGlKIrthntyLA8ZzPUs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: async (url, options) => {
      const maxRetries = 3;
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, options);
          
          // If the response is not ok (e.g., 5xx), we might want to retry
          if (!response.ok && response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          return response;
        } catch (err: unknown) {
          lastError = err;
          
          // Don't retry if aborted
          if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('signal is aborted'))) {
            throw err;
          }
          
          // Log the error for debugging
          console.warn(`Supabase fetch attempt ${i + 1} failed:`, err);
          
          // Wait before retrying (exponential backoff)
          if (i < maxRetries - 1) {
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // If we get here, all retries failed
      console.error('Supabase fetch failed after retries:', lastError);
      throw lastError;
    }
  }
});
