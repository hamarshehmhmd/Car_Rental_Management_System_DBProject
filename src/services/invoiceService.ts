
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Invoice data between database and frontend
const invoiceTransformer = {
  toFrontend: (dbInvoice: any): Invoice => {
    return {
      id: dbInvoice.id,
      rentalId: dbInvoice.rentalid,
      customerId: dbInvoice.customerid,
      invoiceDate: dbInvoice.invoicedate,
      dueDate: dbInvoice.duedate,
      baseFee: dbInvoice.basefee,
      insuranceFee: dbInvoice.insurancefee,
      extraMileageFee: dbInvoice.extramileagefee,
      fuelFee: dbInvoice.fuelfee,
      damageFee: dbInvoice.damagefee,
      lateFee: dbInvoice.latefee,
      taxAmount: dbInvoice.taxamount,
      totalAmount: dbInvoice.totalamount,
      status: dbInvoice.status as InvoiceStatus,
      customerName: dbInvoice.customerName || 'Unknown Customer',
      rentalInfo: dbInvoice.rentalInfo || 'Unknown Rental'
    };
  },
  toDatabase: (invoice: Partial<Invoice>): Record<string, any> => {
    const dbInvoice: Record<string, any> = {};
    
    if (invoice.rentalId) dbInvoice.rentalid = invoice.rentalId;
    if (invoice.customerId) dbInvoice.customerid = invoice.customerId;
    if (invoice.invoiceDate) dbInvoice.invoicedate = invoice.invoiceDate;
    if (invoice.dueDate) dbInvoice.duedate = invoice.dueDate;
    if (invoice.baseFee !== undefined) dbInvoice.basefee = invoice.baseFee;
    if (invoice.insuranceFee !== undefined) dbInvoice.insurancefee = invoice.insuranceFee;
    if (invoice.extraMileageFee !== undefined) dbInvoice.extramileagefee = invoice.extraMileageFee;
    if (invoice.fuelFee !== undefined) dbInvoice.fuelfee = invoice.fuelFee;
    if (invoice.damageFee !== undefined) dbInvoice.damagefee = invoice.damageFee;
    if (invoice.lateFee !== undefined) dbInvoice.latefee = invoice.lateFee;
    if (invoice.taxAmount !== undefined) dbInvoice.taxamount = invoice.taxAmount;
    if (invoice.totalAmount !== undefined) dbInvoice.totalamount = invoice.totalAmount;
    if (invoice.status) dbInvoice.status = invoice.status;
    
    return dbInvoice;
  }
};

export const invoiceService = {
  // Fetch invoices from Supabase with related data
  async getInvoices(): Promise<Invoice[]> {
    try {
      // First, get all invoices
      const invoices = await supabaseService.getAll('invoices', invoiceTransformer);
      
      // Enhance with customer and rental information
      const enhancedInvoices = await Promise.all(
        invoices.map(async (invoice) => {
          let customerName = 'Unknown Customer';
          let rentalInfo = 'Unknown Rental';
          
          // Get customer name
          if (invoice.customerId) {
            try {
              const { data: customer } = await supabase
                .from('customers')
                .select('firstname, lastname')
                .eq('id', invoice.customerId)
                .maybeSingle();
                
              if (customer) {
                customerName = `${customer.firstname} ${customer.lastname}`;
              }
            } catch (e) {
              console.error('Error fetching customer for invoice:', e);
            }
          }
          
          // Get rental & vehicle info
          if (invoice.rentalId) {
            try {
              const { data: rental } = await supabase
                .from('rentals')
                .select(`
                  vehicleid,
                  vehicles:vehicles (make, model, year)
                `)
                .eq('id', invoice.rentalId)
                .maybeSingle();
                
              if (rental && rental.vehicles) {
                const vehicle = rental.vehicles;
                rentalInfo = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
              }
            } catch (e) {
              console.error('Error fetching rental for invoice:', e);
            }
          }
          
          return {
            ...invoice,
            customerName,
            rentalInfo
          };
        })
      );
      
      return enhancedInvoices;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error fetching invoices',
        description: 'Could not fetch invoice data.',
        variant: 'destructive'
      });
      
      return [];
    }
  },
  
  // Create a new invoice
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    return await supabaseService.create('invoices', invoice, invoiceTransformer);
  },
  
  // Update an existing invoice
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    return await supabaseService.update('invoices', id, invoice, invoiceTransformer);
  },
  
  // Delete an invoice
  async deleteInvoice(id: string): Promise<void> {
    return await supabaseService.delete('invoices', id);
  }
};
