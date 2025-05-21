export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string
          createdat: string | null
          customertype: string
          dateofbirth: string
          email: string
          firstname: string
          id: string
          lastname: string
          licenseexpiry: string
          licensenumber: string
          phone: string
        }
        Insert: {
          address: string
          createdat?: string | null
          customertype: string
          dateofbirth: string
          email: string
          firstname: string
          id?: string
          lastname: string
          licenseexpiry: string
          licensenumber: string
          phone: string
        }
        Update: {
          address?: string
          createdat?: string | null
          customertype?: string
          dateofbirth?: string
          email?: string
          firstname?: string
          id?: string
          lastname?: string
          licenseexpiry?: string
          licensenumber?: string
          phone?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          basefee: number
          customerid: string | null
          damagefee: number
          duedate: string
          extramileagefee: number
          fuelfee: number
          id: string
          insurancefee: number
          invoicedate: string
          latefee: number
          rentalid: string | null
          status: string
          taxamount: number
          totalamount: number
        }
        Insert: {
          basefee: number
          customerid?: string | null
          damagefee: number
          duedate: string
          extramileagefee: number
          fuelfee: number
          id?: string
          insurancefee: number
          invoicedate: string
          latefee: number
          rentalid?: string | null
          status: string
          taxamount: number
          totalamount: number
        }
        Update: {
          basefee?: number
          customerid?: string | null
          damagefee?: number
          duedate?: string
          extramileagefee?: number
          fuelfee?: number
          id?: string
          insurancefee?: number
          invoicedate?: string
          latefee?: number
          rentalid?: string | null
          status?: string
          taxamount?: number
          totalamount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_rentalid_fkey"
            columns: ["rentalid"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          cost: number
          description: string
          id: string
          maintenancedate: string
          maintenancetype: string
          mileage: number
          status: string
          technicianid: string
          vehicleid: string | null
        }
        Insert: {
          cost: number
          description: string
          id?: string
          maintenancedate: string
          maintenancetype: string
          mileage: number
          status: string
          technicianid: string
          vehicleid?: string | null
        }
        Update: {
          cost?: number
          description?: string
          id?: string
          maintenancedate?: string
          maintenancetype?: string
          mileage?: number
          status?: string
          technicianid?: string
          vehicleid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicleid_fkey"
            columns: ["vehicleid"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          customerid: string | null
          id: string
          invoiceid: string | null
          paymentdate: string
          paymentmethod: string
          processedby: string
          status: string
          transactionreference: string
        }
        Insert: {
          amount: number
          customerid?: string | null
          id?: string
          invoiceid?: string | null
          paymentdate: string
          paymentmethod: string
          processedby: string
          status: string
          transactionreference: string
        }
        Update: {
          amount?: number
          customerid?: string | null
          id?: string
          invoiceid?: string | null
          paymentdate?: string
          paymentmethod?: string
          processedby?: string
          status?: string
          transactionreference?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoiceid_fkey"
            columns: ["invoiceid"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          actualreturndate: string | null
          checkinemployeeid: string | null
          checkoutdate: string
          checkoutemployeeid: string
          checkoutmileage: number
          customerid: string | null
          expectedreturndate: string
          id: string
          reservationid: string | null
          returnmileage: number | null
          status: string
          vehicleid: string | null
        }
        Insert: {
          actualreturndate?: string | null
          checkinemployeeid?: string | null
          checkoutdate: string
          checkoutemployeeid: string
          checkoutmileage: number
          customerid?: string | null
          expectedreturndate: string
          id?: string
          reservationid?: string | null
          returnmileage?: number | null
          status: string
          vehicleid?: string | null
        }
        Update: {
          actualreturndate?: string | null
          checkinemployeeid?: string | null
          checkoutdate?: string
          checkoutemployeeid?: string
          checkoutmileage?: number
          customerid?: string | null
          expectedreturndate?: string
          id?: string
          reservationid?: string | null
          returnmileage?: number | null
          status?: string
          vehicleid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rentals_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_reservationid_fkey"
            columns: ["reservationid"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_vehicleid_fkey"
            columns: ["vehicleid"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          categoryid: string | null
          customerid: string | null
          employeeid: string
          id: string
          pickupdate: string
          reservationdate: string
          returndate: string
          status: string
          vehicleid: string | null
        }
        Insert: {
          categoryid?: string | null
          customerid?: string | null
          employeeid: string
          id?: string
          pickupdate: string
          reservationdate: string
          returndate: string
          status: string
          vehicleid?: string | null
        }
        Update: {
          categoryid?: string | null
          customerid?: string | null
          employeeid?: string
          id?: string
          pickupdate?: string
          reservationdate?: string
          returndate?: string
          status?: string
          vehicleid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicleid_fkey"
            columns: ["vehicleid"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          firstname: string
          id: string
          lastname: string
          role: string
        }
        Insert: {
          email: string
          firstname: string
          id?: string
          lastname: string
          role: string
        }
        Update: {
          email?: string
          firstname?: string
          id?: string
          lastname?: string
          role?: string
        }
        Relationships: []
      }
      vehicle_categories: {
        Row: {
          baserentalrate: number
          description: string
          id: string
          insurancerate: number
          name: string
        }
        Insert: {
          baserentalrate: number
          description: string
          id?: string
          insurancerate: number
          name: string
        }
        Update: {
          baserentalrate?: number
          description?: string
          id?: string
          insurancerate?: number
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          categoryid: string | null
          color: string
          id: string
          imageurl: string | null
          licenseplate: string
          make: string
          mileage: number
          model: string
          status: string
          vin: string
          year: number
        }
        Insert: {
          categoryid?: string | null
          color: string
          id?: string
          imageurl?: string | null
          licenseplate: string
          make: string
          mileage: number
          model: string
          status: string
          vin: string
          year: number
        }
        Update: {
          categoryid?: string | null
          color?: string
          id?: string
          imageurl?: string | null
          licenseplate?: string
          make?: string
          mileage?: number
          model?: string
          status?: string
          vin?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_categoryid_fkey"
            columns: ["categoryid"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
