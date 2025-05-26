import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Reservation, Customer, Vehicle, VehicleStatus } from '@/types';
import { reservationService } from '@/services/reservationService';
import { customerService } from '@/services/customerService';
import { rentalService } from '@/services/rentalService';
import { invoiceService } from '@/services/invoiceService';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
});

interface ReservationFormProps {
  reservation?: Reservation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  reservation,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: reservation?.customerId || '',
      vehicleId: reservation?.vehicleId || '',
      pickupDate: reservation?.pickupDate ? reservation.pickupDate.split('T')[0] : '',
      returnDate: reservation?.returnDate ? reservation.returnDate.split('T')[0] : '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, vehiclesData] = await Promise.all([
          customerService.getCustomers(),
          supabase.from('vehicles').select('*').eq('status', 'available'),
        ]);

        setCustomers(customersData);
        if (vehiclesData.data) {
          setAvailableVehicles(vehiclesData.data.map(vehicle => ({
            id: vehicle.id,
            vin: vehicle.vin,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            licensePlate: vehicle.licenseplate,
            mileage: vehicle.mileage,
            status: vehicle.status as VehicleStatus,
            categoryId: vehicle.categoryid,
            imageUrl: vehicle.imageurl,
          })));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error loading form data',
          description: 'Could not load customers and vehicles.',
          variant: 'destructive',
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const selectedVehicle = availableVehicles.find(v => v.id === values.vehicleId);
      if (!selectedVehicle) {
        throw new Error('Selected vehicle not found');
      }

      // Step 1: Create the reservation
      const reservationData = {
        customerId: values.customerId,
        categoryId: selectedVehicle.categoryId,
        vehicleId: values.vehicleId,
        pickupDate: new Date(values.pickupDate).toISOString(),
        returnDate: new Date(values.returnDate).toISOString(),
        reservationDate: new Date().toISOString(),
        status: 'confirmed' as const,
        employeeId: null,
      };

      let createdReservation;
      if (reservation) {
        createdReservation = await reservationService.updateReservation(reservation.id, reservationData);
      } else {
        createdReservation = await reservationService.createReservation(reservationData);
      }

      // Step 2: Update vehicle status to reserved
      await supabase
        .from('vehicles')
        .update({ status: 'reserved' })
        .eq('id', values.vehicleId);

      // Step 3: Create rental automatically
      const rentalData = {
        reservationId: createdReservation.id,
        customerId: values.customerId,
        vehicleId: values.vehicleId,
        checkoutDate: new Date(values.pickupDate).toISOString(),
        expectedReturnDate: new Date(values.returnDate).toISOString(),
        checkoutMileage: selectedVehicle.mileage,
        status: 'active' as const,
        checkoutEmployeeId: null,
      };

      const createdRental = await rentalService.createRental(rentalData);

      // Step 4: Create invoice with fixed pricing
      const pickupDate = new Date(values.pickupDate);
      const returnDate = new Date(values.returnDate);
      const rentalDays = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const baseFee = rentalDays * 50; // $50 per day
      const insuranceFee = rentalDays * 15; // $15 per day
      const taxAmount = (baseFee + insuranceFee) * 0.13; // 13% tax
      const totalAmount = baseFee + insuranceFee + taxAmount;

      const invoiceData = {
        rentalId: createdRental.id,
        customerId: values.customerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        baseFee,
        insuranceFee,
        extraMileageFee: 0,
        fuelFee: 0,
        damageFee: 0,
        lateFee: 0,
        taxAmount,
        totalAmount,
        status: 'issued' as const,
      };

      await invoiceService.createInvoice(invoiceData);

      toast({
        title: reservation ? 'Reservation Updated' : 'Reservation Created',
        description: `The reservation, rental, and invoice have been successfully ${reservation ? 'updated' : 'created'}.`,
      });

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving reservation:', error);
      toast({
        title: 'Error',
        description: 'Could not complete the reservation process.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {reservation ? 'Edit Reservation' : 'Create New Reservation'}
          </DialogTitle>
          <DialogDescription>
            {reservation 
              ? 'Update the reservation details below.'
              : 'Select a customer and available vehicle to create a complete reservation with rental and invoice.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an available vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.color} ({vehicle.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">What happens when you create this reservation:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Vehicle will be marked as reserved</li>
                <li>• Rental record will be automatically created</li>
                <li>• Invoice will be generated with fixed pricing ($50/day + $15/day insurance + 13% tax)</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Processing...' : reservation ? 'Update' : 'Create Reservation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
