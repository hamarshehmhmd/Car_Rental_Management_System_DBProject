
import React, { useEffect, useState, useCallback } from 'react';
import { Car, Calendar, Wrench, CreditCard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import CarLogo from '@/components/CarLogo';
import { DashboardSummary, Rental, Reservation, Vehicle, MaintenanceRecord } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { rentalService } from '@/services/rentalService';
import { reservationService } from '@/services/reservationService';
import { carService } from '@/services/carService';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';
import { maintenanceService } from '@/services/maintenanceService';
import { testSupabaseConnection } from '@/utils/testSupabase';
import { seedDatabase } from '@/utils/seedData';

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
  const [activeMaintenanceRecords, setActiveMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Test Supabase connection first
      console.log('🚀 Starting dashboard data fetch...');
      await testSupabaseConnection();
      
      // Seed database if empty
      console.log('🌱 Checking if database needs seeding...');
      await seedDatabase();
      
      // Fetch all data in parallel
      console.log('📊 Fetching dashboard data...');
      const [vehicles, rentals, reservations, payments, invoices, maintenanceRecords] = await Promise.all([
        carService.getVehicles(),
        rentalService.getRentals(),
        reservationService.getReservations(),
        paymentService.getPayments(),
        invoiceService.getInvoices(),
        maintenanceService.getMaintenanceRecords()
      ]);
      
      console.log('📈 Data fetched:', {
        vehicles: vehicles.length,
        rentals: rentals.length,
        reservations: reservations.length,
        payments: payments.length,
        invoices: invoices.length,
        maintenanceRecords: maintenanceRecords.length
      });
      
      // Calculate vehicle counts
      const availableCount = vehicles.filter(v => v.status === 'available').length;
      const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
      const maintenanceVehiclesList = vehicles.filter(v => v.status === 'maintenance');
      
      console.log('🚗 Vehicle status breakdown:', {
        total: vehicles.length,
        available: availableCount,
        maintenance: maintenanceCount,
        maintenanceVehicles: maintenanceVehiclesList.map(v => `${v.make} ${v.model} (${v.status})`),
        allVehicleStatuses: vehicles.map(v => `${v.make} ${v.model}: ${v.status}`)
      });
      
      // Get active maintenance records (in-progress or scheduled)
      const activeMaintenanceList = maintenanceRecords.filter(m => 
        m.status === 'in-progress' || m.status === 'scheduled'
      );
      
      // Get active rentals (status = 'active')
      const activeRentalsList = rentals.filter(r => r.status === 'active');
      
      // Get upcoming reservations (status = 'confirmed' and pickup date is in the future)
      const today = new Date();
      const upcomingReservationsList = reservations.filter(r => 
        r.status === 'confirmed' && new Date(r.pickupDate) > today
      );
      
      // Calculate revenue from actual payments
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const todaysPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return p.status === 'completed' && paymentDate >= todayStart && paymentDate <= todayEnd;
      });
      
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const thisMonthsPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return p.status === 'completed' && paymentDate >= monthStart;
      });
      
      const todayRevenue = todaysPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const monthRevenue = thisMonthsPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      setSummary({
        activeRentals: activeRentalsList.length,
        upcomingReservations: upcomingReservationsList.length,
        vehiclesInMaintenance: maintenanceCount,
        availableVehicles: availableCount,
        todayRevenue,
        monthRevenue
      });
      
      // Set the actual data
      setActiveRentals(activeRentalsList.slice(0, 5));
      setUpcomingReservations(upcomingReservationsList.slice(0, 5));
      setMaintenanceVehicles(maintenanceVehiclesList);
      setActiveMaintenanceRecords(activeMaintenanceList.slice(0, 5));
      
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
    
    // Set up real-time listeners for all relevant tables
    const channel = supabase
      .channel('dashboard-realtime-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        (payload) => {
          console.log('Vehicle update detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rentals' },
        (payload) => {
          console.log('Rental update detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Reservation update detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Payment update detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          console.log('Invoice update detected:', payload);
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_records' },
        (payload) => {
          console.log('Maintenance record update detected:', payload);
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
  
  const maintenanceColumns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (record: MaintenanceRecord) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <span className="font-medium text-sm">{record.vehicleInfo}</span>
            <div className="text-xs text-gray-500">{record.maintenanceType}</div>
          </div>
        </div>
      )
    },
    {
      key: 'technician',
      header: 'Technician',
      cell: (record: MaintenanceRecord) => (
        <span className="text-sm">{record.technicianName}</span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      cell: (record: MaintenanceRecord) => (
        <span className="text-sm">{new Date(record.maintenanceDate).toLocaleDateString()}</span>
      )
    },
    {
      key: 'cost',
      header: 'Cost',
      cell: (record: MaintenanceRecord) => (
        <span className="text-sm">${record.cost.toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (record: MaintenanceRecord) => <StatusBadge status={record.status} type="maintenance" />
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
        
        {/* Active Maintenance Records Table - Full Width */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Active Maintenance Records</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              data={activeMaintenanceRecords}
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
