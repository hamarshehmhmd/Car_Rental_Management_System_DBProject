
import React, { useEffect, useState, useCallback } from 'react';
import { Car, Calendar, Wrench, CreditCard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { DashboardSummary, Rental, Reservation, Vehicle } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { carService } from '@/services/carService';
import { toast } from '@/hooks/use-toast';

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
      // Fetch vehicle data to determine counts
      const vehicles = await carService.getVehicles();
      
      // Calculate counts from vehicles
      const availableCount = vehicles.filter(v => v.status === 'available').length;
      const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
      const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance');
      
      // For now, we'll use mock data for other metrics
      // In a real implementation, you would fetch from Supabase for all data
      setSummary({
        activeRentals: 12,
        upcomingReservations: 8,
        vehiclesInMaintenance: maintenanceCount,
        availableVehicles: availableCount,
        todayRevenue: 2450,
        monthRevenue: 28500
      });
      
      // Mock active rentals
      setActiveRentals([
        {
          id: '1',
          reservationId: 'r1',
          customerId: 'c1',
          vehicleId: 'v1',
          checkoutEmployeeId: 'e1',
          checkoutDate: '2025-05-15',
          expectedReturnDate: '2025-05-20',
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
          checkoutDate: '2025-05-16',
          expectedReturnDate: '2025-05-18',
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
          checkoutDate: '2025-05-14',
          expectedReturnDate: '2025-05-21',
          checkoutMileage: 23400,
          status: 'active',
          customerName: 'Robert Davis',
          vehicleInfo: 'Ford Explorer (2022)'
        }
      ]);
      
      // Mock upcoming reservations
      setUpcomingReservations([
        {
          id: 'r4',
          customerId: 'c4',
          categoryId: 'cat1',
          vehicleId: 'v4',
          reservationDate: '2025-05-10',
          pickupDate: '2025-05-20',
          returnDate: '2025-05-25',
          status: 'confirmed',
          employeeId: 'e1',
          customerName: 'Emma Wilson',
          categoryName: 'SUV'
        },
        {
          id: 'r5',
          customerId: 'c5',
          categoryId: 'cat2',
          vehicleId: null,
          reservationDate: '2025-05-12',
          pickupDate: '2025-05-22',
          returnDate: '2025-05-24',
          status: 'confirmed',
          employeeId: 'e2',
          customerName: 'Michael Brown',
          categoryName: 'Economy'
        }
      ]);
      
      // Use actual maintenance vehicles
      setMaintenanceVehicles(maintenanceVehicles);
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
    
    // Set up real-time listeners for vehicle status changes
    const channel = supabase
      .channel('public:vehicles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Vehicle data changed:', payload);
          fetchDashboardData();
        }
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
      cell: (rental: Rental) => <span>{rental.customerName}</span>
    },
    {
      key: 'vehicleInfo',
      header: 'Vehicle',
      cell: (rental: Rental) => <span>{rental.vehicleInfo}</span>
    },
    {
      key: 'checkoutDate',
      header: 'Checkout Date',
      cell: (rental: Rental) => <span>{rental.checkoutDate}</span>
    },
    {
      key: 'expectedReturnDate',
      header: 'Return Date',
      cell: (rental: Rental) => <span>{rental.expectedReturnDate}</span>
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
      cell: (reservation: Reservation) => <span>{reservation.customerName}</span>
    },
    {
      key: 'categoryName',
      header: 'Vehicle Category',
      cell: (reservation: Reservation) => <span>{reservation.categoryName}</span>
    },
    {
      key: 'pickupDate',
      header: 'Pickup Date',
      cell: (reservation: Reservation) => <span>{reservation.pickupDate}</span>
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      cell: (reservation: Reservation) => <span>{reservation.returnDate}</span>
    }
  ];
  
  // Define table columns for maintenance vehicles
  const maintenanceColumns = [
    {
      key: 'make',
      header: 'Make',
      cell: (vehicle: Vehicle) => <span>{vehicle.make}</span>
    },
    {
      key: 'model',
      header: 'Model',
      cell: (vehicle: Vehicle) => <span>{vehicle.model}</span>
    },
    {
      key: 'year',
      header: 'Year',
      cell: (vehicle: Vehicle) => <span>{vehicle.year}</span>
    },
    {
      key: 'licensePlate',
      header: 'License Plate',
      cell: (vehicle: Vehicle) => <span>{vehicle.licensePlate}</span>
    },
    {
      key: 'status',
      header: 'Status',
      cell: (vehicle: Vehicle) => <StatusBadge status={vehicle.status} type="vehicle" />
    }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your rental fleet and business metrics."
      />
      
      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Active Rentals"
            value={summary.activeRentals}
            icon={<Car className="h-5 w-5" />}
            description="Current ongoing rentals"
          />
          <StatsCard
            title="Upcoming Reservations"
            value={summary.upcomingReservations}
            icon={<Calendar className="h-5 w-5" />}
            description="In the next 7 days"
          />
          <StatsCard
            title="Vehicles in Maintenance"
            value={summary.vehiclesInMaintenance}
            icon={<Wrench className="h-5 w-5" />}
            description="Currently unavailable"
          />
          <StatsCard
            title="Available Vehicles"
            value={summary.availableVehicles}
            icon={<Car className="h-5 w-5" />}
            description="Ready for rental"
          />
          <StatsCard
            title="Today's Revenue"
            value={`$${summary.todayRevenue.toLocaleString()}`}
            icon={<CreditCard className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${summary.monthRevenue.toLocaleString()}`}
            icon={<CreditCard className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
        
        {/* Tables grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Rentals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={activeRentals}
                columns={rentalColumns}
                searchable={false}
                loading={loading}
              />
            </CardContent>
          </Card>
          
          {/* Upcoming Reservations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={upcomingReservations}
                columns={reservationColumns}
                searchable={false}
                loading={loading}
              />
            </CardContent>
          </Card>
          
          {/* Maintenance Vehicles Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vehicles in Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
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
    </div>
  );
};

export default Dashboard;
