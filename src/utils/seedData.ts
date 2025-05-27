import { supabase } from '@/integrations/supabase/client';

export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Check if data already exists
    const { data: existingVehicles } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1);
    
    if (existingVehicles && existingVehicles.length > 0) {
      console.log('📊 Database already has data, skipping seeding...');
      return true;
    }
    
    // 1. First, create vehicle categories
    console.log('📋 Creating vehicle categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('vehicle_categories')
      .upsert([
        {
          id: 'cat-1',
          name: 'Economy',
          description: 'Small, fuel-efficient cars',
          baserentalrate: 25,
          insurancerate: 5
        },
        {
          id: 'cat-2',
          name: 'Compact',
          description: 'Compact cars',
          baserentalrate: 30,
          insurancerate: 6
        },
        {
          id: 'cat-3',
          name: 'SUV',
          description: 'Sport Utility Vehicles',
          baserentalrate: 45,
          insurancerate: 9
        },
        {
          id: 'cat-4',
          name: 'Luxury',
          description: 'High-end luxury vehicles',
          baserentalrate: 75,
          insurancerate: 15
        },
        {
          id: 'cat-5',
          name: 'Premium',
          description: 'Premium vehicles',
          baserentalrate: 60,
          insurancerate: 12
        }
      ], { onConflict: 'id' })
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ Created ${categories?.length || 0} vehicle categories`);

    // 2. Create sample vehicles
    console.log('🚗 Creating vehicles...');
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .upsert([
        {
          id: 'v-1',
          vin: 'VIN12345678',
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          color: 'Silver',
          licenseplate: 'ABC123',
          mileage: 15600,
          status: 'available',
          categoryid: 'cat-2'
        },
        {
          id: 'v-2',
          vin: 'VIN87654321',
          make: 'Honda',
          model: 'CR-V',
          year: 2023,
          color: 'Blue',
          licenseplate: 'XYZ789',
          mileage: 8200,
          status: 'available',
          categoryid: 'cat-3'
        },
        {
          id: 'v-3',
          vin: 'VIN11223344',
          make: 'Ford',
          model: 'Mustang',
          year: 2021,
          color: 'Red',
          licenseplate: 'MUS001',
          mileage: 20300,
          status: 'maintenance',
          categoryid: 'cat-4'
        },
        {
          id: 'v-4',
          vin: 'VIN55667788',
          make: 'Chevrolet',
          model: 'Equinox',
          year: 2022,
          color: 'White',
          licenseplate: 'EQX234',
          mileage: 12400,
          status: 'rented',
          categoryid: 'cat-3'
        },
        {
          id: 'v-5',
          vin: 'VIN99001122',
          make: 'BMW',
          model: '3 Series',
          year: 2023,
          color: 'Black',
          licenseplate: 'BMW456',
          mileage: 5600,
          status: 'available',
          categoryid: 'cat-5'
        },
        {
          id: 'v-6',
          vin: 'VIN33445566',
          make: 'Audi',
          model: 'A4',
          year: 2022,
          color: 'Gray',
          licenseplate: 'AUD789',
          mileage: 18500,
          status: 'maintenance',
          categoryid: 'cat-5'
        }
      ], { onConflict: 'id' })
      .select();

    if (vehiclesError) throw vehiclesError;
    console.log(`✅ Created ${vehicles?.length || 0} vehicles`);

    // 3. Create sample customers
    console.log('👥 Creating customers...');
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .upsert([
        {
          id: 'cust-1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0101',
          address: '123 Main St, City, State 12345',
          dateofbirth: '1985-06-15',
          licensenumber: 'DL123456789',
          licenseexpiry: '2025-06-15',
          customertype: 'individual'
        },
        {
          id: 'cust-2',
          firstname: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0102',
          address: '456 Oak Ave, City, State 12345',
          dateofbirth: '1990-03-22',
          licensenumber: 'DL987654321',
          licenseexpiry: '2026-03-22',
          customertype: 'individual'
        },
        {
          id: 'cust-3',
          firstname: 'Bob',
          lastname: 'Johnson',
          email: 'bob.johnson@email.com',
          phone: '+1-555-0103',
          address: '789 Pine St, City, State 12345',
          dateofbirth: '1982-11-08',
          licensenumber: 'DL456789123',
          licenseexpiry: '2025-11-08',
          customertype: 'corporate'
        }
      ], { onConflict: 'id' })
      .select();

    if (customersError) throw customersError;
    console.log(`✅ Created ${customers?.length || 0} customers`);

    // 4. Create a system user for operations
    console.log('👤 Creating system user...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert([
        {
          id: 'user-1',
          firstname: 'System',
          lastname: 'Admin',
          email: 'admin@system.com',
          role: 'manager'
        }
      ], { onConflict: 'id' })
      .select();

    if (usersError) throw usersError;
    console.log(`✅ Created ${users?.length || 0} system users`);

    // 5. Create sample reservations
    console.log('📅 Creating reservations...');
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .upsert([
        {
          id: 'res-1',
          customerid: 'cust-1',
          categoryid: 'cat-2',
          vehicleid: 'v-1',
          employeeid: 'user-1',
          reservationdate: new Date().toISOString(),
          pickupdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          returndate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
          status: 'confirmed'
        },
        {
          id: 'res-2',
          customerid: 'cust-2',
          categoryid: 'cat-3',
          vehicleid: 'v-2',
          employeeid: 'user-1',
          reservationdate: new Date().toISOString(),
          pickupdate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          returndate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          status: 'confirmed'
        }
      ], { onConflict: 'id' })
      .select();

    if (reservationsError) throw reservationsError;
    console.log(`✅ Created ${reservations?.length || 0} reservations`);

    // 6. Create sample rentals
    console.log('🚙 Creating rentals...');
    const { data: rentals, error: rentalsError } = await supabase
      .from('rentals')
      .upsert([
        {
          id: 'rent-1',
          reservationid: 'res-1',
          customerid: 'cust-1',
          vehicleid: 'v-4', // The Equinox that's marked as rented
          checkoutemployeeid: 'user-1',
          checkoutdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          expectedreturndate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          checkoutmileage: 12000,
          status: 'active'
        }
      ], { onConflict: 'id' })
      .select();

    if (rentalsError) throw rentalsError;
    console.log(`✅ Created ${rentals?.length || 0} rentals`);

    // 7. Create sample invoices
    console.log('🧾 Creating invoices...');
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .upsert([
        {
          id: 'inv-1',
          rentalid: 'rent-1',
          customerid: 'cust-1',
          invoicedate: new Date().toISOString(),
          duedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          basefee: 300.00,
          insurancefee: 50.00,
          fuelfee: 0.00,
          extramileagefee: 0.00,
          damagefee: 0.00,
          latefee: 0.00,
          taxamount: 35.00,
          totalamount: 385.00,
          status: 'pending'
        }
      ], { onConflict: 'id' })
      .select();

    if (invoicesError) throw invoicesError;
    console.log(`✅ Created ${invoices?.length || 0} invoices`);

    // 8. Create sample payments
    console.log('💳 Creating payments...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .upsert([
        {
          id: 'pay-1',
          invoiceid: 'inv-1',
          customerid: 'cust-1',
          paymentdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          amount: 385.00,
          paymentmethod: 'credit_card',
          processedby: 'user-1',
          transactionreference: 'TXN-001-2024',
          status: 'completed'
        },
        {
          id: 'pay-2',
          invoiceid: 'inv-1',
          customerid: 'cust-1',
          paymentdate: new Date().toISOString(), // Today
          amount: 150.00,
          paymentmethod: 'credit_card',
          processedby: 'user-1',
          transactionreference: 'TXN-002-2024',
          status: 'completed'
        }
      ], { onConflict: 'id' })
      .select();

    if (paymentsError) throw paymentsError;
    console.log(`✅ Created ${payments?.length || 0} payments`);

    // 9. Create sample maintenance records
    console.log('🔧 Creating maintenance records...');
    const { data: maintenanceRecords, error: maintenanceError } = await supabase
      .from('maintenance_records')
      .upsert([
        {
          id: 'maint-1',
          vehicleid: 'v-3', // Ford Mustang that's marked as in maintenance
          maintenancetype: 'Oil Change',
          description: 'Regular oil change and filter replacement',
          technicianid: 'user-1',
          maintenancedate: new Date().toISOString(),
          mileage: 20300,
          cost: 75.00,
          status: 'in-progress'
        },
        {
          id: 'maint-2',
          vehicleid: 'v-3', // Same vehicle, different maintenance
          maintenancetype: 'Brake Inspection',
          description: 'Routine brake system inspection and pad replacement',
          technicianid: 'user-1',
          maintenancedate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          mileage: 20250,
          cost: 150.00,
          status: 'completed'
        },
        {
          id: 'maint-3',
          vehicleid: 'v-6', // Audi A4 that's marked as in maintenance
          maintenancetype: 'Transmission Service',
          description: 'Transmission fluid change and filter replacement',
          technicianid: 'user-1',
          maintenancedate: new Date().toISOString(),
          mileage: 18500,
          cost: 200.00,
          status: 'scheduled'
        }
      ], { onConflict: 'id' })
      .select();

    if (maintenanceError) throw maintenanceError;
    console.log(`✅ Created ${maintenanceRecords?.length || 0} maintenance records`);

    console.log('🎉 Database seeding completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return false;
  }
}; 