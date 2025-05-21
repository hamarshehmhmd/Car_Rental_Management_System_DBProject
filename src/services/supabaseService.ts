
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TableNames = keyof Database['public']['Tables'];

// Generic data service for Supabase operations
export const supabaseService = {
  // Generic fetch function for any table
  async getAll<T>(tableName: TableNames): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      return (data || []) as T[];
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
  async getById<T>(tableName: TableNames, id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error fetching ${tableName} by ID:`, error);
      return null;
    }
  },
  
  // Create a new item
  async create<T>(tableName: TableNames, item: Record<string, any>): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Created Successfully',
        description: `New ${tableName.slice(0, -1)} has been created.`,
      });
      
      return data as T;
    } catch (error) {
      console.error(`Error creating ${tableName}:`, error);
      toast({
        title: 'Error Creating',
        description: `Could not create ${tableName.slice(0, -1)}.`,
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update an existing item
  async update<T>(tableName: TableNames, id: string, item: Record<string, any>): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(item)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Updated Successfully',
        description: `${tableName.slice(0, -1)} has been updated.`,
      });
      
      return data as T;
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast({
        title: 'Error Updating',
        description: `Could not update ${tableName.slice(0, -1)}.`,
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
        description: `${tableName.slice(0, -1)} has been deleted.`,
      });
    } catch (error) {
      console.error(`Error deleting ${tableName}:`, error);
      toast({
        title: 'Error Deleting',
        description: `Could not delete ${tableName.slice(0, -1)}.`,
        variant: 'destructive'
      });
      throw error;
    }
  }
};
