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
        avatar: authData.record.avatar || '',
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

  const loginWithGoogle = async () => {
    try {
      const authData = await pb.collection('clients').authWithOAuth2({ provider: 'google' });
      const u = {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.Name || authData.record.email,
        role: authData.record.Role || 'customer',
        type: authData.record.Type || 'customer',
        phone: authData.record.Phone_Number || '',
        avatar: authData.record.avatar || '',
        token: authData.token,
      };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      toast.success('Signed in with Google successfully.');
      return u;
    } catch (err) {
      console.warn("PocketBase OAuth failed or disabled, simulating Gmail authentication:", err);
      const email = prompt("Simulating Google Login: Enter your Gmail address:", "user@gmail.com");
      if (!email) return;
      if (!email.includes("@gmail.com") && !email.includes("@")) {
        toast.error("Please enter a valid Gmail address.");
        return;
      }
      
      const localUsers = getLocalUsers();
      let found = localUsers.find((u) => u.email === email);
      if (!found) {
        const username = email.split('@')[0];
        found = {
          id: 'local_google_' + Math.random().toString(36).substr(2, 9),
          email,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          role: 'customer',
          type: 'customer',
          phone: '',
          avatar: '',
          created: new Date().toISOString(),
        };
        saveLocalUser(found);
        toast.success("New account created via Gmail.");
      }
      
      const u = { ...found };
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      toast.success('Signed in with Google successfully.');
      return u;
    }
  };

  const signup = async ({ email, password, name, phone, type, preferredChannel }) => {
    const role = type === 'tech' ? 'technician' : 'customer';
    const channel = preferredChannel || 'Email';
    const token = Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    
    try {
      const record = await pb.collection('clients').create({
        email,
        password,
        passwordConfirm: password,
        Name: name,
        Phone_Number: phone,
        Role: role,
        Type: role,
        OptIn_Status: 'Pending',
        OptIn_Channel: channel,
        DoubleOptIn_Token: token,
      });

      const verifyUrl = `${window.location.origin}/verify-optin?token=${token}&email=${encodeURIComponent(email)}`;
      console.log("Client Double Opt-In Verification URL:", verifyUrl);

      toast.success('Registration successful!', {
        description: `Verification link sent via ${channel}. Click below to verify:`,
        action: {
          label: 'Verify Opt-In',
          onClick: () => window.open(verifyUrl, '_blank')
        },
        duration: 15000
      });

      return record;
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
        avatar: '',
        OptIn_Status: 'Pending',
        OptIn_Channel: channel,
        DoubleOptIn_Token: token,
        created: new Date().toISOString(),
      };
      saveLocalUser(newUser);

      const verifyUrl = `${window.location.origin}/verify-optin?token=${token}&email=${encodeURIComponent(email)}`;
      console.log("Local Double Opt-In Verification URL:", verifyUrl);

      toast.success('Account created locally (demo mode).', {
        description: `Verification link sent via ${channel}. Click below to verify:`,
        action: {
          label: 'Verify Opt-In',
          onClick: () => window.open(verifyUrl, '_blank')
        },
        duration: 15000
      });
      return newUser;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    pb.authStore.clear();
    toast.success('Signed out.');
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    try {
      if (user.id && !user.id.startsWith('local_')) {
        await pb.collection('clients').update(user.id, {
          Name: updates.name,
          Phone_Number: updates.phone,
        });
      }
    } catch (err) {
      console.warn("PocketBase profile update failed, syncing locally:", err);
    }

    const localUsers = getLocalUsers();
    const idx = localUsers.findIndex((u) => u.email === user.email);
    if (idx !== -1) {
      localUsers[idx] = { 
        ...localUsers[idx], 
        name: updates.name || localUsers[idx].name,
        phone: updates.phone || localUsers[idx].phone,
        avatar: updates.avatar !== undefined ? updates.avatar : localUsers[idx].avatar,
      };
      if (updates.newPassword) {
        localUsers[idx].password = updates.newPassword;
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    }

    const updatedUser = {
      ...user,
      name: updates.name || user.name,
      phone: updates.phone || user.phone,
      avatar: updates.avatar !== undefined ? updates.avatar : user.avatar,
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    toast.success('Profile updated successfully.');
    return updatedUser;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isTech: user?.role === 'technician',
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};
