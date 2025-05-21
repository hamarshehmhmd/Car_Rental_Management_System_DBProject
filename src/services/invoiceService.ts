
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export const invoiceService = {
  // Fetch invoices from Supabase with related data
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (id, first_name, last_name),
          rentals (id, vehicle_id, 
            vehicles (id, make, model, year))
        `);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map(invoice => {
          const customer = invoice.customers;
          const rental = invoice.rentals;
          const vehicle = rental?.vehicles;
          
          return {
            id: invoice.id,
            rentalId: invoice.rental_id,
            customerId: invoice.customer_id,
            invoiceDate: invoice.invoice_date,
            dueDate: invoice.due_date,
            baseFee: invoice.base_fee,
            insuranceFee: invoice.insurance_fee,
            extraMileageFee: invoice.extra_mileage_fee,
            fuelFee: invoice.fuel_fee,
            damageFee: invoice.damage_fee,
            lateFee: invoice.late_fee,
            taxAmount: invoice.tax_amount,
            totalAmount: invoice.total_amount,
            status: invoice.status as InvoiceStatus,
            customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
            rentalInfo: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : 'Unknown'
          };
        }) as Invoice[];
      }
      
      // If no invoices found, return mock data
      return getInvoiceMockData();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error fetching invoices',
        description: 'Could not fetch invoice data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return getInvoiceMockData();
    }
  },
  
  // Create a new invoice
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const dbInvoice = {
        rental_id: invoice.rentalId,
        customer_id: invoice.customerId,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        base_fee: invoice.baseFee,
        insurance_fee: invoice.insuranceFee,
        extra_mileage_fee: invoice.extraMileageFee,
        fuel_fee: invoice.fuelFee,
        damage_fee: invoice.damageFee,
        late_fee: invoice.lateFee,
        tax_amount: invoice.taxAmount,
        total_amount: invoice.totalAmount,
        status: invoice.status
      };
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([dbInvoice])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Invoice created',
        description: 'Invoice has been successfully created.',
      });
      
      return {
        id: data.id,
        rentalId: data.rental_id,
        customerId: data.customer_id,
        invoiceDate: data.invoice_date,
        dueDate: data.due_date,
        baseFee: data.base_fee,
        insuranceFee: data.insurance_fee,
        extraMileageFee: data.extra_mileage_fee,
        fuelFee: data.fuel_fee,
        damageFee: data.damage_fee,
        lateFee: data.late_fee,
        taxAmount: data.tax_amount,
        totalAmount: data.total_amount,
        status: data.status as InvoiceStatus
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error creating invoice',
        description: 'Could not create the invoice.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update an existing invoice
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const dbInvoice: Record<string, any> = {};
      
      if (invoice.rentalId) dbInvoice.rental_id = invoice.rentalId;
      if (invoice.customerId) dbInvoice.customer_id = invoice.customerId;
      if (invoice.invoiceDate) dbInvoice.invoice_date = invoice.invoiceDate;
      if (invoice.dueDate) dbInvoice.due_date = invoice.dueDate;
      if (invoice.baseFee !== undefined) dbInvoice.base_fee = invoice.baseFee;
      if (invoice.insuranceFee !== undefined) dbInvoice.insurance_fee = invoice.insuranceFee;
      if (invoice.extraMileageFee !== undefined) dbInvoice.extra_mileage_fee = invoice.extraMileageFee;
      if (invoice.fuelFee !== undefined) dbInvoice.fuel_fee = invoice.fuelFee;
      if (invoice.damageFee !== undefined) dbInvoice.damage_fee = invoice.damageFee;
      if (invoice.lateFee !== undefined) dbInvoice.late_fee = invoice.lateFee;
      if (invoice.taxAmount !== undefined) dbInvoice.tax_amount = invoice.taxAmount;
      if (invoice.totalAmount !== undefined) dbInvoice.total_amount = invoice.totalAmount;
      if (invoice.status) dbInvoice.status = invoice.status;
      
      const { data, error } = await supabase
        .from('invoices')
        .update(dbInvoice)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Invoice updated',
        description: 'Invoice has been successfully updated.',
      });
      
      return {
        id: data.id,
        rentalId: data.rental_id,
        customerId: data.customer_id,
        invoiceDate: data.invoice_date,
        dueDate: data.due_date,
        baseFee: data.base_fee,
        insuranceFee: data.insurance_fee,
        extraMileageFee: data.extra_mileage_fee,
        fuelFee: data.fuel_fee,
        damageFee: data.damage_fee,
        lateFee: data.late_fee,
        taxAmount: data.tax_amount,
        totalAmount: data.total_amount,
        status: data.status as InvoiceStatus
      };
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: 'Error updating invoice',
        description: 'Could not update the invoice.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Delete an invoice
  async deleteInvoice(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Invoice deleted',
        description: 'Invoice has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error deleting invoice',
        description: 'Could not delete the invoice.',
        variant: 'destructive'
      });
      throw error;
    }
  }
};

// Mock data for invoices
function getInvoiceMockData(): Invoice[] {
  return [
    {
      id: 'i1',
      rentalId: '1',
      customerId: 'c1',
      invoiceDate: '2025-04-15',
      dueDate: '2025-04-29',
      baseFee: 350,
      insuranceFee: 50,
      extraMileageFee: 0,
      fuelFee: 25,
      damageFee: 0,
      lateFee: 0,
      taxAmount: 42.5,
      totalAmount: 467.5,
      status: 'issued',
      customerName: 'John Smith',
      rentalInfo: 'Toyota Camry (2023)'
    },
    {
      id: 'i2',
      rentalId: '2',
      customerId: 'c2',
      invoiceDate: '2025-04-05',
      dueDate: '2025-04-19',
      baseFee: 225,
      insuranceFee: 35,
      extraMileageFee: 75,
      fuelFee: 30,
      damageFee: 150,
      lateFee: 25,
      taxAmount: 54,
      totalAmount: 594,
      status: 'overdue',
      customerName: 'Alice Johnson',
      rentalInfo: 'Honda Civic (2024)'
    },
    {
      id: 'i3',
      rentalId: '3',
      customerId: 'c3',
      invoiceDate: '2025-04-10',
      dueDate: '2025-04-24',
      baseFee: 400,
      insuranceFee: 60,
      extraMileageFee: 0,
      fuelFee: 0,
      damageFee: 0,
      lateFee: 0,
      taxAmount: 46,
      totalAmount: 506,
      status: 'paid',
      customerName: 'Robert Davis',
      rentalInfo: 'Ford Explorer (2022)'
    },
    {
      id: 'i4',
      rentalId: '4',
      customerId: 'c4',
      invoiceDate: '2025-03-25',
      dueDate: '2025-04-08',
      baseFee: 275,
      insuranceFee: 40,
      extraMileageFee: 50,
      fuelFee: 45,
      damageFee: 0,
      lateFee: 0,
      taxAmount: 41,
      totalAmount: 451,
      status: 'paid',
      customerName: 'Emma Wilson',
      rentalInfo: 'Nissan Rogue (2023)'
    },
    {
      id: 'i5',
      rentalId: '5',
      customerId: 'c5',
      invoiceDate: '2025-05-02',
      dueDate: '2025-05-16',
      baseFee: 500,
      insuranceFee: 75,
      extraMileageFee: 0,
      fuelFee: 0,
      damageFee: 0,
      lateFee: 0,
      taxAmount: 57.5,
      totalAmount: 632.5,
      status: 'draft',
      customerName: 'Michael Brown',
      rentalInfo: 'Jeep Cherokee (2022)'
    }
  ];
}
