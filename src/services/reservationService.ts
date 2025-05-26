
import { supabase } from '@/integrations/supabase/client';
import { Reservation, ReservationStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Reservation data
const reservationTransformer = {
  toFrontend: (dbReservation: any): Reservation => {
    return {
      id: dbReservation.id,
      customerId: dbReservation.customerid,
      categoryId: dbReservation.categoryid,
      vehicleId: dbReservation.vehicleid,
      employeeId: dbReservation.employeeid,
      reservationDate: dbReservation.reservationdate,
      pickupDate: dbReservation.pickupdate,
      returnDate: dbReservation.returndate,
      status: dbReservation.status as ReservationStatus,
      customerName: dbReservation.customerName || 'Unknown Customer',
      categoryName: dbReservation.categoryName || 'Unknown Category',
      vehicleInfo: dbReservation.vehicleInfo || null
    };
  },
  toDatabase: (reservation: Partial<Reservation>): Record<string, any> => {
    const dbReservation: Record<string, any> = {};
    
    if (reservation.customerId) dbReservation.customerid = reservation.customerId;
    if (reservation.categoryId) dbReservation.categoryid = reservation.categoryId;
    if (reservation.vehicleId) dbReservation.vehicleid = reservation.vehicleId;
    if (reservation.employeeId) dbReservation.employeeid = reservation.employeeId;
    if (reservation.reservationDate) dbReservation.reservationdate = reservation.reservationDate;
    if (reservation.pickupDate) dbReservation.pickupdate = reservation.pickupDate;
    if (reservation.returnDate) dbReservation.returndate = reservation.returnDate;
    if (reservation.status) dbReservation.status = reservation.status;
    
    return dbReservation;
  }
};

export const reservationService = {
  async getReservations(): Promise<Reservation[]> {
    try {
      // Get base reservation records
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*');
        
      if (error) throw error;
      
      // Enhance with customer, category, and vehicle info
      const enhancedReservations = await Promise.all((reservations || []).map(async (reservation) => {
        const reservationRecord = reservationTransformer.toFrontend(reservation);
        
        // Get customer info
        if (reservation.customerid) {
          try {
            const { data: customer } = await supabase
              .from('customers')
              .select('firstname, lastname')
              .eq('id', reservation.customerid)
              .maybeSingle();
              
            if (customer) {
              reservationRecord.customerName = `${customer.firstname} ${customer.lastname}`;
            }
          } catch (e) {
            console.error('Error fetching customer for reservation:', e);
          }
        }
        
        // Get category info
        if (reservation.categoryid) {
          try {
            const { data: category } = await supabase
              .from('vehicle_categories')
              .select('name')
              .eq('id', reservation.categoryid)
              .maybeSingle();
              
            if (category) {
              reservationRecord.categoryName = category.name;
            }
          } catch (e) {
            console.error('Error fetching category for reservation:', e);
          }
        }
        
        // Get vehicle info if assigned
        if (reservation.vehicleid) {
          try {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('make, model, year')
              .eq('id', reservation.vehicleid)
              .maybeSingle();
              
            if (vehicle) {
              reservationRecord.vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            }
          } catch (e) {
            console.error('Error fetching vehicle for reservation:', e);
          }
        }
        
        return reservationRecord;
      }));
      
      return enhancedReservations;
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'Error fetching reservations',
        description: 'Could not fetch reservation data.',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  async createReservation(reservation: Partial<Reservation>): Promise<Reservation> {
    // Create a default employee ID if not provided
    if (!reservation.employeeId) {
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create a default user for operations
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            firstname: 'System',
            lastname: 'Admin',
            email: 'admin@system.com',
            role: 'admin'
          })
          .select()
          .single();
        
        if (userError) throw userError;
        reservation.employeeId = newUser.id;
      } else {
        reservation.employeeId = existingUsers[0].id;
      }
    }
    
    return await supabaseService.create('reservations', reservation, reservationTransformer);
  },
  
  async updateReservation(id: string, reservation: Partial<Reservation>): Promise<Reservation> {
    return await supabaseService.update('reservations', id, reservation, reservationTransformer);
  },
  
  async deleteReservation(id: string): Promise<void> {
    try {
      // First, delete any associated rentals and their invoices
      const { data: rentals } = await supabase
        .from('rentals')
        .select('id')
        .eq('reservationid', id);
      
      if (rentals && rentals.length > 0) {
        // Delete invoices first
        for (const rental of rentals) {
          await supabase
            .from('invoices')
            .delete()
            .eq('rentalid', rental.id);
        }
        
        // Then delete rentals
        await supabase
          .from('rentals')
          .delete()
          .eq('reservationid', id);
      }
      
      // Finally delete the reservation
      await supabaseService.delete('reservations', id);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: 'Error deleting reservation',
        description: 'Could not delete the reservation.',
        variant: 'destructive'
      });
      throw error;
    }
  }
};
