
import supabase from '@/lib/supabase';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

export const customerService = {
  // Fetch customers from Supabase
  async getCustomers(): Promise<Customer[]> {
    try {
      const { data: existingCustomers, error: fetchError } = await supabase
        .from('customers')
        .select('*');
      
      // If we have customers, return them
      if (existingCustomers && existingCustomers.length > 0) {
        return existingCustomers as Customer[];
      }
      
      // If no customers exist, populate with dummy data
      const dummyCustomers = customerService.getCustomerMockData();
      
      // Insert the dummy customers into Supabase
      const { error: insertError } = await supabase
        .from('customers')
        .insert(dummyCustomers);
      
      if (insertError) {
        console.error('Error inserting customers:', insertError);
        throw insertError;
      }
      
      // Fetch the newly inserted customers
      const { data: newCustomers, error: newFetchError } = await supabase
        .from('customers')
        .select('*');
      
      if (newFetchError) {
        console.error('Error fetching new customers:', newFetchError);
        throw newFetchError;
      }
      
      return (newCustomers || []) as Customer[];
    } catch (error) {
      console.error('Error in getCustomers:', error);
      toast({
        title: 'Error fetching customers',
        description: 'Could not fetch customer data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return customerService.getCustomerMockData();
    }
  },
  
  // Mock data as fallback
  getCustomerMockData(): Customer[] {
    return [
      {
        id: 'c-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, CA 90210',
        dateOfBirth: '1985-06-15',
        licenseNumber: 'DL12345678',
        licenseExpiry: '2026-06-14',
        customerType: 'Individual',
        createdAt: '2023-01-15T10:30:00Z'
      },
      {
        id: 'c-2',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@example.com',
        phone: '(555) 234-5678',
        address: '456 Oak Ave, Somewhere, NY 10001',
        dateOfBirth: '1990-03-22',
        licenseNumber: 'DL87654321',
        licenseExpiry: '2025-03-21',
        customerType: 'Individual',
        createdAt: '2023-02-10T14:45:00Z'
      },
      {
        id: 'c-3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        phone: '(555) 345-6789',
        address: '789 Pine Rd, Nowhere, TX 75001',
        dateOfBirth: '1982-11-08',
        licenseNumber: 'DL24681012',
        licenseExpiry: '2024-11-07',
        customerType: 'Individual',
        createdAt: '2023-03-05T09:15:00Z'
      },
      {
        id: 'c-4',
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@example.com',
        phone: '(555) 456-7890',
        address: '321 Maple Dr, Elsewhere, FL 33101',
        dateOfBirth: '1988-09-17',
        licenseNumber: 'DL13579246',
        licenseExpiry: '2027-09-16',
        customerType: 'Individual',
        createdAt: '2023-04-20T16:30:00Z'
      },
      {
        id: 'c-5',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@example.com',
        phone: '(555) 567-8901',
        address: '654 Birch Ln, Anywhere, WA 98101',
        dateOfBirth: '1975-07-30',
        licenseNumber: 'DL97531086',
        licenseExpiry: '2025-07-29',
        customerType: 'Corporate',
        createdAt: '2023-05-12T11:00:00Z'
      }
    ];
  },
  
  // Get a single customer by ID
  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  },
  
  // Create a new customer
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    try {
      const newCustomer = {
        ...customer,
        createdAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },
  
  // Update an existing customer
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
  
  // Delete a customer
  async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
};
