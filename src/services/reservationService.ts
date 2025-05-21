
import { Reservation, ReservationStatus } from '@/types';
import { supabaseService } from './supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Transformer for Reservation data
const reservationTransformer = {
  toFrontend: (dbReservation: any): Reservation => {
    return {
      id: dbReservation.id,
      customerId: dbReservation.customerid,
      categoryId: dbReservation.categoryid,
      vehicleId: dbReservation.vehicleid,
      reservationDate: dbReservation.reservationdate,
      pickupDate: dbReservation.pickupdate,
      returnDate: dbReservation.returndate,
      status: dbReservation.status as ReservationStatus,
      employeeId: dbReservation.employeeid,
      customerName: dbReservation.customerName || 'Unknown Customer',
      categoryName: dbReservation.categoryName || 'Unknown Category',
      vehicleInfo: dbReservation.vehicleInfo
    };
  },
  toDatabase: (reservation: Partial<Reservation>): Record<string, any> => {
    const dbReservation: Record<string, any> = {};
    
    if (reservation.customerId) dbReservation.customerid = reservation.customerId;
    if (reservation.categoryId) dbReservation.categoryid = reservation.categoryId;
    if (reservation.vehicleId) dbReservation.vehicleid = reservation.vehicleId;
    if (reservation.reservationDate) dbReservation.reservationdate = reservation.reservationDate;
    if (reservation.pickupDate) dbReservation.pickupdate = reservation.pickupDate;
    if (reservation.returnDate) dbReservation.returndate = reservation.returnDate;
    if (reservation.status) dbReservation.status = reservation.status;
    if (reservation.employeeId) dbReservation.employeeid = reservation.employeeId;
    
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
        const reservationModel = reservationTransformer.toFrontend(reservation);
        
        // Get customer info
        if (reservation.customerid) {
          try {
            const { data: customer } = await supabase
              .from('customers')
              .select('firstname, lastname')
              .eq('id', reservation.customerid)
              .maybeSingle();
              
            if (customer) {
              reservationModel.customerName = `${customer.firstname} ${customer.lastname}`;
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
              reservationModel.categoryName = category.name;
            }
          } catch (e) {
            console.error('Error fetching category for reservation:', e);
          }
        }
        
        // Get vehicle info
        if (reservation.vehicleid) {
          try {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('make, model, year')
              .eq('id', reservation.vehicleid)
              .maybeSingle();
              
            if (vehicle) {
              reservationModel.vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            }
          } catch (e) {
            console.error('Error fetching vehicle for reservation:', e);
          }
        }
        
        return reservationModel;
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
    return await supabaseService.create('reservations', reservation, reservationTransformer);
  },
  
  async updateReservation(id: string, reservation: Partial<Reservation>): Promise<Reservation> {
    return await supabaseService.update('reservations', id, reservation, reservationTransformer);
  },
  
  async deleteReservation(id: string): Promise<void> {
    return await supabaseService.delete('reservations', id);
  }
};
