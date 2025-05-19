
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import supabase from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('manager');
  const { toast } = useToast();

  // Simulate authentication for demonstration
  // In a real app, this would connect to Supabase Auth
  useEffect(() => {
    // Mock user for demonstration purposes
    const mockUser: User = {
      id: '1',
      email: 'admin@carrentals.com',
      role: 'manager',
      firstName: 'Admin',
      lastName: 'User'
    };
    
    setUser(mockUser);
    setLoading(false);
    
    // In a real implementation using Supabase:
    /*
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // Fetch user profile data from Supabase
          const { data, error: profileError } = await supabase
            .from('employees')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) throw profileError;
          
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName
          });
        }
      } catch (error) {
        console.error('Error checking user:', error);
        toast({
          title: "Authentication error",
          description: "There was an error checking your authentication status.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Handle user sign in
          // Similar to above, fetch user profile and set user state
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
    */
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real implementation with Supabase:
      /*
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      */
      
      // For demonstration purposes:
      if (email === 'admin@carrentals.com' && password === 'password') {
        setUser({
          id: '1',
          email: 'admin@carrentals.com',
          role: 'manager',
          firstName: 'Admin',
          lastName: 'User'
        });
      } else {
        throw new Error('Invalid credentials');
      }
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // In a real implementation with Supabase:
      // await supabase.auth.signOut();
      
      // For demonstration:
      setUser(null);
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        currentRole,
        setCurrentRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
