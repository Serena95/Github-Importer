import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, Tenant } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  tenant: Tenant | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Try to find which tenant this user belongs to
        // In a real SaaS, you might have a global users_to_tenants mapping
        // For this demo, we'll assume the user's first login creates a tenant or they are invited
        // We'll look for a profile in a generic 'users' collection first to find their tenantId
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as UserProfile;
          setProfile(profileData);
          
          // Fetch tenant data
          const tenantRef = doc(db, 'tenants', profileData.tenantId);
          const tenantSnap = await getDoc(tenantRef);
          if (tenantSnap.exists()) {
            setTenant(tenantSnap.data() as Tenant);
          }
        } else {
          // New user logic: Create a default tenant for them
          const newTenantId = `tenant_${firebaseUser.uid}`;
          const newTenant: Tenant = {
            id: newTenantId,
            name: `${firebaseUser.displayName || 'My Company'}'s Workspace`,
            createdAt: new Date().toISOString(),
            plan: 'enterprise'
          };
          
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            tenantId: newTenantId,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'New User',
            role: 'admin',
            photoURL: firebaseUser.photoURL || '',
            status: 'active'
          };

          // Create profile first so security rules can verify tenant membership
          await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
          await setDoc(doc(db, 'tenants', newTenantId), newTenant);
          await setDoc(doc(db, 'tenants', newTenantId, 'users', firebaseUser.uid), newProfile);

          // Initialize some mock data for the new tenant
          const dealsCol = collection(db, 'tenants', newTenantId, 'deals');
          await addDoc(dealsCol, {
            tenantId: newTenantId,
            title: 'Enterprise Cloud Migration',
            pipelineId: 'default',
            stageId: 'negotiation',
            value: 45000,
            probability: 75,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          await addDoc(dealsCol, {
            tenantId: newTenantId,
            title: 'SaaS Subscription Renewal',
            pipelineId: 'default',
            stageId: 'proposal',
            value: 12000,
            probability: 90,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          const tasksCol = collection(db, 'tenants', newTenantId, 'tasks');
          await addDoc(tasksCol, {
            tenantId: newTenantId,
            title: 'Follow up with Microsoft',
            description: 'Discuss the new license agreement',
            status: 'todo',
            priority: 'high',
            creatorId: firebaseUser.uid,
            createdAt: serverTimestamp()
          });
          await addDoc(tasksCol, {
            tenantId: newTenantId,
            title: 'Prepare quarterly report',
            description: 'Gather data from all departments',
            status: 'in-progress',
            priority: 'medium',
            creatorId: firebaseUser.uid,
            createdAt: serverTimestamp()
          });

          setProfile(newProfile);
          setTenant(newTenant);
        }
      } else {
        setProfile(null);
        setTenant(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, tenant, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
