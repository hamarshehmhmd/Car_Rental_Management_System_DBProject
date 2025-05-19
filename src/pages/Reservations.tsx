
import React, { useEffect, useState } from 'react';
import { PlusCircle, CalendarClock } from 'lucide-react';
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
import { Reservation } from '@/types';
import supabase from '@/lib/supabase';

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('reservations')
        //   .select(`
        //     *,
        //     customers (firstName, lastName),
        //     vehicle_categories (name)
        //   `);
        
        // if (error) throw error;
        
        // Use mock data for now
        setTimeout(() => {
          setReservations(getReservationMockData());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: 'Failed to load reservations',
          description: 'There was an error loading the reservation data.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleAddReservation = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Add reservation functionality will be available soon.',
    });
  };

  const handleViewReservation = (reservation: Reservation) => {
    toast({
      title: 'Reservation Selected',
      description: `Selected reservation for ${reservation.customerName}`,
    });
  };

  const reservationColumns = [
    {
      key: 'customer',
      header: 'Customer',
      cell: (reservation: Reservation) => (
        <span className="font-medium">{reservation.customerName}</span>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      cell: (reservation: Reservation) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Pickup: {format(new Date(reservation.pickupDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Return: {format(new Date(reservation.returnDate), 'MMM dd, yyyy')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Vehicle Category',
      cell: (reservation: Reservation) => <span>{reservation.categoryName}</span>,
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (reservation: Reservation) => (
        <span>{reservation.vehicleInfo || 'Not assigned'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (reservation: Reservation) => (
        <StatusBadge status={reservation.status} type="reservation" />
      ),
    },
    {
      key: 'reservationDate',
      header: 'Reserved On',
      cell: (reservation: Reservation) => (
        <span>{format(new Date(reservation.reservationDate), 'MMM dd, yyyy')}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Reservations" 
        description="Manage customer reservation requests and vehicle assignments."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Reservations</CardTitle>
              <CardDescription>
                View and manage all customer reservations.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddReservation}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={reservations}
              columns={reservationColumns}
              searchable={true}
              onRowClick={handleViewReservation}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock data for reservations
function getReservationMockData(): Reservation[] {
  return [
    {
      id: 'r1',
      customerId: 'c1',
      categoryId: 'cat2',
      vehicleId: 'v1',
      reservationDate: '2025-04-15',
      pickupDate: '2025-05-20',
      returnDate: '2025-05-27',
      status: 'confirmed',
      employeeId: 'e1',
      customerName: 'John Smith',
      categoryName: 'Compact',
      vehicleInfo: 'Toyota Camry (2022)'
    },
    {
      id: 'r2',
      customerId: 'c2',
      categoryId: 'cat3',
      vehicleId: 'v2',
      reservationDate: '2025-04-20',
      pickupDate: '2025-05-25',
      returnDate: '2025-05-30',
      status: 'confirmed',
      employeeId: 'e2',
      customerName: 'Emily Johnson',
      categoryName: 'SUV',
      vehicleInfo: 'Honda CR-V (2023)'
    },
    {
      id: 'r3',
      customerId: 'c3',
      categoryId: 'cat4',
      vehicleId: null,
      reservationDate: '2025-05-01',
      pickupDate: '2025-05-15',
      returnDate: '2025-05-18',
      status: 'pending',
      employeeId: 'e1',
      customerName: 'Michael Brown',
      categoryName: 'Luxury',
      vehicleInfo: null
    },
    {
      id: 'r4',
      customerId: 'c4',
      categoryId: 'cat1',
      vehicleId: 'v4',
      reservationDate: '2025-04-10',
      pickupDate: '2025-05-10',
      returnDate: '2025-05-17',
      status: 'completed',
      employeeId: 'e2',
      customerName: 'Sarah Davis',
      categoryName: 'Economy',
      vehicleInfo: 'Chevrolet Equinox (2022)'
    },
    {
      id: 'r5',
      customerId: 'c5',
      categoryId: 'cat3',
      vehicleId: null,
      reservationDate: '2025-05-08',
      pickupDate: '2025-06-05',
      returnDate: '2025-06-12',
      status: 'confirmed',
      employeeId: 'e1',
      customerName: 'Robert Wilson',
      categoryName: 'SUV',
      vehicleInfo: null
    },
    {
      id: 'r6',
      customerId: 'c2',
      categoryId: 'cat5',
      vehicleId: null,
      reservationDate: '2025-04-25',
      pickupDate: '2025-05-30',
      returnDate: '2025-06-06',
      status: 'cancelled',
      employeeId: 'e2',
      customerName: 'Emily Johnson',
      categoryName: 'Premium',
      vehicleInfo: null
    }
  ];
}

export default Reservations;
