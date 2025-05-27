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

// Helper function to check if invoice is fully paid and update status
const checkAndUpdateInvoiceStatus = async (invoiceId: string): Promise<void> => {
  try {
    // Get the invoice total amount
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('totalamount, status')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return;
    }

    // Get all payments for this invoice
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoiceid', invoiceId)
      .eq('status', 'completed');

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return;
    }

    // Calculate total paid amount
    const totalPaid = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
    const invoiceTotal = Number(invoice.totalamount);

    console.log(`Invoice ${invoiceId}: Total amount: ${invoiceTotal}, Total paid: ${totalPaid}`);

    // If invoice is fully paid, update status to 'paid'
    if (totalPaid >= invoiceTotal && invoice.status !== 'paid') {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Error updating invoice status:', updateError);
      } else {
        console.log(`Invoice ${invoiceId} marked as paid`);
        toast({
          title: 'Invoice Updated',
          description: 'Invoice has been marked as paid in full.',
        });
      }
    }
  } catch (error) {
    console.error('Error checking invoice payment status:', error);
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
    const createdPayment = await supabaseService.create('payments', payment, paymentTransformer);
    
    // If payment is completed and has an invoice, check if invoice should be marked as paid
    if (payment.status === 'completed' && payment.invoiceId) {
      await checkAndUpdateInvoiceStatus(payment.invoiceId);
    }
    
    return createdPayment;
  },
  
  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    const updatedPayment = await supabaseService.update('payments', id, payment, paymentTransformer);
    
    // If payment is completed and has an invoice, check if invoice should be marked as paid
    if (payment.status === 'completed' && payment.invoiceId) {
      await checkAndUpdateInvoiceStatus(payment.invoiceId);
    }
    
    return updatedPayment;
  },
  
  async deletePayment(id: string): Promise<void> {
    return await supabaseService.delete('payments', id);
  }
};
