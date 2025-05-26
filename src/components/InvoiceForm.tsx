
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
import { Invoice, Customer, Rental } from '@/types';
import { invoiceService } from '@/services/invoiceService';
import { customerService } from '@/services/customerService';
import { rentalService } from '@/services/rentalService';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  rentalId: z.string().min(1, 'Rental is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  baseFee: z.string().min(1, 'Base fee is required'),
  insuranceFee: z.string().min(1, 'Insurance fee is required'),
  extraMileageFee: z.string().min(1, 'Extra mileage fee is required'),
  fuelFee: z.string().min(1, 'Fuel fee is required'),
  damageFee: z.string().min(1, 'Damage fee is required'),
  lateFee: z.string().min(1, 'Late fee is required'),
  taxAmount: z.string().min(1, 'Tax amount is required'),
});

interface InvoiceFormProps {
  invoice?: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: invoice?.customerId || '',
      rentalId: invoice?.rentalId || '',
      dueDate: invoice?.dueDate ? invoice.dueDate.split('T')[0] : '',
      baseFee: invoice?.baseFee?.toString() || '0',
      insuranceFee: invoice?.insuranceFee?.toString() || '0',
      extraMileageFee: invoice?.extraMileageFee?.toString() || '0',
      fuelFee: invoice?.fuelFee?.toString() || '0',
      damageFee: invoice?.damageFee?.toString() || '0',
      lateFee: invoice?.lateFee?.toString() || '0',
      taxAmount: invoice?.taxAmount?.toString() || '0',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, rentalsData] = await Promise.all([
          customerService.getCustomers(),
          rentalService.getRentals(),
        ]);

        setCustomers(customersData);
        setRentals(rentalsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error loading form data',
          description: 'Could not load customers and rentals.',
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
      const baseFee = parseFloat(values.baseFee);
      const insuranceFee = parseFloat(values.insuranceFee);
      const extraMileageFee = parseFloat(values.extraMileageFee);
      const fuelFee = parseFloat(values.fuelFee);
      const damageFee = parseFloat(values.damageFee);
      const lateFee = parseFloat(values.lateFee);
      const taxAmount = parseFloat(values.taxAmount);
      
      const totalAmount = baseFee + insuranceFee + extraMileageFee + fuelFee + damageFee + lateFee + taxAmount;

      const invoiceData = {
        customerId: values.customerId,
        rentalId: values.rentalId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(values.dueDate).toISOString(),
        baseFee,
        insuranceFee,
        extraMileageFee,
        fuelFee,
        damageFee,
        lateFee,
        taxAmount,
        totalAmount,
        status: 'draft' as const,
      };

      if (invoice) {
        await invoiceService.updateInvoice(invoice.id, invoiceData);
        toast({
          title: 'Invoice Updated',
          description: 'The invoice has been successfully updated.',
        });
      } else {
        await invoiceService.createInvoice(invoiceData);
        toast({
          title: 'Invoice Created',
          description: 'The invoice has been successfully created.',
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'Could not save the invoice.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
          <DialogDescription>
            {invoice 
              ? 'Update the invoice details below.'
              : 'Fill out the form to create a new invoice.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                name="rentalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rental</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rental" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rentals.map((rental) => (
                          <SelectItem key={rental.id} value={rental.id}>
                            {rental.customerName} - {rental.vehicleInfo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insuranceFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="extraMileageFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Mileage Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="damageFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lateFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Fee</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {loading ? 'Saving...' : invoice ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
