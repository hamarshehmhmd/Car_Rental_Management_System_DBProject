
import React, { useEffect, useState } from 'react';
import { PlusCircle, Calendar, Car, Wrench } from 'lucide-react';
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
import { MaintenanceRecord } from '@/types';
import supabase from '@/lib/supabase';

const Maintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('maintenance_records')
        //   .select(`
        //     *,
        //     vehicles (make, model, year),
        //     employees (firstName, lastName)
        //   `);
        
        // if (error) throw error;
        
        // Use mock data for now
        setTimeout(() => {
          setMaintenanceRecords(getMaintenanceMockData());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching maintenance records:', error);
        toast({
          title: 'Failed to load maintenance records',
          description: 'There was an error loading the maintenance data.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchMaintenanceRecords();
  }, []);

  const handleAddMaintenance = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Add maintenance functionality will be available soon.',
    });
  };

  const handleViewMaintenance = (record: MaintenanceRecord) => {
    toast({
      title: 'Maintenance Record Selected',
      description: `Selected ${record.maintenanceType} for ${record.vehicleInfo}`,
    });
  };

  const maintenanceColumns = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (record: MaintenanceRecord) => (
        <div className="flex items-center space-x-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{record.vehicleInfo}</span>
        </div>
      ),
    },
    {
      key: 'maintenanceType',
      header: 'Type',
      cell: (record: MaintenanceRecord) => (
        <div className="flex items-center space-x-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span>{record.maintenanceType}</span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (record: MaintenanceRecord) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(record.maintenanceDate), 'MMM dd, yyyy')}</span>
        </div>
      ),
    },
    {
      key: 'mileage',
      header: 'Mileage',
      cell: (record: MaintenanceRecord) => (
        <span>{record.mileage.toLocaleString()} km</span>
      ),
    },
    {
      key: 'cost',
      header: 'Cost',
      cell: (record: MaintenanceRecord) => (
        <span>${record.cost.toLocaleString()}</span>
      ),
    },
    {
      key: 'technician',
      header: 'Technician',
      cell: (record: MaintenanceRecord) => (
        <span>{record.technicianName}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (record: MaintenanceRecord) => (
        <StatusBadge status={record.status} type="maintenance" />
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Vehicle Maintenance" 
        description="Track and schedule vehicle maintenance and repairs."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>
                View and manage all vehicle maintenance activities.
              </CardDescription>
            </div>
            
            <Button onClick={handleAddMaintenance}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={maintenanceRecords}
              columns={maintenanceColumns}
              searchable={true}
              onRowClick={handleViewMaintenance}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Mock data for maintenance
function getMaintenanceMockData(): MaintenanceRecord[] {
  return [
    {
      id: 'm1',
      vehicleId: 'v1',
      maintenanceType: 'Oil Change',
      description: 'Regular 5,000 km oil change service with filter replacement',
      technicianId: 't1',
      maintenanceDate: '2025-04-15',
      mileage: 15600,
      cost: 75,
      status: 'completed',
      vehicleInfo: 'Toyota Camry (2023)',
      technicianName: 'Mike Chen'
    },
    {
      id: 'm2',
      vehicleId: 'v2',
      maintenanceType: 'Brake Service',
      description: 'Replaced front brake pads and rotors',
      technicianId: 't2',
      maintenanceDate: '2025-04-20',
      mileage: 32500,
      cost: 450,
      status: 'completed',
      vehicleInfo: 'Honda Civic (2024)',
      technicianName: 'Sarah Johnson'
    },
    {
      id: 'm3',
      vehicleId: 'v3',
      maintenanceType: 'Transmission Service',
      description: 'Complete transmission fluid flush and filter change',
      technicianId: 't1',
      maintenanceDate: '2025-05-05',
      mileage: 45800,
      cost: 350,
      status: 'in-progress',
      vehicleInfo: 'Ford Explorer (2022)',
      technicianName: 'Mike Chen'
    },
    {
      id: 'm4',
      vehicleId: 'v4',
      maintenanceType: 'Annual Inspection',
      description: 'Complete vehicle inspection and certification',
      technicianId: 't3',
      maintenanceDate: '2025-05-15',
      mileage: 12200,
      cost: 150,
      status: 'scheduled',
      vehicleInfo: 'Nissan Rogue (2023)',
      technicianName: 'James Wilson'
    },
    {
      id: 'm5',
      vehicleId: 'v5',
      maintenanceType: 'Tire Rotation',
      description: 'Rotation and balancing of all four tires',
      technicianId: 't2',
      maintenanceDate: '2025-04-28',
      mileage: 28600,
      cost: 120,
      status: 'completed',
      vehicleInfo: 'Jeep Cherokee (2022)',
      technicianName: 'Sarah Johnson'
    },
    {
      id: 'm6',
      vehicleId: 'v3',
      maintenanceType: 'Engine Diagnostics',
      description: 'Check engine light investigation and repair',
      technicianId: 't1',
      maintenanceDate: '2025-05-10',
      mileage: 46100,
      cost: 200,
      status: 'scheduled',
      vehicleInfo: 'Ford Explorer (2022)',
      technicianName: 'Mike Chen'
    },
  ];
}

export default Maintenance;
