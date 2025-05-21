
import React, { useEffect, useState } from 'react';
import { PlusCircle, Calendar, Car, Wrench } from 'lucide-react';
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
import { maintenanceService } from '@/services/maintenanceService';
import { safeFormatDate } from '@/utils/dateUtils';

const Maintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      setLoading(true);
      try {
        const records = await maintenanceService.getMaintenanceRecords();
        setMaintenanceRecords(records);
      } catch (error) {
        console.error('Error fetching maintenance records:', error);
        toast({
          title: 'Failed to load maintenance records',
          description: 'There was an error loading the maintenance data.',
          variant: 'destructive',
        });
      } finally {
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
          <span>{safeFormatDate(record.maintenanceDate)}</span>
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Maintenance;
