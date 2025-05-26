
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
import { Reservation, Customer, VehicleCategory } from '@/types';
import { reservationService } from '@/services/reservationService';
import { customerService } from '@/services/customerService';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  categoryId: z.string().min(1, 'Vehicle category is required'),
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
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: reservation?.customerId || '',
      categoryId: reservation?.categoryId || '',
      pickupDate: reservation?.pickupDate ? reservation.pickupDate.split('T')[0] : '',
      returnDate: reservation?.returnDate ? reservation.returnDate.split('T')[0] : '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, categoriesData] = await Promise.all([
          customerService.getCustomers(),
          supabase.from('vehicle_categories').select('*'),
        ]);

        setCustomers(customersData);
        if (categoriesData.data) {
          setCategories(categoriesData.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            baseRentalRate: cat.baserentalrate,
            insuranceRate: cat.insurancerate,
          })));
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error loading form data',
          description: 'Could not load customers and categories.',
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
      const reservationData = {
        customerId: values.customerId,
        categoryId: values.categoryId,
        pickupDate: new Date(values.pickupDate).toISOString(),
        returnDate: new Date(values.returnDate).toISOString(),
        reservationDate: new Date().toISOString(),
        status: 'pending' as const,
        employeeId: '550e8400-e29b-41d4-a716-446655440000', // Temporary UUID
        vehicleId: null,
      };

      if (reservation) {
        await reservationService.updateReservation(reservation.id, reservationData);
        toast({
          title: 'Reservation Updated',
          description: 'The reservation has been successfully updated.',
        });
      } else {
        await reservationService.createReservation(reservationData);
        toast({
          title: 'Reservation Created',
          description: 'The reservation has been successfully created.',
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving reservation:', error);
      toast({
        title: 'Error',
        description: 'Could not save the reservation.',
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
              : 'Fill out the form to create a new reservation.'
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : reservation ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm;
