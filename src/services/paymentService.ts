
import { Payment, PaymentStatus } from '@/types';
import { supabaseService } from './supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Transformer for Payment data
const paymentTransformer = {
  toFrontend: (dbPayment: any): Payment => {
    return {
      id: dbPayment.id,
      invoiceId: dbPayment.invoiceid,
      customerId: dbPayment.customerid,
      paymentDate: dbPayment.paymentdate,
      amount: dbPayment.amount,
      paymentMethod: dbPayment.paymentmethod,
      transactionReference: dbPayment.transactionreference,
      status: dbPayment.status as PaymentStatus,
      processedBy: dbPayment.processedby,
      customerName: dbPayment.customerName || 'Unknown Customer',
      invoiceInfo: dbPayment.invoiceInfo || 'Unknown Invoice'
    };
  },
  toDatabase: (payment: Partial<Payment>): Record<string, any> => {
    const dbPayment: Record<string, any> = {};
    
    if (payment.invoiceId) dbPayment.invoiceid = payment.invoiceId;
    if (payment.customerId) dbPayment.customerid = payment.customerId;
    if (payment.paymentDate) dbPayment.paymentdate = payment.paymentDate;
    if (payment.amount !== undefined) dbPayment.amount = payment.amount;
    if (payment.paymentMethod) dbPayment.paymentmethod = payment.paymentMethod;
    if (payment.transactionReference) dbPayment.transactionreference = payment.transactionReference;
    if (payment.status) dbPayment.status = payment.status;
    if (payment.processedBy) dbPayment.processedby = payment.processedBy;
    
    return dbPayment;
  }
};

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    try {
      // Get base payment records
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*');
        
      if (error) throw error;
      
      // Enhance with customer and invoice info
      const enhancedPayments = await Promise.all((payments || []).map(async (payment) => {
        const paymentRecord = paymentTransformer.toFrontend(payment);
        
        // Get customer info
        if (payment.customerid) {
          try {
            const { data: customer } = await supabase
              .from('customers')
              .select('firstname, lastname')
              .eq('id', payment.customerid)
              .maybeSingle();
              
            if (customer) {
              paymentRecord.customerName = `${customer.firstname} ${customer.lastname}`;
            }
          } catch (e) {
            console.error('Error fetching customer for payment:', e);
          }
        }
        
        // Get invoice info
        if (payment.invoiceid) {
          try {
            paymentRecord.invoiceInfo = `INV-${payment.invoiceid.substring(0, 8)}`;
          } catch (e) {
            console.error('Error processing invoice ID for payment:', e);
          }
        }
        
        return paymentRecord;
      }));
      
      return enhancedPayments;
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error fetching payments',
        description: 'Could not fetch payment data.',
        variant: 'destructive'
      });
      return [];
    }
  },
  
  async createPayment(payment: Partial<Payment>): Promise<Payment> {
    return await supabaseService.create('payments', payment, paymentTransformer);
  },
  
  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    return await supabaseService.update('payments', id, payment, paymentTransformer);
  },
  
  async deletePayment(id: string): Promise<void> {
    return await supabaseService.delete('payments', id);
  }
};
