
import { createClient } from '@supabase/supabase-js';
import { isAbortError } from '../utils/error';

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

// Log initialization (obfuscated key)
console.log('Supabase Client Initializing with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: async (url, options) => {
      const maxRetries = 5;
      let lastError: any;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          // Check if online
          if (typeof window !== 'undefined' && !window.navigator.onLine) {
            throw new Error('Browser is offline');
          }

          const response = await fetch(url, options);
          
          // If the response is not ok (e.g., 5xx), we might want to retry
          if (!response.ok && response.status >= 500) {
            throw new Error(`Supabase server error: ${response.status} ${response.statusText}`);
          }
          
          return response;
        } catch (err: any) {
          lastError = err;
          
          // Don't retry if aborted
          if (isAbortError(err)) {
            throw err;
          }
          
          const isNetworkError = err.message === 'Failed to fetch' || 
                               err.name === 'TypeError' || 
                               err.message?.includes('network') ||
                               err.message?.includes('offline');

          // Log the error for debugging
          console.warn(`Supabase fetch attempt ${i + 1}/${maxRetries} failed:`, err.message || err);
          
          // Wait before retrying (exponential backoff)
          if (i < maxRetries - 1 && (isNetworkError || (err.message?.includes('server error')))) {
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Add jitter
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // If it's not a retryable error, throw immediately
            if (!isNetworkError && !err.message?.includes('server error')) {
              throw err;
            }
          }
        }
      }
      
      // If we get here, all retries failed
      const finalError = new Error(`Supabase fetch failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`);
      // @ts-ignore
      finalError.originalError = lastError;
      
      console.error('Supabase fetch failed after retries:', finalError);
      throw finalError;
    }
  }
});
