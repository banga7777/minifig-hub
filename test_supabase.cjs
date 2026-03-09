const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jlbqyxaktbcrjylzqrqm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYnF5eGFrdGJjcmp5bHpxcnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTEzNDIsImV4cCI6MjA4MDgyNzM0Mn0.BOBg8X_unHCr7MAxzsJ2rlP-TGlKIrthntyLA8ZzPUs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('minifig_supersets_grouped')
    .select('*')
    .eq('item_no', 'sw0700');
  
  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
