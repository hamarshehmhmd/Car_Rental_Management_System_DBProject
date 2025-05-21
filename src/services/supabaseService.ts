
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TableNames = keyof Database['public']['Tables'];

// Type for transforming data between database and frontend models
type DataTransformer<DBType, FrontendType> = {
  toFrontend: (dbData: DBType) => FrontendType;
  toDatabase: (frontendData: Partial<FrontendType>) => Partial<DBType>;
};

// Generic data service for Supabase operations
export const supabaseService = {
  // Generic fetch function for any table with data transformation
  async getAll<DBType, FrontendType>(
    tableName: TableNames, 
    transformer: DataTransformer<DBType, FrontendType>
  ): Promise<FrontendType[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      
      return (data || []).map(item => transformer.toFrontend(item as DBType));
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast({
        title: `Error fetching data`,
        description: `Could not fetch ${tableName} data.`,
        variant: 'destructive'
      });
      throw error;
    }
  },

  // Get a single item by ID
  async getById<DBType, FrontendType>(
    tableName: TableNames, 
    id: string, 
    transformer: DataTransformer<DBType, FrontendType>
  ): Promise<FrontendType | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return transformer.toFrontend(data as DBType);
    } catch (error) {
      console.error(`Error fetching ${tableName} by ID:`, error);
      return null;
    }
  },
  
  // Create a new item
  async create<DBType, FrontendType>(
    tableName: TableNames, 
    item: Partial<FrontendType>,
    transformer: DataTransformer<DBType, FrontendType>
  ): Promise<FrontendType> {
    try {
      const dbItem = transformer.toDatabase(item);
      const { data, error } = await supabase
        .from(tableName)
        .insert(dbItem)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Created Successfully',
        description: `New record has been created.`,
      });
      
      return transformer.toFrontend(data as DBType);
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      toast({
        title: 'Error Creating',
        description: `Could not create record.`,
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update an existing item
  async update<DBType, FrontendType>(
    tableName: TableNames, 
    id: string, 
    item: Partial<FrontendType>,
    transformer: DataTransformer<DBType, FrontendType>
  ): Promise<FrontendType> {
    try {
      const dbItem = transformer.toDatabase(item);
      const { data, error } = await supabase
        .from(tableName)
        .update(dbItem)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Updated Successfully',
        description: `Record has been updated.`,
      });
      
      return transformer.toFrontend(data as DBType);
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast({
        title: 'Error Updating',
        description: `Could not update record.`,
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Delete an item
  async delete(tableName: TableNames, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Deleted Successfully',
        description: `Record has been deleted.`,
      });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      toast({
        title: 'Error Deleting',
        description: `Could not delete record.`,
        variant: 'destructive'
      });
      throw error;
    }
  }
};
