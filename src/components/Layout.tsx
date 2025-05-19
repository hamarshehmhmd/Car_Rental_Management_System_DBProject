import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Car, Calendar, Users, Settings, FileText, Wrench, CreditCard } from 'lucide-react';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ElementType;
  requiredRoles?: UserRole[];
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ path, label, icon: Icon, requiredRoles = [], collapsed }) => {
  const location = useLocation();
  const { currentRole } = useAuth();
  
  // Hide item if user doesn't have the required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(currentRole)) {
    return null;
  }
  
  const isActive = location.pathname === path;
  
  return (
    <Link to={path}>
      <div
        className={cn(
          "flex items-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="mr-2 h-5 w-5" />
        {!collapsed && <span>{label}</span>}
      </div>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut, currentRole, setCurrentRole } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Settings, requiredRoles: ['manager', 'agent', 'technician', 'accountant'] as UserRole[] },
    { path: '/customers', label: 'Customers', icon: Users, requiredRoles: ['manager', 'agent'] as UserRole[] },
    { path: '/vehicles', label: 'Vehicles', icon: Car, requiredRoles: ['manager', 'agent', 'technician'] as UserRole[] },
    { path: '/reservations', label: 'Reservations', icon: Calendar, requiredRoles: ['manager', 'agent'] as UserRole[] },
    { path: '/rentals', label: 'Rentals', icon: Car, requiredRoles: ['manager', 'agent'] as UserRole[] },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench, requiredRoles: ['manager', 'technician'] as UserRole[] },
    { path: '/invoices', label: 'Invoices', icon: FileText, requiredRoles: ['manager', 'accountant'] as UserRole[] },
    { path: '/payments', label: 'Payments', icon: CreditCard, requiredRoles: ['manager', 'accountant'] as UserRole[] },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && <h2 className="text-lg font-bold">Car Rental</h2>}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("p-1", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* User info */}
        <div className="p-4 border-b">
          {!collapsed ? (
            <>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground capitalize">{currentRole}</p>
            </>
          ) : (
            <div className="flex justify-center">
              <Badge variant="outline" className="capitalize">{currentRole.charAt(0)}</Badge>
            </div>
          )}
        </div>
        
        {/* Role selector - For demo purposes */}
        {!collapsed && (
          <div className="p-4 border-b">
            <p className="text-sm text-muted-foreground mb-2">Switch Role (Demo)</p>
            <Select
              value={currentRole}
              onValueChange={(value) => setCurrentRole(value as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="accountant">Accountant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                requiredRoles={item.requiredRoles}
                collapsed={collapsed}
              />
            ))}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t mt-auto">
          <Button variant="ghost" className="w-full" onClick={signOut}>
            {collapsed ? "Out" : "Sign Out"}
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
};

export default Layout;
