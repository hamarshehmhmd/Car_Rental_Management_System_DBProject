
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Filter, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import CarLogo from '@/components/CarLogo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Vehicle, VehicleCategory } from '@/types';
import { carService } from '@/services/carService';
import VehicleForm from '@/components/VehicleForm';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch vehicles and categories in parallel
      const [vehiclesData, categoriesData] = await Promise.all([
        carService.getVehicles(),
        carService.getVehicleCategories()
      ]);
      
      // Enhance vehicles with category names
      const enhancedVehicles = vehiclesData.map(vehicle => {
        const category = categoriesData.find(cat => cat.id === vehicle.categoryId);
        return {
          ...vehicle,
          categoryName: category?.name || 'Unknown'
        };
      });
      
      setVehicles(enhancedVehicles);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Failed to load vehicles',
        description: 'There was an error loading the vehicle data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter vehicles based on selected status
  const filteredVehicles = statusFilter === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.status === statusFilter);

  const handleAddVehicle = () => {
    setSelectedVehicle(undefined);
    setIsFormOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      try {
        await carService.deleteVehicle(vehicleToDelete.id);
        fetchData(); // Refresh the data
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: 'Error deleting vehicle',
          description: 'The vehicle could not be deleted.',
          variant: 'destructive',
        });
      }
    }
  };

  const vehicleColumns = [
    {
      key: 'make',
      header: 'Make',
      cell: (vehicle: Vehicle) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <CarLogo 
              make={vehicle.make} 
              model={vehicle.model}
              className="w-8 h-8 object-contain"
              fallbackClassName="w-6 h-6 text-gray-400"
            />
          </div>
          <span className="font-medium">{vehicle.make}</span>
        </div>
      ),
    },
    {
      key: 'model',
      header: 'Model',
      cell: (vehicle: Vehicle) => <span>{vehicle.model}</span>,
    },
    {
      key: 'year',
      header: 'Year',
      cell: (vehicle: Vehicle) => <span>{vehicle.year}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (vehicle: Vehicle) => <span>{vehicle.categoryName}</span>,
    },
    {
      key: 'licensePlate',
      header: 'License Plate',
      cell: (vehicle: Vehicle) => <span className="font-mono">{vehicle.licensePlate}</span>,
    },
    {
      key: 'mileage',
      header: 'Mileage',
      cell: (vehicle: Vehicle) => <span>{vehicle.mileage.toLocaleString()} km</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (vehicle: Vehicle) => <StatusBadge status={vehicle.status} type="vehicle" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (vehicle: Vehicle) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditVehicle(vehicle)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle)}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Vehicle Fleet" 
        description="Manage all vehicles in your rental fleet."
      />
      
      <div className="p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>
                View and manage all vehicles in the fleet.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="all">All Vehicles</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="available">Available</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rented">Rented</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="maintenance">In Maintenance</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="reserved">Reserved</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={handleAddVehicle}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredVehicles}
              columns={vehicleColumns}
              searchable={true}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Vehicle Form Dialog */}
      <VehicleForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchData}
        vehicle={selectedVehicle}
        categories={categories}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vehicle{' '}
              {vehicleToDelete && `${vehicleToDelete.make} ${vehicleToDelete.model} (${vehicleToDelete.licensePlate})`}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vehicles;
