
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
import { invoiceService } from '@/services/invoiceService';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Failed to load invoices',
          description: 'There was an error loading the invoice data.',
          variant: 'destructive',
        });
      } finally {
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

export default Invoices;
