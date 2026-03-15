
import { supabase } from './services/supabaseClient';

async function testFetch() {
  console.log('Testing fetch...');
  const { data, error } = await supabase
    .from('minifigures')
    .select('item_no')
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Data:', data);
  }
}

testFetch();
