
import React, { useEffect, useState } from 'react';
import { CalendarClock, Car, CheckSquare } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
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
import { Rental } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import supabase from '@/lib/supabase';

const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [returnMileage, setReturnMileage] = useState('');

  useEffect(() => {
    const fetchRentals = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('rentals')
        //   .select(`
        //     *,
        //     customers (firstName, lastName),
        //     vehicles (make, model, year)
        //   `);
        
        // if (error) throw error;
        
        // Use mock data for now
        setTimeout(() => {
          setRentals(getRentalMockData());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        toast({
          title: 'Failed to load rentals',
          description: 'There was an error loading the rental data.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const handleViewRental = (rental: Rental) => {
    setSelectedRental(rental);
    
    // If rental is active, show checkin dialog
    if (rental.status === 'active') {
      setCheckinDialogOpen(true);
      // Default return mileage to a reasonable value higher than checkout
      setReturnMileage((rental.checkoutMileage + 500).toString());
    } else {
      toast({
        title: 'Rental Details',
        description: `Viewing details for ${rental.customerName}'s rental.`,
      });
    }
  };

  const handleCheckin = () => {
    if (!selectedRental) return;
    
    // In a real app, this would update the database
    // const { error } = await supabase
    //   .from('rentals')
    //   .update({
    //     status: 'completed',
    //     actualReturnDate: new Date().toISOString(),
    //     returnMileage: parseInt(returnMileage, 10)
    //   })
    //   .eq('id', selectedRental.id);
    
    toast({
      title: 'Vehicle Checked In',
      description: `Vehicle has been successfully returned.`,
    });
    
    // Update local state
    const updatedRentals = rentals.map(rental => {
      if (rental.id === selectedRental.id) {
        return {
          ...rental,
          status: 'completed',
          actualReturnDate: new Date().toISOString(),
          returnMileage: parseInt(returnMileage, 10)
        };
      }
      return rental;
    });
    
    setRentals(updatedRentals);
    setCheckinDialogOpen(false);
  };

  const rentalColumns = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (rental: Rental) => (
        <span className="font-medium">{rental.customerName}</span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (rental: Rental) => (
        <div className="flex items-center space-x-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span>{rental.vehicleInfo}</span>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      cell: (rental: Rental) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Out: {format(new Date(rental.checkoutDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {rental.actualReturnDate
                ? `In: ${format(new Date(rental.actualReturnDate), 'MMM dd, yyyy')}`
                : `Due: ${format(new Date(rental.expectedReturnDate), 'MMM dd, yyyy')}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'mileage',
      header: 'Mileage',
      cell: (rental: Rental) => (
        <div className="space-y-1">
          <div className="text-sm">Out: {rental.checkoutMileage.toLocaleString()} km</div>
          {rental.returnMileage && (
            <div className="text-sm">In: {rental.returnMileage.toLocaleString()} km</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (rental: Rental) => (
        <StatusBadge 
          status={
            rental.status === 'active' && 
            isAfter(new Date(), new Date(rental.expectedReturnDate)) 
              ? 'overdue' 
              : rental.status
          } 
          type="rental" 
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (rental: Rental) => (
        <div>
          {rental.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewRental(rental);
              }}
            >
              <CheckSquare className="mr-1 h-3.5 w-3.5" />
              Check In
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Active Rentals" 
        description="Manage ongoing and completed rentals."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>All Rentals</CardTitle>
            <CardDescription>
              View and manage all vehicle rentals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rentals}
              columns={rentalColumns}
              searchable={true}
              onRowClick={handleViewRental}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Check-in Dialog */}
      {selectedRental && (
        <Dialog open={checkinDialogOpen} onOpenChange={setCheckinDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Vehicle Check-In</DialogTitle>
              <DialogDescription>
                Process the return of this vehicle and complete the rental.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Rental Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer</Label>
                    <div>{selectedRental.customerName}</div>
                  </div>
                  <div>
                    <Label>Vehicle</Label>
                    <div>{selectedRental.vehicleInfo}</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium">Check-In Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Checkout Date</Label>
                    <div>{format(new Date(selectedRental.checkoutDate), 'MMMM d, yyyy')}</div>
                  </div>
                  <div>
                    <Label>Expected Return</Label>
                    <div>{format(new Date(selectedRental.expectedReturnDate), 'MMMM d, yyyy')}</div>
                  </div>
                  <div>
                    <Label>Checkout Mileage</Label>
                    <div>{selectedRental.checkoutMileage.toLocaleString()} km</div>
                  </div>
                  <div>
                    <Label htmlFor="returnMileage">Return Mileage</Label>
                    <Input
                      id="returnMileage"
                      value={returnMileage}
                      onChange={(e) => setReturnMileage(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckinDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCheckin}>Complete Check-In</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Mock data for rentals
function getRentalMockData(): Rental[] {
  const today = new Date();
  
  return [
    {
      id: '1',
      reservationId: 'r1',
      customerId: 'c1',
      vehicleId: 'v1',
      checkoutEmployeeId: 'e1',
      checkoutDate: format(addDays(today, -7), 'yyyy-MM-dd'),
      expectedReturnDate: format(addDays(today, 3), 'yyyy-MM-dd'),
      checkoutMileage: 12500,
      status: 'active',
      customerName: 'John Smith',
      vehicleInfo: 'Toyota Camry (2023)'
    },
    {
      id: '2',
      reservationId: 'r2',
      customerId: 'c2',
      vehicleId: 'v2',
      checkoutEmployeeId: 'e1',
      checkoutDate: format(addDays(today, -14), 'yyyy-MM-dd'),
      expectedReturnDate: format(addDays(today, -7), 'yyyy-MM-dd'),
      checkoutMileage: 8700,
      status: 'active',
      customerName: 'Alice Johnson',
      vehicleInfo: 'Honda Civic (2024)'
    },
    {
      id: '3',
      reservationId: 'r3',
      customerId: 'c3',
      vehicleId: 'v3',
      checkoutEmployeeId: 'e2',
      checkoutDate: format(addDays(today, -10), 'yyyy-MM-dd'),
      expectedReturnDate: format(addDays(today, -3), 'yyyy-MM-dd'),
      actualReturnDate: format(addDays(today, -3), 'yyyy-MM-dd'),
      checkoutMileage: 23400,
      returnMileage: 24150,
      status: 'completed',
      customerName: 'Robert Davis',
      vehicleInfo: 'Ford Explorer (2022)'
    },
    {
      id: '4',
      reservationId: 'r4',
      customerId: 'c4',
      vehicleId: 'v4',
      checkoutEmployeeId: 'e1',
      checkinEmployeeId: 'e2',
      checkoutDate: format(addDays(today, -21), 'yyyy-MM-dd'),
      expectedReturnDate: format(addDays(today, -14), 'yyyy-MM-dd'),
      actualReturnDate: format(addDays(today, -15), 'yyyy-MM-dd'),
      checkoutMileage: 15800,
      returnMileage: 16450,
      status: 'completed',
      customerName: 'Emma Wilson',
      vehicleInfo: 'Nissan Rogue (2023)'
    },
    {
      id: '5',
      reservationId: 'r5',
      customerId: 'c5',
      vehicleId: 'v5',
      checkoutEmployeeId: 'e2',
      checkoutDate: format(addDays(today, -5), 'yyyy-MM-dd'),
      expectedReturnDate: format(addDays(today, 2), 'yyyy-MM-dd'),
      checkoutMileage: 32100,
      status: 'active',
      customerName: 'Michael Brown',
      vehicleInfo: 'Jeep Cherokee (2022)'
    }
  ];
}

export default Rentals;
