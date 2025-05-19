
import React, { useEffect, useState } from 'react';
import { PlusCircle, Filter, Mail, Phone, Trash } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types';
import { customerService } from '@/services/customerService';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

// Form for adding a new customer
const AddCustomerForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseExpiry: '',
    customerType: 'Individual'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await customerService.createCustomer(formData);
      toast({
        title: 'Customer Added',
        description: `${formData.firstName} ${formData.lastName} has been added successfully.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input 
            id="firstName" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input 
            id="lastName" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input 
          id="phone" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input 
          id="address" 
          name="address" 
          value={formData.address} 
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input 
            id="dateOfBirth" 
            name="dateOfBirth" 
            type="date" 
            value={formData.dateOfBirth} 
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerType">Customer Type</Label>
          <Input 
            id="customerType" 
            name="customerType" 
            value={formData.customerType} 
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number *</Label>
          <Input 
            id="licenseNumber" 
            name="licenseNumber" 
            value={formData.licenseNumber} 
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseExpiry">License Expiry *</Label>
          <Input 
            id="licenseExpiry" 
            name="licenseExpiry" 
            type="date" 
            value={formData.licenseExpiry} 
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Customer"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    setAddCustomerDialogOpen(true);
  };

  const handleCustomerAdded = () => {
    setAddCustomerDialogOpen(false);
    fetchCustomers();
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailsOpen(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      toast({
        title: 'Customer Deleted',
        description: `${customerToDelete.firstName} ${customerToDelete.lastName} has been removed.`,
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
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
    {
      key: 'actions',
      header: 'Actions',
      cell: (customer: Customer) => (
        <div className="flex space-x-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(customer);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
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
            
            <Dialog open={addCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddCustomer}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Fill in the customer details below. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <AddCustomerForm onSuccess={handleCustomerAdded} />
              </DialogContent>
            </Dialog>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {customerToDelete?.firstName} {customerToDelete?.lastName}'s account 
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
