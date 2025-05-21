
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

export const customerService = {
  // Fetch customers from Supabase
  async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map database fields to our frontend model
        return data.map(customer => ({
          id: customer.id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          dateOfBirth: customer.date_of_birth,
          licenseNumber: customer.license_number,
          licenseExpiry: customer.license_expiry,
          customerType: customer.customer_type,
          createdAt: customer.created_at || new Date().toISOString()
        })) as Customer[];
      }
      
      // If no customers found, return mock data
      return customerService.getCustomerMockData();
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error fetching customers',
        description: 'Could not fetch customer data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return customerService.getCustomerMockData();
    }
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
      
      if (!data) return null;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.date_of_birth,
        licenseNumber: data.license_number,
        licenseExpiry: data.license_expiry,
        customerType: data.customer_type,
        createdAt: data.created_at || new Date().toISOString()
      } as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  },
  
  // Create a new customer
  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    try {
      const dbCustomer = {
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        date_of_birth: customer.dateOfBirth,
        license_number: customer.licenseNumber,
        license_expiry: customer.licenseExpiry,
        customer_type: customer.customerType,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert([dbCustomer])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.date_of_birth,
        licenseNumber: data.license_number,
        licenseExpiry: data.license_expiry,
        customerType: data.customer_type,
        createdAt: data.created_at
      } as Customer;
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
  
  // Update an existing customer
  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      const dbCustomer: Record<string, any> = {};
      
      if (customer.firstName) dbCustomer.first_name = customer.firstName;
      if (customer.lastName) dbCustomer.last_name = customer.lastName;
      if (customer.email) dbCustomer.email = customer.email;
      if (customer.phone) dbCustomer.phone = customer.phone;
      if (customer.address) dbCustomer.address = customer.address;
      if (customer.dateOfBirth) dbCustomer.date_of_birth = customer.dateOfBirth;
      if (customer.licenseNumber) dbCustomer.license_number = customer.licenseNumber;
      if (customer.licenseExpiry) dbCustomer.license_expiry = customer.licenseExpiry;
      if (customer.customerType) dbCustomer.customer_type = customer.customerType;
      
      const { data, error } = await supabase
        .from('customers')
        .update(dbCustomer)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.date_of_birth,
        licenseNumber: data.license_number,
        licenseExpiry: data.license_expiry,
        customerType: data.customer_type,
        createdAt: data.created_at
      } as Customer;
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
  
  // Delete a customer
  async deleteCustomer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Customer deleted',
        description: 'Customer has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error deleting customer',
        description: 'Could not delete the customer.',
        variant: 'destructive'
      });
      throw error;
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
  }
};
