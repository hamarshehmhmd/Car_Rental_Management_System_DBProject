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
import { Payment, Invoice, Customer } from '@/types';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';
import { customerService } from '@/services/customerService';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.string().min(1, 'Amount is required'),
  paymentMethod: z.enum(['credit', 'debit', 'cash', 'bank_transfer']),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
});

interface PaymentFormProps {
  payment?: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [validUserId, setValidUserId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceId: payment?.invoiceId || '',
      customerId: payment?.customerId || '',
      amount: payment?.amount?.toString() || '',
      paymentMethod: payment?.paymentMethod || 'credit',
      transactionReference: payment?.transactionReference || '',
    },
  });

  useEffect(() => {
    if (payment) {
      form.reset({
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        transactionReference: payment.transactionReference,
      });
    }
  }, [payment, form]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      try {
        const [invoicesData, customersData] = await Promise.all([
          invoiceService.getInvoices(),
          customerService.getCustomers(),
        ]);

        setInvoices(invoicesData);
        setCustomers(customersData);
        
        // Get a valid user ID from the users table
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id')
          .limit(1);
          
        if (!usersError && users && users.length > 0) {
          setValidUserId(users[0].id);
          console.log('Found valid user ID:', users[0].id);
        } else {
          console.log('No users found in the database');
        }
        
        console.log('Loaded invoices:', invoicesData.length);
        console.log('Loaded customers:', customersData.length);
      } catch (error) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error loading form data',
          description: 'Could not load invoices and customers.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    console.log('Submitting payment with values:', values);
    
    try {
      if (!validUserId) {
        throw new Error('No valid user found. Please ensure there are users in the system.');
      }

      const paymentData = {
        invoiceId: values.invoiceId,
        customerId: values.customerId,
        paymentDate: new Date().toISOString(),
        amount: parseFloat(values.amount),
        paymentMethod: values.paymentMethod,
        transactionReference: values.transactionReference,
        status: 'completed' as const,
        processedBy: validUserId, // Use the valid user ID from the database
      };

      console.log('Payment data to submit:', paymentData);

      if (payment) {
        await paymentService.updatePayment(payment.id, paymentData);
        toast({
          title: 'Payment Updated',
          description: 'The payment has been successfully updated.',
        });
      } else {
        await paymentService.createPayment(paymentData);
        toast({
          title: 'Payment Created',
          description: 'The payment has been successfully created.',
        });
      }

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Error',
        description: `Could not save the payment: ${error.message || 'Unknown error'}`,
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
            {payment ? 'Edit Payment' : 'Create New Payment'}
          </DialogTitle>
          <DialogDescription>
            {payment 
              ? 'Update the payment details below.'
              : 'Fill out the form to create a new payment.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an invoice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {invoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          INV-{invoice.id.substring(0, 8)} - ${invoice.totalAmount}
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
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="debit">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transaction reference" {...field} />
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
              <Button type="submit" disabled={loading || !validUserId}>
                {loading ? 'Saving...' : payment ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
