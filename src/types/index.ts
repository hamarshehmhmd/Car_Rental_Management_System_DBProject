
// Define all the data types for our application

export type UserRole = 'manager' | 'agent' | 'technician' | 'accountant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseExpiry: string;
  customerType: string;
  createdAt: string;
}

export interface VehicleCategory {
  id: string;
  name: string;
  description: string;
  baseRentalRate: number;
  insuranceRate: number;
}

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
  status: VehicleStatus;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  customerId: string;
  categoryId: string;
  vehicleId: string | null;
  reservationDate: string;
  pickupDate: string;
  returnDate: string;
  status: ReservationStatus;
  employeeId: string;
  customerName?: string;
  vehicleInfo?: string;
  categoryName?: string;
}

export type RentalStatus = 'active' | 'completed' | 'overdue' | 'cancelled';

export interface Rental {
  id: string;
  reservationId: string;
  customerId: string;
  vehicleId: string;
  checkoutEmployeeId: string;
  checkinEmployeeId?: string;
  checkoutDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  checkoutMileage: number;
  returnMileage?: number;
  status: RentalStatus;
  customerName?: string;
  vehicleInfo?: string;
}

export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceType: string;
  description: string;
  technicianId: string;
  maintenanceDate: string;
  mileage: number;
  cost: number;
  status: MaintenanceStatus;
  vehicleInfo?: string;
  technicianName?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  rentalId: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  baseFee: number;
  insuranceFee: number;
  extraMileageFee: number;
  fuelFee: number;
  damageFee: number;
  lateFee: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  customerName?: string;
  rentalInfo?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit' | 'debit' | 'cash' | 'bank_transfer';

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: PaymentStatus;
  processedBy: string;
  customerName?: string;
  invoiceInfo?: string;
}

export interface DashboardSummary {
  activeRentals: number;
  upcomingReservations: number;
  vehiclesInMaintenance: number;
  availableVehicles: number;
  todayRevenue: number;
  monthRevenue: number;
}

