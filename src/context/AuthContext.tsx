import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, setCurrentUser, findUserByEmail, addUser, generateId, seedData } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string, role: 'student' | 'teacher') => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const found = findUserByEmail(email);
    if (!found) return { success: false, message: 'No account found with this email' };
    if (found.password !== password) return { success: false, message: 'Incorrect password' };
    setCurrentUser(found);
    setUser(found);
    return { success: true, message: 'Login successful' };
  };

  const register = (name: string, email: string, password: string, role: 'student' | 'teacher') => {
    if (findUserByEmail(email)) return { success: false, message: 'Email already registered' };
    const newUser: User = { id: generateId(), name, email, password, role, createdAt: new Date().toISOString() };
    addUser(newUser);
    setCurrentUser(newUser);
    setUser(newUser);
    return { success: true, message: 'Registration successful' };
  };

  const logout = () => { setCurrentUser(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
