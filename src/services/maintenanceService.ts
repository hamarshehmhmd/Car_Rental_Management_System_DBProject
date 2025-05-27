
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
    try {
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
      
      // When creating a maintenance record, update the vehicle status to 'maintenance'
      if (record.vehicleId && (record.status === 'pending' || record.status === 'in_progress')) {
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({ status: 'maintenance' })
          .eq('id', record.vehicleId);
        
        if (vehicleUpdateError) {
          console.error('Error updating vehicle status:', vehicleUpdateError);
        } else {
          console.log(`Vehicle ${record.vehicleId} status updated to maintenance`);
        }
      }
      
      return await supabaseService.create('maintenance_records', record, maintenanceTransformer);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  },
  
  async updateMaintenanceRecord(id: string, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    try {
      // Get the current maintenance record to check vehicle ID
      const { data: currentRecord } = await supabase
        .from('maintenance_records')
        .select('vehicleid, status')
        .eq('id', id)
        .single();
      
      // If maintenance is being completed, set vehicle back to available
      if (record.status === 'completed' && currentRecord?.vehicleid) {
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', currentRecord.vehicleid);
        
        if (vehicleUpdateError) {
          console.error('Error updating vehicle status back to available:', vehicleUpdateError);
        } else {
          console.log(`Vehicle ${currentRecord.vehicleid} status updated back to available`);
        }
      }
      
      // If maintenance is being started, set vehicle to maintenance
      if ((record.status === 'pending' || record.status === 'in_progress') && currentRecord?.vehicleid) {
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({ status: 'maintenance' })
          .eq('id', currentRecord.vehicleid);
        
        if (vehicleUpdateError) {
          console.error('Error updating vehicle status to maintenance:', vehicleUpdateError);
        } else {
          console.log(`Vehicle ${currentRecord.vehicleid} status updated to maintenance`);
        }
      }
      
      return await supabaseService.update('maintenance_records', id, record, maintenanceTransformer);
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      throw error;
    }
  },
  
  async deleteMaintenanceRecord(id: string): Promise<void> {
    try {
      // Get the maintenance record to find the vehicle ID
      const { data: maintenanceRecord } = await supabase
        .from('maintenance_records')
        .select('vehicleid')
        .eq('id', id)
        .single();
      
      // Delete the maintenance record
      await supabaseService.delete('maintenance_records', id);
      
      // If there was a vehicle associated, set it back to available
      if (maintenanceRecord?.vehicleid) {
        const { error: vehicleUpdateError } = await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', maintenanceRecord.vehicleid);
        
        if (vehicleUpdateError) {
          console.error('Error updating vehicle status back to available:', vehicleUpdateError);
        } else {
          console.log(`Vehicle ${maintenanceRecord.vehicleid} status updated back to available after maintenance deletion`);
        }
      }
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      throw error;
    }
  }
};
