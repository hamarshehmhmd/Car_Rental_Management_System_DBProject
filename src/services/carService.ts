import { supabase } from '@/integrations/supabase/client';
import { Vehicle, VehicleCategory, VehicleStatus } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from './supabaseService';

// Transformer for Vehicle data between database and frontend
const vehicleTransformer = {
  toFrontend: (dbVehicle: any): Vehicle => {
    return {
      id: dbVehicle.id,
      vin: dbVehicle.vin,
      make: dbVehicle.make,
      model: dbVehicle.model,
      year: dbVehicle.year,
      color: dbVehicle.color,
      licensePlate: dbVehicle.licenseplate,
      mileage: dbVehicle.mileage,
      status: dbVehicle.status as VehicleStatus,
      categoryId: dbVehicle.categoryid,
      imageUrl: dbVehicle.imageurl
    };
  },
  toDatabase: (vehicle: Partial<Vehicle>): Record<string, any> => {
    const dbVehicle: Record<string, any> = {};
    
    if (vehicle.make !== undefined) dbVehicle.make = vehicle.make;
    if (vehicle.model !== undefined) dbVehicle.model = vehicle.model;
    if (vehicle.year !== undefined) dbVehicle.year = vehicle.year;
    if (vehicle.color !== undefined) dbVehicle.color = vehicle.color;
    if (vehicle.vin !== undefined) dbVehicle.vin = vehicle.vin;
    if (vehicle.licensePlate !== undefined) dbVehicle.licenseplate = vehicle.licensePlate;
    if (vehicle.mileage !== undefined) dbVehicle.mileage = vehicle.mileage;
    if (vehicle.status !== undefined) dbVehicle.status = vehicle.status;
    if (vehicle.categoryId !== undefined) dbVehicle.categoryid = vehicle.categoryId;
    if (vehicle.imageUrl !== undefined) dbVehicle.imageurl = vehicle.imageUrl;
    
    return dbVehicle;
  }
};

// Transformer for VehicleCategory data
const categoryTransformer = {
  toFrontend: (dbCategory: any): VehicleCategory => {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      description: dbCategory.description,
      baseRentalRate: dbCategory.baserentalrate,
      insuranceRate: dbCategory.insurancerate
    };
  },
  toDatabase: (category: Partial<VehicleCategory>): Record<string, any> => {
    const dbCategory: Record<string, any> = {};
    
    if (category.name !== undefined) dbCategory.name = category.name;
    if (category.description !== undefined) dbCategory.description = category.description;
    if (category.baseRentalRate !== undefined) dbCategory.baserentalrate = category.baseRentalRate;
    if (category.insuranceRate !== undefined) dbCategory.insurancerate = category.insuranceRate;
    
    return dbCategory;
  }
};

export const carService = {
  // Fetch vehicles from Supabase
  async getVehicles(): Promise<Vehicle[]> {
    try {
      return await supabaseService.getAll<any, Vehicle>('vehicles', vehicleTransformer);
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
      return await supabaseService.create<any, Vehicle>('vehicles', vehicle, vehicleTransformer);
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
      return await supabaseService.update<any, Vehicle>('vehicles', id, vehicle, vehicleTransformer);
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
      await supabaseService.delete('vehicles', id);
      
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
      return await supabaseService.getAll<any, VehicleCategory>('vehicle_categories', categoryTransformer);
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
