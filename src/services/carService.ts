
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleCategory, VehicleStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

export const carService = {
  // Fetch vehicles from Supabase
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) throw error;
      
      if (vehicles && vehicles.length > 0) {
        // Add category names
        const categories = await this.getVehicleCategories();
        
        const enhancedVehicles = vehicles.map(vehicle => {
          const category = categories.find(cat => cat.id === vehicle.category_id);
          return {
            id: vehicle.id,
            vin: vehicle.vin,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            licensePlate: vehicle.license_plate,
            mileage: vehicle.mileage,
            status: vehicle.status as VehicleStatus,
            categoryId: vehicle.category_id,
            categoryName: category?.name || 'Unknown',
            imageUrl: vehicle.image_url
          };
        });
        
        return enhancedVehicles as Vehicle[];
      }
      
      // If no vehicles found, return mock data
      return carService.getCarMockData() as Vehicle[];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error fetching vehicles',
        description: 'Could not fetch vehicle data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return carService.getCarMockData() as Vehicle[];
    }
  },
  
  // Create a new vehicle in Supabase
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      // Convert from frontend model to database model
      const dbVehicle = {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        vin: vehicle.vin,
        license_plate: vehicle.licensePlate,
        mileage: vehicle.mileage,
        status: vehicle.status,
        category_id: vehicle.categoryId,
        image_url: vehicle.imageUrl
      };
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert([dbVehicle])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert back to frontend model
      return {
        id: data.id,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        licensePlate: data.license_plate,
        mileage: data.mileage,
        status: data.status as VehicleStatus,
        categoryId: data.category_id,
        imageUrl: data.image_url
      };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: 'Error creating vehicle',
        description: 'Could not create the vehicle.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update an existing vehicle
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      // Convert from frontend model to database model
      const dbVehicle: Record<string, any> = {};
      
      if (vehicle.make) dbVehicle.make = vehicle.make;
      if (vehicle.model) dbVehicle.model = vehicle.model;
      if (vehicle.year) dbVehicle.year = vehicle.year;
      if (vehicle.color) dbVehicle.color = vehicle.color;
      if (vehicle.vin) dbVehicle.vin = vehicle.vin;
      if (vehicle.licensePlate) dbVehicle.license_plate = vehicle.licensePlate;
      if (vehicle.mileage) dbVehicle.mileage = vehicle.mileage;
      if (vehicle.status) dbVehicle.status = vehicle.status;
      if (vehicle.categoryId) dbVehicle.category_id = vehicle.categoryId;
      if (vehicle.imageUrl) dbVehicle.image_url = vehicle.imageUrl;
      
      const { data, error } = await supabase
        .from('vehicles')
        .update(dbVehicle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert back to frontend model
      return {
        id: data.id,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        licensePlate: data.license_plate,
        mileage: data.mileage,
        status: data.status as VehicleStatus,
        categoryId: data.category_id,
        imageUrl: data.image_url
      };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Error updating vehicle',
        description: 'Could not update the vehicle.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Delete a vehicle
  async deleteVehicle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Vehicle deleted',
        description: 'Vehicle has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error deleting vehicle',
        description: 'Could not delete the vehicle.',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Get vehicle categories from Supabase
  async getVehicleCategories(): Promise<VehicleCategory[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [
          { id: 'cat-1', name: 'Economy', description: 'Small, fuel-efficient cars', baseRentalRate: 25, insuranceRate: 5 },
          { id: 'cat-2', name: 'Compact', description: 'Compact cars', baseRentalRate: 30, insuranceRate: 6 },
          { id: 'cat-3', name: 'SUV', description: 'Sport Utility Vehicles', baseRentalRate: 45, insuranceRate: 9 },
          { id: 'cat-4', name: 'Luxury', description: 'High-end luxury vehicles', baseRentalRate: 75, insuranceRate: 15 },
          { id: 'cat-5', name: 'Premium', description: 'Premium vehicles', baseRentalRate: 60, insuranceRate: 12 }
        ];
      }
      
      return data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        baseRentalRate: category.base_rental_rate,
        insuranceRate: category.insurance_rate
      })) as VehicleCategory[];
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
      // Return mock categories as fallback
      return [
        { id: 'cat-1', name: 'Economy', description: 'Small, fuel-efficient cars', baseRentalRate: 25, insuranceRate: 5 },
        { id: 'cat-2', name: 'Compact', description: 'Compact cars', baseRentalRate: 30, insuranceRate: 6 },
        { id: 'cat-3', name: 'SUV', description: 'Sport Utility Vehicles', baseRentalRate: 45, insuranceRate: 9 },
        { id: 'cat-4', name: 'Luxury', description: 'High-end luxury vehicles', baseRentalRate: 75, insuranceRate: 15 },
        { id: 'cat-5', name: 'Premium', description: 'Premium vehicles', baseRentalRate: 60, insuranceRate: 12 }
      ];
    }
  },
  
  // Mock data as fallback
  getCarMockData(): Vehicle[] {
    return [
      {
        id: 'v-1',
        vin: 'VIN12345678',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'ABC123',
        mileage: 15600,
        status: 'available',
        categoryId: 'cat-2',
        imageUrl: 'https://source.unsplash.com/random/800x600/?car,toyota,camry'
      },
      {
        id: 'v-2',
        vin: 'VIN87654321',
        make: 'Honda',
        model: 'CR-V',
        year: 2023,
        color: 'Blue',
        licensePlate: 'XYZ789',
        mileage: 8200,
        status: 'available',
        categoryId: 'cat-3',
        imageUrl: 'https://source.unsplash.com/random/800x600/?car,honda,crv'
      },
      {
        id: 'v-3',
        vin: 'VIN11223344',
        make: 'Ford',
        model: 'Mustang',
        year: 2021,
        color: 'Red',
        licensePlate: 'MUS001',
        mileage: 20300,
        status: 'maintenance',
        categoryId: 'cat-4',
        imageUrl: 'https://source.unsplash.com/random/800x600/?car,ford,mustang'
      },
      {
        id: 'v-4',
        vin: 'VIN55667788',
        make: 'Chevrolet',
        model: 'Equinox',
        year: 2022,
        color: 'White',
        licensePlate: 'EQX234',
        mileage: 12400,
        status: 'rented',
        categoryId: 'cat-3',
        imageUrl: 'https://source.unsplash.com/random/800x600/?car,chevrolet,equinox'
      },
      {
        id: 'v-5',
        vin: 'VIN99001122',
        make: 'BMW',
        model: '3 Series',
        year: 2023,
        color: 'Black',
        licensePlate: 'BMW456',
        mileage: 5600,
        status: 'available',
        categoryId: 'cat-5',
        imageUrl: 'https://source.unsplash.com/random/800x600/?car,bmw,3series'
      },
    ];
  }
};

// Helper functions (keep the existing helper functions)
function getRandomColor(): string {
  const colors = ['Red', 'Blue', 'Black', 'White', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Purple', 'Brown'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomLicensePlate(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let plate = '';
  
  // Generate 3 random letters
  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  plate += '-';
  
  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return plate;
}

function getRandomStatus(): string {
  const statuses = ['available', 'rented', 'maintenance', 'reserved'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getCategoryIdFromType(type: string): string {
  switch (type.toLowerCase()) {
    case 'suv':
      return 'cat-3';
    case 'luxury':
    case 'sport':
      return 'cat-4';
    case 'compact':
    case 'coupe':
      return 'cat-2';
    case 'sedan':
      return 'cat-5';
    default:
      return 'cat-1'; // Economy as default
  }
}
