
import React, { useEffect, useState } from 'react';
import { CalendarClock, Car, CheckSquare } from 'lucide-react';
import { format, addDays, isAfter, parseISO } from 'date-fns';
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
import { Rental, RentalStatus } from '@/types';
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
import { rentalService } from '@/services/rentalService';

// Helper function to safely format dates that might be invalid
const safeFormatDate = (dateString: string | undefined, fallback: string): string => {
  if (!dateString) return fallback;
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.error("Invalid date format:", dateString, error);
    return fallback;
  }
};

const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [returnMileage, setReturnMileage] = useState('');

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const data = await rentalService.getRentals();
      setRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: 'Failed to load rentals',
        description: 'There was an error loading the rental data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleCheckin = async () => {
    if (!selectedRental) return;
    
    try {
      const returnMileageNum = parseInt(returnMileage, 10);
      
      // Generate a proper UUID for the checkin employee - in a real app this would be the logged-in user
      const tempEmployeeId = '550e8400-e29b-41d4-a716-446655440000'; // Temporary UUID
      
      const updatedRental = await rentalService.updateRental(selectedRental.id, {
        status: 'completed',
        actualReturnDate: new Date().toISOString(),
        returnMileage: returnMileageNum,
        checkinEmployeeId: tempEmployeeId,
      });
      
      // Update local state
      setRentals(prev => 
        prev.map(rental => 
          rental.id === selectedRental.id 
            ? { ...updatedRental, customerName: selectedRental.customerName, vehicleInfo: selectedRental.vehicleInfo }
            : rental
        )
      );
      
      toast({
        title: 'Vehicle Checked In',
        description: `Vehicle has been successfully returned.`,
      });
      
      setCheckinDialogOpen(false);
    } catch (error) {
      console.error('Error checking in vehicle:', error);
      toast({
        title: 'Check-in Failed',
        description: 'Could not complete the vehicle check-in.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRental = async (rental: Rental) => {
    try {
      await rentalService.deleteRental(rental.id);
      setRentals(prev => prev.filter(r => r.id !== rental.id));
      toast({
        title: 'Rental Deleted',
        description: `Rental for ${rental.customerName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting rental:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the rental.',
        variant: 'destructive',
      });
    }
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
            <span>Out: {safeFormatDate(rental.checkoutDate, 'N/A')}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {rental.actualReturnDate
                ? `In: ${safeFormatDate(rental.actualReturnDate, 'N/A')}`
                : `Due: ${safeFormatDate(rental.expectedReturnDate, 'N/A')}`}
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
      cell: (rental: Rental) => {
        let status = rental.status;
        
        // Check if rental is overdue
        if (rental.status === 'active' && rental.expectedReturnDate) {
          try {
            if (isAfter(new Date(), parseISO(rental.expectedReturnDate))) {
              status = 'overdue' as RentalStatus;
            }
          } catch (error) {
            console.error("Error comparing dates:", error);
          }
        }
        
        return <StatusBadge status={status} type="rental" />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (rental: Rental) => (
        <div className="flex gap-2">
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
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRental(rental);
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
              loading={loading}
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
                    <div>{safeFormatDate(selectedRental.checkoutDate, 'N/A')}</div>
                  </div>
                  <div>
                    <Label>Expected Return</Label>
                    <div>{safeFormatDate(selectedRental.expectedReturnDate, 'N/A')}</div>
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

export default Rentals;
