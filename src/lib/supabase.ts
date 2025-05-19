
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase client setup with environment variables
// When connected to Lovable's Supabase integration, these will be properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RtdWNnaHpBaXRXVWZYUXdWN2QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNTUzMjcxMSwiZXhwIjoyMDMxMTA4NzExfQ.QvLzY7pHdkYJL9JFaA-NMPMKfATUH-ZZRGzJ-EGqldg';

// Create Supabase client
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
