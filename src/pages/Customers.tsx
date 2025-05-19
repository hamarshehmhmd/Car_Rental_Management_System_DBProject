
import React, { useEffect, useState } from 'react';
import { PlusCircle, Filter, Mail, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types';
import { customerService } from '@/services/customerService';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          title: 'Failed to load customers',
          description: 'There was an error loading the customer data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    // Navigate to customer form or open modal
    toast({
      title: 'Feature Coming Soon',
      description: 'Add customer functionality will be available soon.',
    });
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailsOpen(true);
  };

  const customerColumns = [
    {
      key: 'name',
      header: 'Name',
      cell: (customer: Customer) => (
        <div>
          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
          <div className="text-sm text-muted-foreground">{customer.email}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (customer: Customer) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{customer.phone}</span>
        </div>
      ),
    },
    {
      key: 'license',
      header: 'License',
      cell: (customer: Customer) => (
        <div>
          <div className="font-mono">{customer.licenseNumber}</div>
          <div className="text-sm text-muted-foreground">
            Expires: {format(new Date(customer.licenseExpiry), 'MMM dd, yyyy')}
          </div>
        </div>
      ),
    },
    {
      key: 'customerType',
      header: 'Type',
      cell: (customer: Customer) => <span>{customer.customerType}</span>,
    },
    {
      key: 'createdAt',
      header: 'Customer Since',
      cell: (customer: Customer) => (
        <span>{format(new Date(customer.createdAt), 'MMM dd, yyyy')}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Customer Management" 
        description="Manage customer accounts and information."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                View and manage all customers in the system.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddCustomer}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              columns={customerColumns}
              searchable={true}
              onRowClick={handleViewCustomer}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Customer Details Dialog */}
      <Dialog open={customerDetailsOpen} onOpenChange={setCustomerDetailsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View complete information about this customer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label>Full Name</Label>
                      <div className="font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <div>{format(new Date(selectedCustomer.dateOfBirth), 'MMMM d, yyyy')}</div>
                    </div>
                    <div>
                      <Label>Customer Type</Label>
                      <div>{selectedCustomer.customerType}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="text-sm">{selectedCustomer.address}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>License Number</Label>
                    <div className="font-mono">{selectedCustomer.licenseNumber}</div>
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <div>{format(new Date(selectedCustomer.licenseExpiry), 'MMMM d, yyyy')}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="text-sm text-muted-foreground">
                Customer since {format(new Date(selectedCustomer.createdAt), 'MMMM d, yyyy')}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setCustomerDetailsOpen(false);
              toast({ title: "Edit feature", description: "Edit functionality coming soon" });
            }}>Edit Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
