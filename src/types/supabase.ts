
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          firstName: string
          lastName: string
          email: string
          phone: string
          address: string
          dateOfBirth: string
          licenseNumber: string
          licenseExpiry: string
          customerType: string
          createdAt: string
        }
        Insert: {
          id?: string
          firstName: string
          lastName: string
          email: string
          phone: string
          address: string
          dateOfBirth: string
          licenseNumber: string
          licenseExpiry: string
          customerType: string
          createdAt?: string
        }
        Update: {
          id?: string
          firstName?: string
          lastName?: string
          email?: string
          phone?: string
          address?: string
          dateOfBirth?: string
          licenseNumber?: string
          licenseExpiry?: string
          customerType?: string
          createdAt?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vin: string
          make: string
          model: string
          year: number
          color: string
          licensePlate: string
          mileage: number
          status: string
          categoryId: string
          imageUrl?: string
        }
        Insert: {
          id?: string
          vin: string
          make: string
          model: string
          year: number
          color: string
          licensePlate: string
          mileage: number
          status: string
          categoryId: string
          imageUrl?: string
        }
        Update: {
          id?: string
          vin?: string
          make?: string
          model?: string
          year?: number
          color?: string
          licensePlate?: string
          mileage?: number
          status?: string
          categoryId?: string
          imageUrl?: string
        }
      }
      vehicle_categories: {
        Row: {
          id: string
          name: string
          description: string
          baseRentalRate: number
          insuranceRate: number
        }
        Insert: {
          id?: string
          name: string
          description: string
          baseRentalRate: number
          insuranceRate: number
        }
        Update: {
          id?: string
          name?: string
          description?: string
          baseRentalRate?: number
          insuranceRate?: number
        }
      }
      reservations: {
        Row: {
          id: string
          customerId: string
          categoryId: string
          vehicleId: string | null
          reservationDate: string
          pickupDate: string
          returnDate: string
          status: string
          employeeId: string
        }
        Insert: {
          id?: string
          customerId: string
          categoryId: string
          vehicleId?: string | null
          reservationDate: string
          pickupDate: string
          returnDate: string
          status: string
          employeeId: string
        }
        Update: {
          id?: string
          customerId?: string
          categoryId?: string
          vehicleId?: string | null
          reservationDate?: string
          pickupDate?: string
          returnDate?: string
          status?: string
          employeeId?: string
        }
      }
      rentals: {
        Row: {
          id: string
          reservationId: string
          customerId: string
          vehicleId: string
          checkoutEmployeeId: string
          checkinEmployeeId?: string
          checkoutDate: string
          expectedReturnDate: string
          actualReturnDate?: string
          checkoutMileage: number
          returnMileage?: number
          status: string
        }
        Insert: {
          id?: string
          reservationId: string
          customerId: string
          vehicleId: string
          checkoutEmployeeId: string
          checkinEmployeeId?: string
          checkoutDate: string
          expectedReturnDate: string
          actualReturnDate?: string
          checkoutMileage: number
          returnMileage?: number
          status: string
        }
        Update: {
          id?: string
          reservationId?: string
          customerId?: string
          vehicleId?: string
          checkoutEmployeeId?: string
          checkinEmployeeId?: string
          checkoutDate?: string
          expectedReturnDate?: string
          actualReturnDate?: string
          checkoutMileage?: number
          returnMileage?: number
          status?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          vehicleId: string
          maintenanceType: string
          description: string
          technicianId: string
          maintenanceDate: string
          mileage: number
          cost: number
          status: string
        }
        Insert: {
          id?: string
          vehicleId: string
          maintenanceType: string
          description: string
          technicianId: string
          maintenanceDate: string
          mileage: number
          cost: number
          status: string
        }
        Update: {
          id?: string
          vehicleId?: string
          maintenanceType?: string
          description?: string
          technicianId?: string
          maintenanceDate?: string
          mileage?: number
          cost?: number
          status?: string
        }
      }
      invoices: {
        Row: {
          id: string
          rentalId: string
          customerId: string
          invoiceDate: string
          dueDate: string
          baseFee: number
          insuranceFee: number
          extraMileageFee: number
          fuelFee: number
          damageFee: number
          lateFee: number
          taxAmount: number
          totalAmount: number
          status: string
        }
        Insert: {
          id?: string
          rentalId: string
          customerId: string
          invoiceDate: string
          dueDate: string
          baseFee: number
          insuranceFee: number
          extraMileageFee: number
          fuelFee: number
          damageFee: number
          lateFee: number
          taxAmount: number
          totalAmount: number
          status: string
        }
        Update: {
          id?: string
          rentalId?: string
          customerId?: string
          invoiceDate?: string
          dueDate?: string
          baseFee?: number
          insuranceFee?: number
          extraMileageFee?: number
          fuelFee?: number
          damageFee?: number
          lateFee?: number
          taxAmount?: number
          totalAmount?: number
          status?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoiceId: string
          customerId: string
          paymentDate: string
          amount: number
          paymentMethod: string
          transactionReference: string
          status: string
          processedBy: string
        }
        Insert: {
          id?: string
          invoiceId: string
          customerId: string
          paymentDate: string
          amount: number
          paymentMethod: string
          transactionReference: string
          status: string
          processedBy: string
        }
        Update: {
          id?: string
          invoiceId?: string
          customerId?: string
          paymentDate?: string
          amount?: number
          paymentMethod?: string
          transactionReference?: string
          status?: string
          processedBy?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
