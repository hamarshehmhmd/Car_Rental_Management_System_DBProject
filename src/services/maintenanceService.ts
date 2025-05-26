
import { MaintenanceRecord, MaintenanceStatus } from '@/types';
import { supabaseService } from './supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Transformer for MaintenanceRecord data
const maintenanceTransformer = {
  toFrontend: (dbRecord: any): MaintenanceRecord => {
    return {
      id: dbRecord.id,
      vehicleId: dbRecord.vehicleid,
      maintenanceType: dbRecord.maintenancetype,
      description: dbRecord.description,
      technicianId: dbRecord.technicianid,
      maintenanceDate: dbRecord.maintenancedate,
      mileage: dbRecord.mileage,
      cost: dbRecord.cost,
      status: dbRecord.status as MaintenanceStatus,
      vehicleInfo: dbRecord.vehicleInfo || 'Unknown Vehicle',
      technicianName: dbRecord.technicianName || 'Unknown Technician'
    };
  },
  toDatabase: (record: Partial<MaintenanceRecord>): Record<string, any> => {
    const dbRecord: Record<string, any> = {};
    
    if (record.vehicleId) dbRecord.vehicleid = record.vehicleId;
    if (record.maintenanceType) dbRecord.maintenancetype = record.maintenanceType;
    if (record.description) dbRecord.description = record.description;
    if (record.technicianId) dbRecord.technicianid = record.technicianId;
    if (record.maintenanceDate) dbRecord.maintenancedate = record.maintenanceDate;
    if (record.mileage !== undefined) dbRecord.mileage = record.mileage;
    if (record.cost !== undefined) dbRecord.cost = record.cost;
    if (record.status) dbRecord.status = record.status;
    
    return dbRecord;
  }
};

export const maintenanceService = {
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      // Get base maintenance records
      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select('*');
        
      if (error) throw error;
      
      // Enhance with vehicle and technician info
      const enhancedRecords = await Promise.all((records || []).map(async (record) => {
        const maintenanceRecord = maintenanceTransformer.toFrontend(record);
        
        // Get vehicle info
        if (record.vehicleid) {
          try {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('make, model, year')
              .eq('id', record.vehicleid)
              .maybeSingle();
              
            if (vehicle) {
              maintenanceRecord.vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            }
          } catch (e) {
            console.error('Error fetching vehicle for maintenance record:', e);
          }
        }
        
        // Get technician info (using users table as a placeholder)
        if (record.technicianid) {
          try {
            const { data: technician } = await supabase
              .from('users')
              .select('firstname, lastname')
              .eq('id', record.technicianid)
              .maybeSingle();
              
            if (technician) {
              maintenanceRecord.technicianName = `${technician.firstname} ${technician.lastname}`;
            }
          } catch (e) {
            console.error('Error fetching technician for maintenance record:', e);
          }
        }
        
        return maintenanceRecord;
      }));
      
      return enhancedRecords;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      toast({
        title: 'Error fetching maintenance records',
        description: 'Could not fetch maintenance data.',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  async createMaintenanceRecord(record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    // Ensure technician ID is a valid UUID by creating/finding a technician
    if (!record.technicianId || record.technicianId.length < 36) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create a default technician user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            firstname: 'System',
            lastname: 'Technician',
            email: 'technician@system.com',
            role: 'technician'
          })
          .select()
          .single();
        
        if (userError) throw userError;
        record.technicianId = newUser.id;
      } else {
        record.technicianId = existingUsers[0].id;
      }
    }
    
    return await supabaseService.create('maintenance_records', record, maintenanceTransformer);
  },
  
  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return await supabaseService.update('maintenance_records', id, record, maintenanceTransformer);
  },
  
  async deleteMaintenanceRecord(id: string): Promise<void> {
    return await supabaseService.delete('maintenance_records', id);
  }
};
