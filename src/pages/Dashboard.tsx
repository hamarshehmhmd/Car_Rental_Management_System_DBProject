
import React, { useEffect, useState, useCallback } from 'react';
import { Car, Calendar, Wrench, CreditCard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import CarLogo from '@/components/CarLogo';
import { DashboardSummary, Rental, Reservation, Vehicle } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { rentalService } from '@/services/rentalService';
import { reservationService } from '@/services/reservationService';
import { carService } from '@/services/carService';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    activeRentals: 0,
    upcomingReservations: 0,
    vehiclesInMaintenance: 0,
    availableVehicles: 0,
    todayRevenue: 0,
    monthRevenue: 0
  });
  
  const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<Reservation[]>([]);
  const [maintenanceVehicles, setMaintenanceVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [vehicles, rentals, reservations] = await Promise.all([
        carService.getVehicles(),
        rentalService.getRentals(),
        reservationService.getReservations()
      ]);
      
      // Calculate vehicle counts
      const availableCount = vehicles.filter(v => v.status === 'available').length;
      const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
      const maintenanceVehiclesList = vehicles.filter(v => v.status === 'maintenance');
      
      // Get active rentals (status = 'active')
      const activeRentalsList = rentals.filter(r => r.status === 'active');
      
      // Get upcoming reservations (status = 'confirmed' and pickup date is in the future)
      const today = new Date();
      const upcomingReservationsList = reservations.filter(r => 
        r.status === 'confirmed' && new Date(r.pickupDate) > today
      );
      
      // Calculate revenue - for now using mock data since we don't have payment records
      // In a real app, you would calculate this from actual payment/invoice data
      const todayRevenue = activeRentalsList.length * 150; // Approximate daily rate
      const monthRevenue = (activeRentalsList.length + upcomingReservationsList.length) * 150 * 5; // Approximate monthly
      
      setSummary({
        activeRentals: activeRentalsList.length,
        upcomingReservations: upcomingReservationsList.length,
        vehiclesInMaintenance: maintenanceCount,
        availableVehicles: availableCount,
        todayRevenue,
        monthRevenue
      });
      
      // Set the actual data
      setActiveRentals(activeRentalsList.slice(0, 5)); // Show only first 5 for dashboard
      setUpcomingReservations(upcomingReservationsList.slice(0, 5)); // Show only first 5 for dashboard
      setMaintenanceVehicles(maintenanceVehiclesList);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error fetching dashboard data',
        description: 'Could not update dashboard information.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listeners for data changes
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rentals' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => fetchDashboardData()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  // Define the table columns for active rentals
  const rentalColumns = [
    {
      key: 'customerName',
      header: 'Customer',
      cell: (rental: Rental) => (
        <span className="font-medium">{rental.customerName || 'Unknown Customer'}</span>
      )
    },
    {
      key: 'vehicleInfo',
      header: 'Vehicle',
      cell: (rental: Rental) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <CarLogo 
              make={rental.vehicleInfo?.split(' ')[0] || 'Unknown'} 
              className="w-6 h-6 object-contain"
              fallbackClassName="w-4 h-4 text-gray-400"
            />
          </div>
          <span className="text-sm">{rental.vehicleInfo || 'Unknown Vehicle'}</span>
        </div>
      )
    },
    {
      key: 'checkoutDate',
      header: 'Checkout',
      cell: (rental: Rental) => (
        <span className="text-sm">{new Date(rental.checkoutDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'expectedReturnDate',
      header: 'Return Due',
      cell: (rental: Rental) => (
        <span className="text-sm">{new Date(rental.expectedReturnDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (rental: Rental) => <StatusBadge status={rental.status} type="rental" />
    }
  ];
  
  // Define table columns for upcoming reservations
  const reservationColumns = [
    {
      key: 'customerName',
      header: 'Customer',
      cell: (reservation: Reservation) => (
        <span className="font-medium">{reservation.customerName || 'Unknown Customer'}</span>
      )
    },
    {
      key: 'categoryName',
      header: 'Category',
      cell: (reservation: Reservation) => (
        <span className="text-sm">{reservation.categoryName || 'Unknown Category'}</span>
      )
    },
    {
      key: 'pickupDate',
      header: 'Pickup',
      cell: (reservation: Reservation) => (
        <span className="text-sm">{new Date(reservation.pickupDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'returnDate',
      header: 'Return',
      cell: (reservation: Reservation) => (
        <span className="text-sm">{new Date(reservation.returnDate).toLocaleDateString()}</span>
      )
    }
  ];
  
  // Define table columns for maintenance vehicles
  const maintenanceColumns = [
    {
      key: 'make',
      header: 'Vehicle',
      cell: (vehicle: Vehicle) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <CarLogo 
              make={vehicle.make} 
              model={vehicle.model}
              className="w-6 h-6 object-contain"
              fallbackClassName="w-4 h-4 text-gray-400"
            />
          </div>
          <div>
            <span className="font-medium text-sm">{vehicle.make} {vehicle.model}</span>
            <div className="text-xs text-gray-500">{vehicle.year}</div>
          </div>
        </div>
      )
    },
    {
      key: 'licensePlate',
      header: 'License',
      cell: (vehicle: Vehicle) => (
        <span className="font-mono text-sm">{vehicle.licensePlate}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (vehicle: Vehicle) => <StatusBadge status={vehicle.status} type="vehicle" />
    }
  ];
  
  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your rental fleet and business metrics."
      />
      
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          <StatsCard
            title="Active Rentals"
            value={summary.activeRentals}
            icon={<Car className="h-4 w-4 lg:h-5 lg:w-5" />}
            description="Current ongoing rentals"
          />
          <StatsCard
            title="Upcoming Reservations"
            value={summary.upcomingReservations}
            icon={<Calendar className="h-4 w-4 lg:h-5 lg:w-5" />}
            description="In the next 7 days"
          />
          <StatsCard
            title="In Maintenance"
            value={summary.vehiclesInMaintenance}
            icon={<Wrench className="h-4 w-4 lg:h-5 lg:w-5" />}
            description="Currently unavailable"
          />
          <StatsCard
            title="Available Vehicles"
            value={summary.availableVehicles}
            icon={<Car className="h-4 w-4 lg:h-5 lg:w-5" />}
            description="Ready for rental"
          />
          <StatsCard
            title="Today's Revenue"
            value={`$${summary.todayRevenue.toLocaleString()}`}
            icon={<CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${summary.monthRevenue.toLocaleString()}`}
            icon={<CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        
        {/* Tables grid - Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active Rentals Table */}
          <Card className="col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Active Rentals</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DataTable
                data={activeRentals}
                columns={rentalColumns}
                searchable={false}
                loading={loading}
              />
            </CardContent>
          </Card>
          
          {/* Upcoming Reservations Table */}
          <Card className="col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Upcoming Reservations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DataTable
                data={upcomingReservations}
                columns={reservationColumns}
                searchable={false}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Maintenance Vehicles Table - Full Width */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Vehicles in Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              data={maintenanceVehicles}
              columns={maintenanceColumns}
              searchable={false}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
