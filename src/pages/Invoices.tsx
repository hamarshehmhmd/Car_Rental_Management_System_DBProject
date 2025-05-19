
import React, { useEffect, useState } from 'react';
import { PlusCircle, FileText, Car, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Invoice } from '@/types';
import supabase from '@/lib/supabase';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('invoices')
        //   .select(`
        //     *,
        //     customers (firstName, lastName),
        //     rentals (id, vehicleId)
        //   `);
        
        // if (error) throw error;
        
        // Use mock data for now
        setTimeout(() => {
          setInvoices(getInvoiceMockData());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Failed to load invoices',
          description: 'There was an error loading the invoice data.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleAddInvoice = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Add invoice functionality will be available soon.',
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast({
      title: 'Invoice Selected',
      description: `Viewing invoice #${invoice.id} for ${invoice.customerName}`,
    });
  };

  const invoiceColumns = [
    {
      key: 'id',
      header: 'Invoice #',
      cell: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">INV-{invoice.id}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (invoice: Invoice) => (
        <span className="font-medium">{invoice.customerName}</span>
      ),
    },
    {
      key: 'rental',
      header: 'Rental',
      cell: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span>{invoice.rentalInfo}</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      cell: (invoice: Invoice) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Invoice: {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Due: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Total Amount',
      cell: (invoice: Invoice) => (
        <span className="font-medium">${invoice.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (invoice: Invoice) => (
        <StatusBadge status={invoice.status} type="invoice" />
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Invoices" 
        description="Manage customer invoices and payment status."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                View and manage billing for completed rentals.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddInvoice}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={invoices}
              columns={invoiceColumns}
              searchable={true}
              onRowClick={handleViewInvoice}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
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

export default Invoices;
