
import React, { useEffect, useState } from 'react';
import { PlusCircle, FileText, CreditCard } from 'lucide-react';
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
import { Payment } from '@/types';
import { paymentService } from '@/services/paymentService';
import { safeFormatDate } from '@/utils/dateUtils';
import PaymentForm from '@/components/PaymentForm';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Failed to load payments',
        description: 'There was an error loading the payment data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = () => {
    setSelectedPayment(undefined);
    setFormOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setFormOpen(true);
  };

  const handleDeletePayment = async (payment: Payment) => {
    try {
      await paymentService.deletePayment(payment.id);
      setPayments(prev => prev.filter(p => p.id !== payment.id));
      toast({
        title: 'Payment Deleted',
        description: `Payment for ${payment.customerName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the payment.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchPayments();
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const handleViewPayment = (payment: Payment) => {
    handleEditPayment(payment);
  };

  const getPaymentMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      credit: 'bg-blue-100 text-blue-700 border border-blue-400',
      debit: 'bg-green-100 text-green-700 border border-green-400',
      cash: 'bg-yellow-100 text-yellow-700 border border-yellow-400',
      bank_transfer: 'bg-purple-100 text-purple-700 border border-purple-400',
    };
    
    const labels: Record<string, string> = {
      credit: 'Credit Card',
      debit: 'Debit Card',
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[method] || 'bg-gray-100 text-gray-700 border border-gray-400'}`}>
        {labels[method] || method}
      </span>
    );
  };

  const paymentColumns = [
    {
      key: 'id',
      header: 'Payment #',
      cell: (payment: Payment) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">PMT-{payment.id.substring(0, 8)}</span>
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Invoice',
      cell: (payment: Payment) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{payment.invoiceInfo}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (payment: Payment) => (
        <span className="font-medium">{payment.customerName}</span>
      ),
    },
    {
      key: 'date',
      header: 'Payment Date',
      cell: (payment: Payment) => (
        <span>{safeFormatDate(payment.paymentDate)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => (
        <span className="font-medium">${payment.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      cell: (payment: Payment) => getPaymentMethodBadge(payment.paymentMethod),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <StatusBadge status={payment.status} type="payment" />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (payment: Payment) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditPayment(payment);
            }}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayment(payment);
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
        title="Payments" 
        description="Track and process customer payments for invoices."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>
                View and manage all customer payments.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddPayment}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={payments}
              columns={paymentColumns}
              searchable={true}
              onRowClick={handleViewPayment}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <PaymentForm
        payment={selectedPayment}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Payments;
