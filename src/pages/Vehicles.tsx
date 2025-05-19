
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Vehicle, VehicleCategory } from '@/types';
import { carService } from '@/services/carService';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchData();
  }, []);

  // Filter vehicles based on selected status
  const filteredVehicles = statusFilter === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.status === statusFilter);

  const handleAddVehicle = () => {
    // Navigate to vehicle form or open modal
    toast({
      title: 'Feature Coming Soon',
      description: 'Add vehicle functionality will be available soon.',
    });
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    // Navigate to vehicle details page
    toast({
      title: 'Vehicle Selected',
      description: `Selected ${vehicle.make} ${vehicle.model}`,
    });
  };

  const vehicleColumns = [
    {
      key: 'make',
      header: 'Make',
      cell: (vehicle: Vehicle) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={vehicle.imageUrl || 'https://source.unsplash.com/random/800x600/?car'} 
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
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
              onRowClick={handleViewVehicle}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vehicles;
