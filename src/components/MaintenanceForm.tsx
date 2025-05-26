
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaintenanceRecord, Vehicle } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { maintenanceService } from '@/services/maintenanceService';
import { supabaseService } from '@/services/supabaseService';

// Define the form schema
const maintenanceFormSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  maintenanceType: z.string().min(1, 'Maintenance type is required'),
  description: z.string().min(1, 'Description is required'),
  technicianId: z.string().min(1, 'Technician is required'),
  maintenanceDate: z.string().min(1, 'Maintenance date is required'),
  mileage: z.number().int().min(0, 'Mileage must be at least 0'),
  cost: z.number().min(0, 'Cost must be at least 0'),
  status: z.enum(['scheduled', 'in-progress', 'completed']),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  record?: MaintenanceRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  record,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = !!record;
  
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: record ? {
      vehicleId: record.vehicleId,
      maintenanceType: record.maintenanceType,
      description: record.description,
      technicianId: record.technicianId,
      maintenanceDate: record.maintenanceDate.split('T')[0], // Convert to YYYY-MM-DD
      mileage: record.mileage,
      cost: record.cost,
      status: record.status,
    } : {
      vehicleId: '',
      maintenanceType: '',
      description: '',
      technicianId: '',
      maintenanceDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      cost: 0,
      status: 'scheduled',
    },
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await supabaseService.getFromTable('vehicles');
        setVehicles(vehicleData);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    if (open) {
      fetchVehicles();
    }
  }, [open]);

  const handleSubmit = async (data: MaintenanceFormValues) => {
    setLoading(true);
    try {
      if (isEditing && record) {
        await maintenanceService.updateMaintenanceRecord(record.id, {
          vehicleId: data.vehicleId,
          maintenanceType: data.maintenanceType,
          description: data.description,
          technicianId: data.technicianId,
          maintenanceDate: data.maintenanceDate,
          mileage: data.mileage,
          cost: data.cost,
          status: data.status,
        });
        toast({
          title: 'Maintenance Record Updated',
          description: 'The maintenance record has been updated successfully.',
        });
      } else {
        await maintenanceService.createMaintenanceRecord({
          vehicleId: data.vehicleId,
          maintenanceType: data.maintenanceType,
          description: data.description,
          technicianId: data.technicianId,
          maintenanceDate: data.maintenanceDate,
          mileage: data.mileage,
          cost: data.cost,
          status: data.status,
        });
        toast({
          title: 'Maintenance Record Created',
          description: 'The maintenance record has been created successfully.',
        });
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving the maintenance record.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditing} // Cannot change vehicle if editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maintenanceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Oil Change">Oil Change</SelectItem>
                      <SelectItem value="Tire Replacement">Tire Replacement</SelectItem>
                      <SelectItem value="Brake Service">Brake Service</SelectItem>
                      <SelectItem value="Regular Service">Regular Service</SelectItem>
                      <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                      <SelectItem value="Body Work">Body Work</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the maintenance work..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Technician ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maintenanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mileage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceForm;
