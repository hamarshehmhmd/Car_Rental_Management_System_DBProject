
import { supabase } from '@/integrations/supabase/client';
import { Rental, RentalStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export const rentalService = {
  // Fetch rentals from Supabase with related data
  async getRentals(): Promise<Rental[]> {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers (id, first_name, last_name, email),
          vehicles (id, make, model, year, license_plate)
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(rental => {
          const customer = rental.customers;
          const vehicle = rental.vehicles;
          
          return {
            id: rental.id,
            reservationId: rental.reservation_id,
            customerId: rental.customer_id,
            vehicleId: rental.vehicle_id,
            checkoutEmployeeId: rental.checkout_employee_id,
            checkinEmployeeId: rental.checkin_employee_id,
            checkoutDate: rental.checkout_date,
            expectedReturnDate: rental.expected_return_date,
            actualReturnDate: rental.actual_return_date,
            checkoutMileage: rental.checkout_mileage,
            returnMileage: rental.return_mileage,
            status: rental.status as RentalStatus,
            customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
            vehicleInfo: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Unknown'
          };
        }) as Rental[];
      }
      
      // If no rentals found, return mock data
      return rentalService.getRentalMockData();
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: 'Error fetching rentals',
        description: 'Could not fetch rental data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return rentalService.getRentalMockData();
    }
  },
  
  // Get a single rental by ID
  async getRentalById(id: string): Promise<Rental | null> {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers (id, first_name, last_name, email),
          vehicles (id, make, model, year, license_plate)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      const customer = data.customers;
      const vehicle = data.vehicles;
      
      return {
        id: data.id,
        reservationId: data.reservation_id,
        customerId: data.customer_id,
        vehicleId: data.vehicle_id,
        checkoutEmployeeId: data.checkout_employee_id,
        checkinEmployeeId: data.checkin_employee_id,
        checkoutDate: data.checkout_date,
        expectedReturnDate: data.expected_return_date,
        actualReturnDate: data.actual_return_date,
        checkoutMileage: data.checkout_mileage,
        returnMileage: data.return_mileage,
        status: data.status as RentalStatus,
        customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
        vehicleInfo: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching rental by ID:', error);
      return null;
    }
  },
  
  // Create a new rental
  async createRental(rental: Partial<Rental>): Promise<Rental> {
    try {
      const dbRental = {
        reservation_id: rental.reservationId,
        customer_id: rental.customerId,
        vehicle_id: rental.vehicleId,
        checkout_employee_id: rental.checkoutEmployeeId,
        checkin_employee_id: rental.checkinEmployeeId,
        checkout_date: rental.checkoutDate,
        expected_return_date: rental.expectedReturnDate,
        actual_return_date: rental.actualReturnDate,
        checkout_mileage: rental.checkoutMileage,
        return_mileage: rental.returnMileage,
        status: rental.status
      };
      
      const { data, error } = await supabase
        .from('rentals')
        .insert([dbRental])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Rental created',
        description: 'Rental has been successfully created.',
      });
      
      return {
        id: data.id,
        reservationId: data.reservation_id,
        customerId: data.customer_id,
        vehicleId: data.vehicle_id,
        checkoutEmployeeId: data.checkout_employee_id,
        checkinEmployeeId: data.checkin_employee_id,
        checkoutDate: data.checkout_date,
        expectedReturnDate: data.expected_return_date,
        actualReturnDate: data.actual_return_date,
        checkoutMileage: data.checkout_mileage,
        returnMileage: data.return_mileage,
        status: data.status as RentalStatus
      };
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
      const dbRental: Record<string, any> = {};
      
      if (rental.reservationId) dbRental.reservation_id = rental.reservationId;
      if (rental.customerId) dbRental.customer_id = rental.customerId;
      if (rental.vehicleId) dbRental.vehicle_id = rental.vehicleId;
      if (rental.checkoutEmployeeId) dbRental.checkout_employee_id = rental.checkoutEmployeeId;
      if (rental.checkinEmployeeId) dbRental.checkin_employee_id = rental.checkinEmployeeId;
      if (rental.checkoutDate) dbRental.checkout_date = rental.checkoutDate;
      if (rental.expectedReturnDate) dbRental.expected_return_date = rental.expectedReturnDate;
      if (rental.actualReturnDate) dbRental.actual_return_date = rental.actualReturnDate;
      if (rental.checkoutMileage) dbRental.checkout_mileage = rental.checkoutMileage;
      if (rental.returnMileage) dbRental.return_mileage = rental.returnMileage;
      if (rental.status) dbRental.status = rental.status;
      
      const { data, error } = await supabase
        .from('rentals')
        .update(dbRental)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Rental updated',
        description: 'Rental has been successfully updated.',
      });
      
      return {
        id: data.id,
        reservationId: data.reservation_id,
        customerId: data.customer_id,
        vehicleId: data.vehicle_id,
        checkoutEmployeeId: data.checkout_employee_id,
        checkinEmployeeId: data.checkin_employee_id,
        checkoutDate: data.checkout_date,
        expectedReturnDate: data.expected_return_date,
        actualReturnDate: data.actual_return_date,
        checkoutMileage: data.checkout_mileage,
        returnMileage: data.return_mileage,
        status: data.status as RentalStatus
      };
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
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
  },
  
  // Mock data as fallback
  getRentalMockData(): Rental[] {
    return [
      {
        id: 'r-1',
        reservationId: 'res-1',
        customerId: 'c-1',
        vehicleId: 'v-1',
        checkoutEmployeeId: 'e-1',
        checkinEmployeeId: null,
        checkoutDate: '2023-04-01T10:30:00Z',
        expectedReturnDate: '2023-04-05T10:30:00Z',
        actualReturnDate: null,
        checkoutMileage: 15600,
        returnMileage: null,
        status: 'active',
        customerName: 'John Smith',
        vehicleInfo: 'Toyota Camry (2022)'
      },
      {
        id: 'r-2',
        reservationId: 'res-2',
        customerId: 'c-2',
        vehicleId: 'v-2',
        checkoutEmployeeId: 'e-2',
        checkinEmployeeId: 'e-1',
        checkoutDate: '2023-03-28T14:15:00Z',
        expectedReturnDate: '2023-03-31T14:15:00Z',
        actualReturnDate: '2023-03-31T16:30:00Z',
        checkoutMileage: 8200,
        returnMileage: 8750,
        status: 'completed',
        customerName: 'Emily Johnson',
        vehicleInfo: 'Honda CR-V (2023)'
      },
      {
        id: 'r-3',
        reservationId: 'res-3',
        customerId: 'c-3',
        vehicleId: 'v-3',
        checkoutEmployeeId: 'e-1',
        checkinEmployeeId: null,
        checkoutDate: '2023-04-02T09:45:00Z',
        expectedReturnDate: '2023-04-04T09:45:00Z',
        actualReturnDate: null,
        checkoutMileage: 20300,
        returnMileage: null,
        status: 'active',
        customerName: 'Michael Brown',
        vehicleInfo: 'Ford Mustang (2021)'
      },
      {
        id: 'r-4',
        reservationId: 'res-4',
        customerId: 'c-4',
        vehicleId: 'v-4',
        checkoutEmployeeId: 'e-2',
        checkinEmployeeId: null,
        checkoutDate: '2023-03-30T11:20:00Z',
        expectedReturnDate: '2023-04-02T11:20:00Z',
        actualReturnDate: null,
        checkoutMileage: 12400,
        returnMileage: null,
        status: 'overdue',
        customerName: 'Sarah Davis',
        vehicleInfo: 'Chevrolet Equinox (2022)'
      },
      {
        id: 'r-5',
        reservationId: 'res-5',
        customerId: 'c-5',
        vehicleId: 'v-5',
        checkoutEmployeeId: 'e-1',
        checkinEmployeeId: 'e-2',
        checkoutDate: '2023-03-25T13:00:00Z',
        expectedReturnDate: '2023-03-29T13:00:00Z',
        actualReturnDate: '2023-03-29T15:45:00Z',
        checkoutMileage: 5600,
        returnMileage: 6200,
        status: 'completed',
        customerName: 'Robert Wilson',
        vehicleInfo: 'BMW 3 Series (2023)'
      }
    ];
  }
};
