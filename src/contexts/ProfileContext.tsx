import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from './AuthContext';
import { logger } from '@/lib/logger';

export interface PersonProfile {
  id: string;
  user_id: string;
  name: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  personProfiles: PersonProfile[];
  activeProfileId: string | null;
  activeProfile: PersonProfile | null;
  setActiveProfileId: (id: string | null) => void;
  createProfile: (name: string, birthDate?: string) => Promise<PersonProfile | null>;
  updateProfile: (id: string, name: string, birthDate?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  loadProfiles: () => Promise<void>;
  loading: boolean;
  canAddProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [personProfiles, setPersonProfiles] = useState<PersonProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxProfiles = profile?.max_profiles || 1;
  const canAddProfile = personProfiles.length < maxProfiles;

  const loadProfiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('person_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPersonProfiles(data || []);
      
      // Set first profile as active if none selected
      if (data && data.length > 0 && !activeProfileId) {
        setActiveProfileId(data[0].id);
      }
    } catch (error) {
      logger.error('Error loading person profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (name: string, birthDate?: string): Promise<PersonProfile | null> => {
    if (!user || !canAddProfile) return null;

    try {
      const { data, error } = await supabase
        .from('person_profiles')
        .insert({
          user_id: user.id,
          name,
          birth_date: birthDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      setPersonProfiles(prev => [...prev, data]);
      
      // If this is the first profile, set it as active
      if (personProfiles.length === 0) {
        setActiveProfileId(data.id);
      }
      
      return data;
    } catch (error) {
      logger.error('Error creating person profile:', error);
      return null;
    }
  };

  const updateProfile = async (id: string, name: string, birthDate?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('person_profiles')
        .update({
          name,
          birth_date: birthDate || null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonProfiles(prev => 
        prev.map(p => p.id === id ? { ...p, name, birth_date: birthDate || null } : p)
      );
    } catch (error) {
      logger.error('Error updating person profile:', error);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('person_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonProfiles(prev => prev.filter(p => p.id !== id));
      
      // If deleted profile was active, switch to first available
      if (activeProfileId === id) {
        const remaining = personProfiles.filter(p => p.id !== id);
        setActiveProfileId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      logger.error('Error deleting person profile:', error);
    }
  };

  const activeProfile = personProfiles.find(p => p.id === activeProfileId) || null;

  // Load profiles when user/profile changes
  useEffect(() => {
    if (user && profile?.has_paid) {
      loadProfiles();
    } else {
      setPersonProfiles([]);
      setActiveProfileId(null);
    }
  }, [user, profile?.has_paid]);

  // NOTE: Automatic profile creation has been removed.
  // The ProfileSetupWizard now handles profile creation after payment.
  // This prevents the race condition where a default profile was created
  // before the user could set up all their purchased profiles.

  return (
    <ProfileContext.Provider value={{
      personProfiles,
      activeProfileId,
      activeProfile,
      setActiveProfileId,
      createProfile,
      updateProfile,
      deleteProfile,
      loadProfiles,
      loading,
      canAddProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};
