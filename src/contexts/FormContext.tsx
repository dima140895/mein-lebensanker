import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from './AuthContext';
import { Json } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

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
  notes: string;
}

export interface AssetsData {
  bankAccounts: Array<{ institute: string; purpose: string }>;
  properties: Array<{ address: string; type: string; ownership: string }>;
  insurances: Array<{ type: string; company: string; policyNumber: string }>;
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
  notes: '',
};

const defaultAssetsData: AssetsData = {
  bankAccounts: [{ institute: '', purpose: '' }],
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
  partnerFormData: VorsorgeFormData;
  updateSection: <K extends keyof VorsorgeFormData>(
    section: K,
    data: VorsorgeFormData[K],
    isPartner?: boolean
  ) => void;
  saveSection: (section: keyof VorsorgeFormData, isPartner?: boolean) => Promise<void>;
  loadAllData: () => Promise<void>;
  saving: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<VorsorgeFormData>(defaultFormData);
  const [partnerFormData, setPartnerFormData] = useState<VorsorgeFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const updateSection = <K extends keyof VorsorgeFormData>(
    section: K,
    data: VorsorgeFormData[K],
    isPartner = false
  ) => {
    if (isPartner) {
      setPartnerFormData(prev => ({ ...prev, [section]: data }));
    } else {
      setFormData(prev => ({ ...prev, [section]: data }));
    }
  };

  const saveSection = async (section: keyof VorsorgeFormData, isPartner = false) => {
    if (!user || !profile?.has_paid) return;
    
    setSaving(true);
    try {
      const dataToSave = isPartner ? partnerFormData[section] : formData[section];
      
      const { error } = await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: user.id,
          section_key: section,
          data: dataToSave as unknown as Json,
          is_for_partner: isPartner,
        }, {
          onConflict: 'user_id,section_key,is_for_partner'
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const loadAllData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vorsorge_data')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const newFormData = { ...defaultFormData };
        const newPartnerFormData = { ...defaultFormData };

        data.forEach((item) => {
          const sectionKey = item.section_key as keyof VorsorgeFormData;
          const sectionData = item.data as Record<string, unknown>;
          
          if (sectionKey in newFormData) {
            if (item.is_for_partner) {
              (newPartnerFormData as Record<string, unknown>)[sectionKey] = sectionData;
            } else {
              (newFormData as Record<string, unknown>)[sectionKey] = sectionData;
            }
          }
        });

        setFormData(newFormData);
        setPartnerFormData(newPartnerFormData);
      }
    } catch (error) {
      logger.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (user && profile?.has_paid) {
      loadAllData();
    }
  }, [user, profile?.has_paid]);

  return (
    <FormContext.Provider value={{ 
      formData, 
      partnerFormData, 
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
