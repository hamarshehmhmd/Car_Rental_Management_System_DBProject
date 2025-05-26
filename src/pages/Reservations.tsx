
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
import ReservationForm from '@/components/ReservationForm';

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>();

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

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleAddReservation = () => {
    setSelectedReservation(undefined);
    setFormOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormOpen(true);
  };

  const handleDeleteReservation = async (reservation: Reservation) => {
    try {
      await reservationService.deleteReservation(reservation.id);
      setReservations(prev => prev.filter(r => r.id !== reservation.id));
      toast({
        title: 'Reservation Deleted',
        description: `Reservation for ${reservation.customerName} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the reservation.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    try {
      await reservationService.updateReservation(reservation.id, { status: 'cancelled' });
      setReservations(prev => 
        prev.map(r => 
          r.id === reservation.id 
            ? { ...r, status: 'cancelled' }
            : r
        )
      );
      toast({
        title: 'Reservation Cancelled',
        description: `Reservation for ${reservation.customerName} has been cancelled.`,
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: 'Cancel Failed',
        description: 'Could not cancel the reservation.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchReservations();
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
    {
      key: 'actions',
      header: 'Actions',
      cell: (reservation: Reservation) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditReservation(reservation);
            }}
          >
            Edit
          </Button>
          {reservation.status === 'pending' || reservation.status === 'confirmed' ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelReservation(reservation);
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteReservation(reservation);
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <ReservationForm
        reservation={selectedReservation}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Reservations;
