import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'atltv_client_auth';
const LOCAL_USERS_KEY = 'atltv_local_users';
const LOCAL_JOBS_KEY = 'atltv_local_jobs';

function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalUser(user) {
  const users = getLocalUsers();
  users.push(user);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getLocalJobs() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_JOBS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveLocalJob(job) {
  const jobs = getLocalJobs();
  jobs.push(job);
  localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
  return job;
}

export function updateLocalJob(id, updates) {
  const jobs = getLocalJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx !== -1) {
    jobs[idx] = { ...jobs[idx], ...updates };
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
    return jobs[idx];
  }
  return null;
}

export const ClientAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('clients').authWithPassword(email, password);
      const u = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.Name || authData.record.email,
        role: authData.record.Role || 'customer',
        type: authData.record.Type || 'customer',
        phone: authData.record.Phone_Number || '',
        token: authData.token,
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      toast.success('Signed in successfully.');
      return u;
    } catch (err) {
      const localUsers = getLocalUsers();
      const found = localUsers.find((u) => u.email === email && u.password === password);
      if (found) {
        const u = { ...found };
        delete u.password;
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        toast.success('Signed in successfully.');
        return u;
      }
      throw new Error('Invalid email or password.');
    }
  };

  const signup = async ({ email, password, name, phone, type }) => {
    const role = type === 'tech' ? 'technician' : 'customer';
    try {
      const record = await pb.collection('clients').create({
        email,
        password,
        passwordConfirm: password,
        Name: name,
        Phone_Number: phone,
        Role: role,
        Type: role,
      });
      const authData = await pb.collection('clients').authWithPassword(email, password);
      const u = {
        id: record.id,
        email: authData.record.email,
        name: authData.record.Name || name,
        role: authData.record.Role || role,
        type: authData.record.Type || role,
        phone: authData.record.Phone_Number || phone || '',
        token: authData.token,
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      toast.success('Account created successfully.');
      return u;
    } catch (err) {
      const localUsers = getLocalUsers();
      if (localUsers.some((u) => u.email === email)) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = {
        id: 'local_' + Math.random().toString(36).substr(2, 9),
        email,
        password,
        name,
        role,
        type: role,
        phone: phone || '',
        created: new Date().toISOString(),
      };
      saveLocalUser(newUser);
      const u = { ...newUser };
      delete u.password;
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      toast.success('Account created locally (demo mode).');
      return u;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    pb.authStore.clear();
    toast.success('Signed out.');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isTech: user?.role === 'technician',
    login,
    signup,
    logout,
    loading,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};
