
import React, { useEffect, useState } from 'react';
import { Car, Calendar, Wrench, CreditCard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { DashboardSummary, Rental, Reservation, Vehicle } from '@/types';
import supabase from '@/lib/supabase';

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
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from Supabase:
        /*
        // Fetch counts and summary data
        const [
          rentalsResponse,
          reservationsResponse,
          vehiclesResponse,
          revenueResponse
        ] = await Promise.all([
          supabase.from('rentals').select('*', { count: 'exact' }).eq('status', 'active'),
          supabase.from('reservations').select('*', { count: 'exact' }).eq('status', 'confirmed')
            .gt('pickupDate', new Date().toISOString()),
          supabase.from('vehicles').select('*', { count: 'exact' }).eq('status', 'maintenance'),
          supabase.from('vehicles').select('*', { count: 'exact' }).eq('status', 'available'),
          // For revenue calculations, you might need more complex queries
        ]);
        
        // Fetch detailed data for tables
        const activeRentalsData = await supabase
          .from('rentals')
          .select(`
            *,
            customers(firstName, lastName),
            vehicles(make, model, year)
          `)
          .eq('status', 'active')
          .limit(5);
          
        // ... similar for other tables
        */
        
        // For demonstration, we'll use mock data
        setSummary({
          activeRentals: 12,
          upcomingReservations: 8,
          vehiclesInMaintenance: 3,
          availableVehicles: 25,
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
        
        // Mock maintenance vehicles
        setMaintenanceVehicles([
          {
            id: 'v5',
            vin: '1HGCM82633A123456',
            make: 'Toyota',
            model: 'RAV4',
            year: 2022,
            color: 'Silver',
            licensePlate: 'ABC123',
            mileage: 15600,
            status: 'maintenance',
            categoryId: 'cat1'
          },
          {
            id: 'v6',
            vin: '2T1KR32E84C123789',
            make: 'Honda',
            model: 'Accord',
            year: 2023,
            color: 'Blue',
            licensePlate: 'XYZ789',
            mileage: 8200,
            status: 'maintenance',
            categoryId: 'cat3'
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
