import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from './AuthContext';
import { useProfiles } from './ProfileContext';
import { useEncryption } from './EncryptionContext';
import { Json } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  notes: string;
}

export interface PersonalData {
  fullName: string;
  birthDate: string;
  address: string;
  phone: string;
  trustedPerson1: string;
  trustedPerson1Phone: string;
  trustedPerson2: string;
  trustedPerson2Phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medications: Medication[];
  notes: string;
}

export interface AssetsData {
  bankAccounts: Array<{ institute: string; purpose: string; balance: string }>;
  properties: Array<{ 
    address: string; 
    type: string; 
    ownership: string; 
    ownershipOther: string;
    rentalIncome: string;
    financingStatus: string;
    outstandingLoan: string;
  }>;
  insurances: Array<{ type: string; typeOther: string; company: string; companyOther: string; policyNumber: string; surrenderValue: string }>;
  valuables: Array<{ description: string; location: string }>;
  notes: string;
}

export interface DigitalData {
  emailAccounts: Array<{ provider: string; email: string; accessInfo: string }>;
  socialMedia: Array<{ platform: string; username: string; accessInfo: string }>;
  subscriptions: Array<{ service: string; accessInfo: string }>;
  passwordManagerInfo: string;
  notes: string;
}

export interface WishesData {
  medicalWishes: string;
  carePreferences: string;
  funeralWishes: string;
  organDonation: string;
  otherWishes: string;
  notes: string;
}

export interface DocumentsData {
  testamentLocation: string;
  powerOfAttorneyLocation: string;
  livingWillLocation: string;
  insuranceDocsLocation: string;
  propertyDocsLocation: string;
  otherDocsLocation: string;
  notes: string;
}

export interface ContactsData {
  contacts: Array<{ name: string; relationship: string; phone: string; email: string; address: string }>;
  professionals: Array<{ type: string; name: string; phone: string; email: string; address: string }>;
  notes: string;
}

export interface VorsorgeFormData {
  personal: PersonalData;
  assets: AssetsData;
  digital: DigitalData;
  wishes: WishesData;
  documents: DocumentsData;
  contacts: ContactsData;
}

const defaultPersonalData: PersonalData = {
  fullName: '',
  birthDate: '',
  address: '',
  phone: '',
  trustedPerson1: '',
  trustedPerson1Phone: '',
  trustedPerson2: '',
  trustedPerson2Phone: '',
  emergencyContact: '',
  emergencyPhone: '',
  medications: [],
  notes: '',
};

const defaultAssetsData: AssetsData = {
  bankAccounts: [{ institute: '', purpose: '', balance: '' }],
  properties: [],
  insurances: [],
  valuables: [],
  notes: '',
};

const defaultDigitalData: DigitalData = {
  emailAccounts: [{ provider: '', email: '', accessInfo: '' }],
  socialMedia: [],
  subscriptions: [],
  passwordManagerInfo: '',
  notes: '',
};

const defaultWishesData: WishesData = {
  medicalWishes: '',
  carePreferences: '',
  funeralWishes: '',
  organDonation: '',
  otherWishes: '',
  notes: '',
};

const defaultDocumentsData: DocumentsData = {
  testamentLocation: '',
  powerOfAttorneyLocation: '',
  livingWillLocation: '',
  insuranceDocsLocation: '',
  propertyDocsLocation: '',
  otherDocsLocation: '',
  notes: '',
};

const defaultContactsData: ContactsData = {
  contacts: [{ name: '', relationship: '', phone: '', email: '', address: '' }],
  professionals: [],
  notes: '',
};

const defaultFormData: VorsorgeFormData = {
  personal: defaultPersonalData,
  assets: defaultAssetsData,
  digital: defaultDigitalData,
  wishes: defaultWishesData,
  documents: defaultDocumentsData,
  contacts: defaultContactsData,
};

interface FormContextType {
  formData: VorsorgeFormData;
  updateSection: <K extends keyof VorsorgeFormData>(
    section: K,
    data: VorsorgeFormData[K]
  ) => void;
  saveSection: (section: keyof VorsorgeFormData) => Promise<void>;
  loadAllData: () => Promise<void>;
  saving: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { activeProfileId } = useProfiles();
  const { isEncryptionEnabled, isUnlocked, encrypt, decrypt } = useEncryption();
  const [formData, setFormData] = useState<VorsorgeFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const updateSection = <K extends keyof VorsorgeFormData>(
    section: K,
    data: VorsorgeFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [section]: data }));
  };

  const saveSection = async (section: keyof VorsorgeFormData) => {
    if (!user || !profile?.has_paid || !activeProfileId) return;
    
    // If encryption is enabled but not unlocked, don't allow saves
    if (isEncryptionEnabled && !isUnlocked) {
      logger.warn('Cannot save: encryption is enabled but not unlocked');
      return;
    }
    
    // Don't save while loading a different profile
    if (isLoadingProfile) {
      logger.warn('Cannot save: profile is being loaded');
      return;
    }
    
    setSaving(true);
    try {
      const dataToSave = formData[section];
      
      // Encrypt data if encryption is enabled
      const processedData = isEncryptionEnabled && isUnlocked 
        ? await encrypt(dataToSave)
        : dataToSave;
      
      const { error } = await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: user.id,
          section_key: section,
          data: processedData as unknown as Json,
          person_profile_id: activeProfileId,
          is_for_partner: false, // Legacy field, keep for backwards compatibility
        }, {
          onConflict: 'user_id,section_key,person_profile_id'
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadAllData = React.useCallback(async () => {
    if (!user || !activeProfileId) return;
    
    // If encryption is enabled but not unlocked, don't load data
    if (isEncryptionEnabled && !isUnlocked) {
      setFormData(defaultFormData);
      return;
    }

    setIsLoadingProfile(true);
    
    // CRITICAL: Reset form data immediately to prevent cross-contamination
    setFormData(defaultFormData);

    try {
      const { data, error } = await supabase
        .from('vorsorge_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('person_profile_id', activeProfileId);

      if (error) throw error;

      if (data && data.length > 0) {
        const newFormData = { ...defaultFormData };

        for (const item of data) {
          // Skip encryption verifier
          if (item.section_key === '_encryption_verifier') continue;
          
          const sectionKey = item.section_key as keyof VorsorgeFormData;
          
          // Decrypt data if encryption is enabled
          let sectionData = item.data as Record<string, unknown>;
          if (isEncryptionEnabled && isUnlocked) {
            sectionData = await decrypt<Record<string, unknown>>(item.data);
          }
          
          if (sectionKey in newFormData) {
            (newFormData as Record<string, unknown>)[sectionKey] = sectionData;
          }
        }

        setFormData(newFormData);
      } else {
        // Reset to defaults for new profile
        setFormData(defaultFormData);
      }
    } catch (error) {
      logger.error('Error loading data:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [user, activeProfileId, isEncryptionEnabled, isUnlocked, decrypt]);

  // Reload data when active profile changes or encryption state changes
  useEffect(() => {
    // Immediately reset to defaults when profile changes
    setFormData(defaultFormData);
    setIsLoadingProfile(true);
    
    if (user && profile?.has_paid && activeProfileId) {
      // Only load if encryption is not enabled OR if it's unlocked
      if (!isEncryptionEnabled || isUnlocked) {
        loadAllData();
      } else {
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
    }
  }, [user, profile?.has_paid, activeProfileId, loadAllData, isEncryptionEnabled, isUnlocked]);

  return (
    <FormContext.Provider value={{ 
      formData, 
      updateSection, 
      saveSection, 
      loadAllData,
      saving 
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormData must be used within a FormProvider');
  }
  return context;
};
