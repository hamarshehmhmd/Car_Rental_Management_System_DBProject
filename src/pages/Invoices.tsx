
import React, { useEffect, useState } from 'react';
import { PlusCircle, FileText, Car, Calendar } from 'lucide-react';
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
import { safeFormatDate } from '@/utils/dateUtils';
import InvoiceForm from '@/components/InvoiceForm';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();

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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddInvoice = () => {
    setSelectedInvoice(undefined);
    setFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await invoiceService.deleteInvoice(invoice.id);
      setInvoices(prev => prev.filter(i => i.id !== invoice.id));
      toast({
        title: 'Invoice Deleted',
        description: `Invoice for ${invoice.customerName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the invoice.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchInvoices();
  };

  const invoiceColumns = [
    {
      key: 'id',
      header: 'Invoice #',
      cell: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">INV-{invoice.id.substring(0, 8)}</span>
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
            <span>Invoice: {safeFormatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Due: {safeFormatDate(invoice.dueDate)}</span>
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
    {
      key: 'actions',
      header: 'Actions',
      cell: (invoice: Invoice) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditInvoice(invoice);
            }}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteInvoice(invoice);
            }}
          >
            Delete
          </Button>
        </div>
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <InvoiceForm
        invoice={selectedInvoice}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Invoices;
