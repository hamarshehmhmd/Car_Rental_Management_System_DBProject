
import { createClient } from '@supabase/supabase-js';

// Supabase client setup
// NOTE: In a production environment, these values should come from environment variables
// When connected to Lovable's Supabase integration, these will be properly configured
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
