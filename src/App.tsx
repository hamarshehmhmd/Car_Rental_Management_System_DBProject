
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Vehicles from "@/pages/Vehicles";
import Reservations from "@/pages/Reservations";
import Rentals from "@/pages/Rentals";
import Maintenance from "@/pages/Maintenance";
import Invoices from "@/pages/Invoices";
import Payments from "@/pages/Payments";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      {/* Dashboard Route */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Main Application Routes */}
      <Route path="/customers" element={
        <ProtectedRoute>
          <Layout>
            <Customers />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/vehicles" element={
        <ProtectedRoute>
          <Layout>
            <Vehicles />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reservations" element={
        <ProtectedRoute>
          <Layout>
            <Reservations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/rentals" element={
        <ProtectedRoute>
          <Layout>
            <Rentals />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Layout>
            <Maintenance />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <Invoices />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/payments" element={
        <ProtectedRoute>
          <Layout>
            <Payments />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
