
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'vehicle' | 'reservation' | 'rental' | 'maintenance' | 'invoice' | 'payment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  // Define color mappings for each status type
  const colorMap: Record<string, { bg: string; text: string }> = {
    // Vehicle statuses
    available: { bg: 'bg-status-available/20 border-status-available', text: 'text-status-available' },
    rented: { bg: 'bg-status-rented/20 border-status-rented', text: 'text-status-rented' },
    maintenance: { bg: 'bg-status-maintenance/20 border-status-maintenance', text: 'text-status-maintenance' },
    reserved: { bg: 'bg-status-reserved/20 border-status-reserved', text: 'text-status-reserved' },
    
    // Reservation statuses
    pending: { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-700' },
    confirmed: { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-700' },
    cancelled: { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-700' },
    completed: { bg: 'bg-green-100 border-green-400', text: 'text-green-700' },
    
    // Rental statuses
    active: { bg: 'bg-green-100 border-green-400', text: 'text-green-700' },
    overdue_rental: { bg: 'bg-red-100 border-red-400', text: 'text-red-700' },
    
    // Maintenance statuses
    'in-progress': { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-700' },
    scheduled: { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-700' },
    
    // Invoice statuses
    draft: { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-700' },
    issued: { bg: 'bg-blue-100 border-blue-400', text: 'text-blue-700' },
    paid: { bg: 'bg-green-100 border-green-400', text: 'text-green-700' },
    overdue_invoice: { bg: 'bg-red-100 border-red-400', text: 'text-red-700' },
    
    // Payment statuses
    pending_payment: { bg: 'bg-yellow-100 border-yellow-400', text: 'text-yellow-700' },
    failed: { bg: 'bg-red-100 border-red-400', text: 'text-red-700' },
    refunded: { bg: 'bg-purple-100 border-purple-400', text: 'text-purple-700' },
  };
  
  const statusLower = status.toLowerCase();
  
  // Adjust status key based on context to avoid duplicate keys
  let statusKey = statusLower;
  if (statusLower === 'overdue') {
    if (type === 'rental') {
      statusKey = 'overdue_rental';
    } else if (type === 'invoice') {
      statusKey = 'overdue_invoice';
    }
  } else if (statusLower === 'pending') {
    if (type === 'payment') {
      statusKey = 'pending_payment';
    }
  }
  
  const colors = colorMap[statusKey] || { bg: 'bg-gray-100 border-gray-400', text: 'text-gray-700' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        colors.bg, 
        colors.text,
        'border font-medium capitalize'
      )}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
