
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Customer data
const customerTransformer = {
  toFrontend: (dbCustomer: any): Customer => {
    return {
      id: dbCustomer.id,
      firstName: dbCustomer.firstname,
      lastName: dbCustomer.lastname,
      email: dbCustomer.email,
      phone: dbCustomer.phone,
      address: dbCustomer.address,
      dateOfBirth: dbCustomer.dateofbirth,
      licenseNumber: dbCustomer.licensenumber,
      licenseExpiry: dbCustomer.licenseexpiry,
      customerType: dbCustomer.customertype,
      createdAt: dbCustomer.createdat
    };
  },
  toDatabase: (customer: Partial<Customer>): Record<string, any> => {
    const dbCustomer: Record<string, any> = {};
    
    if (customer.firstName !== undefined) dbCustomer.firstname = customer.firstName;
    if (customer.lastName !== undefined) dbCustomer.lastname = customer.lastName;
    if (customer.email !== undefined) dbCustomer.email = customer.email;
    if (customer.phone !== undefined) dbCustomer.phone = customer.phone;
    if (customer.address !== undefined) dbCustomer.address = customer.address;
    if (customer.dateOfBirth !== undefined) dbCustomer.dateofbirth = customer.dateOfBirth;
    if (customer.licenseNumber !== undefined) dbCustomer.licensenumber = customer.licenseNumber;
    if (customer.licenseExpiry !== undefined) dbCustomer.licenseexpiry = customer.licenseExpiry;
    if (customer.customerType !== undefined) dbCustomer.customertype = customer.customerType;
    
    return dbCustomer;
  }
};

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    try {
      return await supabaseService.getAll<any, Customer>('customers', customerTransformer);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error fetching customers',
        description: 'Could not fetch customer data.',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    try {
      return await supabaseService.create<any, Customer>('customers', customer, customerTransformer);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Error creating customer',
        description: 'Could not create the customer.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      return await supabaseService.update<any, Customer>('customers', id, customer, customerTransformer);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Error updating customer',
        description: 'Could not update the customer.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  async deleteCustomer(id: string): Promise<void> {
    try {
      // First, delete associated data in the correct order
      
      // Get all reservations for this customer
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id')
        .eq('customerid', id);
      
      if (reservations && reservations.length > 0) {
        for (const reservation of reservations) {
          // Delete rentals and their invoices for each reservation
          const { data: rentals } = await supabase
            .from('rentals')
            .select('id')
            .eq('reservationid', reservation.id);
          
          if (rentals && rentals.length > 0) {
            for (const rental of rentals) {
              // Delete payments for invoices
              await supabase
                .from('payments')
                .delete()
                .eq('customerid', id);
              
              // Delete invoices
              await supabase
                .from('invoices')
                .delete()
                .eq('rentalid', rental.id);
            }
            
            // Delete rentals
            await supabase
              .from('rentals')
              .delete()
              .eq('reservationid', reservation.id);
          }
        }
        
        // Delete reservations
        await supabase
          .from('reservations')
          .delete()
          .eq('customerid', id);
      }
      
      // Finally delete the customer
      await supabaseService.delete('customers', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error deleting customer',
        description: 'Could not delete the customer.',
        variant: 'destructive'
      });
      throw error;
    }
  }
};
