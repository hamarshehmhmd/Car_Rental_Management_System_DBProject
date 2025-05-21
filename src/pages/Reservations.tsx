
import React, { useEffect, useState } from 'react';
import { PlusCircle, CalendarClock } from 'lucide-react';
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
import { reservationService } from '@/services/reservationService';
import { safeFormatDate } from '@/utils/dateUtils';

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const data = await reservationService.getReservations();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: 'Failed to load reservations',
          description: 'There was an error loading the reservation data.',
          variant: 'destructive',
        });
      } finally {
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
            <span>Pickup: {safeFormatDate(reservation.pickupDate)}</span>
          </div>
          <div className="flex items-center text-sm">
            <CalendarClock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <span>Return: {safeFormatDate(reservation.returnDate)}</span>
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
        <span>{safeFormatDate(reservation.reservationDate)}</span>
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reservations;
