
import { supabase } from '@/integrations/supabase/client';
import { Rental, RentalStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Rental data between database and frontend
const rentalTransformer = {
  toFrontend: (dbRental: any): Rental => {
    return {
      id: dbRental.id,
      reservationId: dbRental.reservationid,
      customerId: dbRental.customerid,
      vehicleId: dbRental.vehicleid,
      checkoutEmployeeId: dbRental.checkoutemployeeid,
      checkinEmployeeId: dbRental.checkinemployeeid,
      checkoutDate: dbRental.checkoutdate,
      expectedReturnDate: dbRental.expectedreturndate,
      actualReturnDate: dbRental.actualreturndate,
      checkoutMileage: dbRental.checkoutmileage,
      returnMileage: dbRental.returnmileage,
      status: dbRental.status as RentalStatus,
      customerName: dbRental.customers ? 
        `${dbRental.customers.firstname} ${dbRental.customers.lastname}` : undefined,
      vehicleInfo: dbRental.vehicles ? 
        `${dbRental.vehicles.make} ${dbRental.vehicles.model} (${dbRental.vehicles.year})` : undefined,
    };
  },
  toDatabase: (rental: Partial<Rental>): Record<string, any> => {
    const dbRental: Record<string, any> = {};
    
    if (rental.reservationId !== undefined) dbRental.reservationid = rental.reservationId;
    if (rental.customerId !== undefined) dbRental.customerid = rental.customerId;
    if (rental.vehicleId !== undefined) dbRental.vehicleid = rental.vehicleId;
    if (rental.checkoutEmployeeId !== undefined) dbRental.checkoutemployeeid = rental.checkoutEmployeeId;
    if (rental.checkinEmployeeId !== undefined) dbRental.checkinemployeeid = rental.checkinEmployeeId;
    if (rental.checkoutDate !== undefined) dbRental.checkoutdate = rental.checkoutDate;
    if (rental.expectedReturnDate !== undefined) dbRental.expectedreturndate = rental.expectedReturnDate;
    if (rental.actualReturnDate !== undefined) dbRental.actualreturndate = rental.actualReturnDate;
    if (rental.checkoutMileage !== undefined) dbRental.checkoutmileage = rental.checkoutMileage;
    if (rental.returnMileage !== undefined) dbRental.returnmileage = rental.returnMileage;
    if (rental.status !== undefined) dbRental.status = rental.status;
    
    return dbRental;
  }
};

export const rentalService = {
  // Fetch rentals from Supabase with joined customer and vehicle data
  async getRentals(): Promise<Rental[]> {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers (firstname, lastname),
          vehicles (make, model, year)
        `);

      if (error) throw error;

      return data.map(rentalTransformer.toFrontend);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: 'Error fetching rentals',
        description: 'Could not fetch rental data.',
        variant: 'destructive'
      });
      return [];
    }
  },

  // Get rental by ID
  async getRentalById(id: string): Promise<Rental | null> {
    try {
      return await supabaseService.getById<any, Rental>('rentals', id, rentalTransformer);
    } catch (error) {
      console.error('Error fetching rental:', error);
      return null;
    }
  },

  // Create a new rental
  async createRental(rental: Partial<Rental>): Promise<Rental> {
    try {
      return await supabaseService.create<any, Rental>('rentals', rental, rentalTransformer);
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: 'Error creating rental',
        description: 'Could not create the rental.',
        variant: 'destructive'
      });
      throw error;
    }
  },

  // Update an existing rental
  async updateRental(id: string, rental: Partial<Rental>): Promise<Rental> {
    try {
      return await supabaseService.update<any, Rental>('rentals', id, rental, rentalTransformer);
    } catch (error) {
      console.error('Error updating rental:', error);
      toast({
        title: 'Error updating rental',
        description: 'Could not update the rental.',
        variant: 'destructive'
      });
      throw error;
    }
  },

  // Delete a rental
  async deleteRental(id: string): Promise<void> {
    try {
      await supabaseService.delete('rentals', id);
      
      toast({
        title: 'Rental deleted',
        description: 'Rental has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting rental:', error);
      toast({
        title: 'Error deleting rental',
        description: 'Could not delete the rental.',
        variant: 'destructive'
      });
      throw error;
    }
  }
};
