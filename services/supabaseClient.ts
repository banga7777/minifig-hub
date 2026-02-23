
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jlbqyxaktbcrjylzqrqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYnF5eGFrdGJjcmp5bHpxcnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTEzNDIsImV4cCI6MjA4MDgyNzM0Mn0.BOBg8X_unHCr7MAxzsJ2rlP-TGlKIrthntyLA8ZzPUs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
