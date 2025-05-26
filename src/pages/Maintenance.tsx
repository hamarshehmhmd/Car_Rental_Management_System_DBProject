
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
import MaintenanceForm from '@/components/MaintenanceForm';

const Maintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | undefined>();

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

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const handleAddMaintenance = () => {
    setSelectedRecord(undefined);
    setFormOpen(true);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setFormOpen(true);
  };

  const handleDeleteMaintenance = async (record: MaintenanceRecord) => {
    try {
      await maintenanceService.deleteMaintenanceRecord(record.id);
      setMaintenanceRecords(prev => prev.filter(r => r.id !== record.id));
      toast({
        title: 'Maintenance Record Deleted',
        description: `Maintenance record for ${record.vehicleInfo} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the maintenance record.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchMaintenanceRecords();
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
    {
      key: 'actions',
      header: 'Actions',
      cell: (record: MaintenanceRecord) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMaintenance(record);
            }}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMaintenance(record);
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <MaintenanceForm
        record={selectedRecord}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Maintenance;
