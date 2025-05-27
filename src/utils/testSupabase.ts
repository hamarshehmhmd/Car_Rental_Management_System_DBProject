import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('vehicles')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log(`📊 Vehicles table has ${connectionTest} records`);
    
    // Test each table
    const tables = ['vehicles', 'customers', 'rentals', 'reservations', 'payments', 'invoices', 'vehicle_categories'] as const;
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.error(`❌ Error querying ${table}:`, error);
        } else {
          console.log(`📋 ${table}: ${count || 0} records`);
          if (data && data.length > 0) {
            console.log(`   Sample record:`, data[0]);
          }
        }
      } catch (err) {
        console.error(`❌ Exception querying ${table}:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
}; 