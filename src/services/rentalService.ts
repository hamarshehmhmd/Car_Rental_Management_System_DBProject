
import { supabase } from '@/integrations/supabase/client';
import { Rental, RentalStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Rental data
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
      customerName: dbRental.customerName || 'Unknown Customer',
      vehicleInfo: dbRental.vehicleInfo || 'Unknown Vehicle'
    };
  },
  toDatabase: (rental: Partial<Rental>): Record<string, any> => {
    const dbRental: Record<string, any> = {};
    
    if (rental.reservationId) dbRental.reservationid = rental.reservationId;
    if (rental.customerId) dbRental.customerid = rental.customerId;
    if (rental.vehicleId) dbRental.vehicleid = rental.vehicleId;
    if (rental.checkoutEmployeeId) dbRental.checkoutemployeeid = rental.checkoutEmployeeId;
    if (rental.checkinEmployeeId) dbRental.checkinemployeeid = rental.checkinEmployeeId;
    if (rental.checkoutDate) dbRental.checkoutdate = rental.checkoutDate;
    if (rental.expectedReturnDate) dbRental.expectedreturndate = rental.expectedReturnDate;
    if (rental.actualReturnDate) dbRental.actualreturndate = rental.actualReturnDate;
    if (rental.checkoutMileage !== undefined) dbRental.checkoutmileage = rental.checkoutMileage;
    if (rental.returnMileage !== undefined) dbRental.returnmileage = rental.returnMileage;
    if (rental.status) dbRental.status = rental.status;
    
    return dbRental;
  }
};

export const rentalService = {
  async getRentals(): Promise<Rental[]> {
    try {
      // Get base rental records
      const { data: rentals, error } = await supabase
        .from('rentals')
        .select('*');
        
      if (error) throw error;
      
      // Enhance with customer and vehicle info
      const enhancedRentals = await Promise.all((rentals || []).map(async (rental) => {
        const rentalRecord = rentalTransformer.toFrontend(rental);
        
        // Get customer info
        if (rental.customerid) {
          try {
            const { data: customer } = await supabase
              .from('customers')
              .select('firstname, lastname')
              .eq('id', rental.customerid)
              .maybeSingle();
              
            if (customer) {
              rentalRecord.customerName = `${customer.firstname} ${customer.lastname}`;
            }
          } catch (e) {
            console.error('Error fetching customer for rental:', e);
          }
        }
        
        // Get vehicle info
        if (rental.vehicleid) {
          try {
            const { data: vehicle } = await supabase
              .from('vehicles')
              .select('make, model, year')
              .eq('id', rental.vehicleid)
              .maybeSingle();
              
            if (vehicle) {
              rentalRecord.vehicleInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            }
          } catch (e) {
            console.error('Error fetching vehicle for rental:', e);
          }
        }
        
        return rentalRecord;
      }));
      
      return enhancedRentals;
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
  
  async createRental(rental: Partial<Rental>): Promise<Rental> {
    // Create a default employee ID if not provided
    if (!rental.checkoutEmployeeId) {
      // First, check if we have any users in the database
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
        rental.checkoutEmployeeId = newUser.id;
      } else {
        rental.checkoutEmployeeId = existingUsers[0].id;
      }
    }
    
    return await supabaseService.create('rentals', rental, rentalTransformer);
  },
  
  async updateRental(id: string, rental: Partial<Rental>): Promise<Rental> {
    // If updating with checkin employee ID, ensure it exists
    if (rental.checkinEmployeeId) {
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
        rental.checkinEmployeeId = newUser.id;
      } else {
        rental.checkinEmployeeId = existingUsers[0].id;
      }
    }
    
    return await supabaseService.update('rentals', id, rental, rentalTransformer);
  },
  
  async deleteRental(id: string): Promise<void> {
    try {
      // First, delete any associated invoices
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('rentalid', id);
      
      if (invoiceError) {
        console.error('Error deleting associated invoices:', invoiceError);
      }
      
      // Then delete the rental
      await supabaseService.delete('rentals', id);
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
