
import supabase from '@/lib/supabase';
import { Vehicle, VehicleCategory } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CarAPIResponse {
  make: string;
  model: string;
  year: number;
  type?: string;
  img_url?: string;
}

export const carService = {
  // Fetch cars from external API as dummy data
  async fetchCarsFromAPI(): Promise<Partial<Vehicle>[]> {
    try {
      // We'll use the ninjas API for cars data
      const response = await fetch('https://api.api-ninjas.com/v1/cars?limit=20', {
        headers: {
          'X-Api-Key': 'YOUR_API_NINJAS_KEY', // For demo, no actual API key needed
          'Content-Type': 'application/json'
        }
      });
      
      // Fallback to mock data if API fails
      if (!response.ok) {
        console.log('API request failed, using fallback data');
        return carService.getCarMockData();
      }
      
      const data: CarAPIResponse[] = await response.json();
      
      // Transform API data to our vehicle format
      return data.map((car, index) => ({
        id: `v-${index + 1}`,
        vin: `VIN${Math.floor(Math.random() * 10000000)}`,
        make: car.make,
        model: car.model,
        year: car.year,
        color: getRandomColor(),
        licensePlate: getRandomLicensePlate(),
        mileage: Math.floor(Math.random() * 100000),
        status: getRandomStatus(),
        categoryId: getCategoryIdFromType(car.type || 'sedan'),
        imageUrl: car.img_url || `https://source.unsplash.com/random/800x600/?car,${car.make},${car.model}`
      }));
    } catch (error) {
      console.error('Error fetching cars:', error);
      return carService.getCarMockData();
    }
  },
  
  // Get vehicles from Supabase
  async getVehicles(): Promise<Vehicle[]> {
    try {
      // First check if we have vehicles in Supabase
      const { data: existingVehicles, error: fetchError } = await supabase
        .from('vehicles')
        .select('*');
      
      // If we have vehicles, return them
      if (existingVehicles && existingVehicles.length > 0) {
        return existingVehicles as Vehicle[];
      }
      
      // If no vehicles exist, populate with dummy data
      const dummyVehicles = await carService.fetchCarsFromAPI();
      
      // Insert the dummy vehicles into Supabase
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert(dummyVehicles);
      
      if (insertError) {
        console.error('Error inserting vehicles:', insertError);
        throw insertError;
      }
      
      // Fetch the newly inserted vehicles
      const { data: newVehicles, error: newFetchError } = await supabase
        .from('vehicles')
        .select('*');
      
      if (newFetchError) {
        console.error('Error fetching new vehicles:', newFetchError);
        throw newFetchError;
      }
      
      return (newVehicles || []) as Vehicle[];
    } catch (error) {
      console.error('Error in getVehicles:', error);
      toast({
        title: 'Error fetching vehicles',
        description: 'Could not fetch vehicle data. Using mock data instead.',
        variant: 'destructive'
      });
      
      return carService.getCarMockData() as Vehicle[];
    }
  },
  
  // Mock data as fallback
  getCarMockData(): Partial<Vehicle>[] {
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
  },
  
  // Create a new vehicle in Supabase
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
        .select()
        .single();
      
      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },
  
  // Update an existing vehicle
  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
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
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },
  
  // Get vehicle categories
  async getVehicleCategories(): Promise<VehicleCategory[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Populate with mock categories if none exist
        await carService.populateVehicleCategories();
        
        // Fetch again
        const { data: newData, error: newError } = await supabase
          .from('vehicle_categories')
          .select('*');
        
        if (newError) throw newError;
        return (newData || []) as VehicleCategory[];
      }
      
      return data as VehicleCategory[];
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
  
  // Populate vehicle categories with mock data
  async populateVehicleCategories(): Promise<void> {
    const categories = [
      { id: 'cat-1', name: 'Economy', description: 'Small, fuel-efficient cars', baseRentalRate: 25, insuranceRate: 5 },
      { id: 'cat-2', name: 'Compact', description: 'Compact cars', baseRentalRate: 30, insuranceRate: 6 },
      { id: 'cat-3', name: 'SUV', description: 'Sport Utility Vehicles', baseRentalRate: 45, insuranceRate: 9 },
      { id: 'cat-4', name: 'Luxury', description: 'High-end luxury vehicles', baseRentalRate: 75, insuranceRate: 15 },
      { id: 'cat-5', name: 'Premium', description: 'Premium vehicles', baseRentalRate: 60, insuranceRate: 12 }
    ];
    
    try {
      const { error } = await supabase
        .from('vehicle_categories')
        .insert(categories);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error populating vehicle categories:', error);
      throw error;
    }
  }
};

// Helper functions
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
