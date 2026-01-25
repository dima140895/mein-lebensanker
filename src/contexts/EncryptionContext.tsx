import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useAuth } from './AuthContext';
import { 
  generateSalt, 
  encryptData, 
  decryptData, 
  createPasswordVerifier, 
  verifyPassword,
  isEncryptedData 
} from '@/lib/encryption';
import { logger } from '@/lib/logger';

interface MigrationProgress {
  total: number;
  current: number;
  isRunning: boolean;
}

interface EncryptionContextType {
  isEncryptionEnabled: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  encryptionSalt: string | null;
  migrationProgress: MigrationProgress | null;
  enableEncryption: (password: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  encrypt: <T>(data: T) => Promise<string | T>;
  decrypt: <T>(data: unknown) => Promise<T>;
  disableEncryption: (password: string) => Promise<boolean>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

// Session storage key for the encryption password (cleared on tab close)
const SESSION_PASSWORD_KEY = 'vorsorge_encryption_key';

export const EncryptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [encryptionSalt, setEncryptionSalt] = useState<string | null>(null);
  const [passwordVerifier, setPasswordVerifier] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);

  // Load encryption settings from profile
  useEffect(() => {
    const loadEncryptionSettings = async () => {
      if (!user) {
        setIsEncryptionEnabled(false);
        setEncryptionSalt(null);
        setIsUnlocked(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_encrypted, encryption_salt')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsEncryptionEnabled(data.is_encrypted || false);
          setEncryptionSalt(data.encryption_salt || null);
          
          // Load password verifier from vorsorge_data if encryption is enabled
          if (data.is_encrypted && data.encryption_salt) {
            const { data: verifierData } = await supabase
              .from('vorsorge_data')
              .select('data')
              .eq('user_id', user.id)
              .eq('section_key', '_encryption_verifier')
              .maybeSingle();
            
            if (verifierData?.data) {
              setPasswordVerifier(verifierData.data as string);
            }
          }
        }
      } catch (error) {
        logger.error('Error loading encryption settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEncryptionSettings();
  }, [user]);

  // Check session storage for existing password on mount
  useEffect(() => {
    if (isEncryptionEnabled && encryptionSalt && passwordVerifier) {
      const storedPassword = sessionStorage.getItem(SESSION_PASSWORD_KEY);
      if (storedPassword) {
        verifyPassword(passwordVerifier, storedPassword, encryptionSalt)
          .then((isValid) => {
            if (isValid) {
              setCurrentPassword(storedPassword);
              setIsUnlocked(true);
            } else {
              sessionStorage.removeItem(SESSION_PASSWORD_KEY);
            }
          })
          .catch(() => {
            sessionStorage.removeItem(SESSION_PASSWORD_KEY);
          });
      }
    }
  }, [isEncryptionEnabled, encryptionSalt, passwordVerifier]);

  const enableEncryption = useCallback(async (password: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Generate a new salt
      const salt = generateSalt();
      
      // Create password verifier
      const verifier = await createPasswordVerifier(password, salt);
      
      // Fetch all existing unencrypted data for migration
      const { data: existingData, error: fetchError } = await supabase
        .from('vorsorge_data')
        .select('*')
        .eq('user_id', user.id)
        .neq('section_key', '_encryption_verifier');
      
      if (fetchError) throw fetchError;
      
      // Migrate existing data by encrypting it
      if (existingData && existingData.length > 0) {
        setMigrationProgress({ total: existingData.length, current: 0, isRunning: true });
        
        for (let i = 0; i < existingData.length; i++) {
          const item = existingData[i];
          
          // Skip already encrypted data
          if (isEncryptedData(item.data)) {
            setMigrationProgress(prev => prev ? { ...prev, current: i + 1 } : null);
            continue;
          }
          
          // Encrypt the data
          const encryptedData = await encryptData(item.data, password, salt);
          
          // Update the record with encrypted data
          const { error: updateError } = await supabase
            .from('vorsorge_data')
            .update({ data: encryptedData })
            .eq('id', item.id);
          
          if (updateError) {
            logger.error('Error encrypting data item:', updateError);
          }
          
          setMigrationProgress(prev => prev ? { ...prev, current: i + 1 } : null);
        }
        
        setMigrationProgress(null);
      }
      
      // Update profile with encryption settings
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_encrypted: true,
          encryption_salt: salt,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Store the password verifier
      const { error: verifierError } = await supabase
        .from('vorsorge_data')
        .upsert({
          user_id: user.id,
          section_key: '_encryption_verifier',
          data: verifier,
          person_profile_id: null,
        }, {
          onConflict: 'user_id,section_key,person_profile_id'
        });

      if (verifierError) throw verifierError;

      // Update local state
      setEncryptionSalt(salt);
      setPasswordVerifier(verifier);
      setIsEncryptionEnabled(true);
      setCurrentPassword(password);
      setIsUnlocked(true);
      
      // Store password in session
      sessionStorage.setItem(SESSION_PASSWORD_KEY, password);

      return true;
    } catch (error) {
      logger.error('Error enabling encryption:', error);
      setMigrationProgress(null);
      return false;
    }
  }, [user]);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!encryptionSalt || !passwordVerifier) return false;

    try {
      const isValid = await verifyPassword(passwordVerifier, password, encryptionSalt);
      
      if (isValid) {
        setCurrentPassword(password);
        setIsUnlocked(true);
        sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error unlocking encryption:', error);
      return false;
    }
  }, [encryptionSalt, passwordVerifier]);

  const lock = useCallback(() => {
    setCurrentPassword(null);
    setIsUnlocked(false);
    sessionStorage.removeItem(SESSION_PASSWORD_KEY);
  }, []);

  const encrypt = useCallback(async <T,>(data: T): Promise<string | T> => {
    if (!isEncryptionEnabled || !currentPassword || !encryptionSalt) {
      return data;
    }

    try {
      return await encryptData(data, currentPassword, encryptionSalt);
    } catch (error) {
      logger.error('Error encrypting data:', error);
      return data;
    }
  }, [isEncryptionEnabled, currentPassword, encryptionSalt]);

  const decrypt = useCallback(async <T,>(data: unknown): Promise<T> => {
    // If data is not encrypted or encryption is not enabled, return as-is
    if (!isEncryptionEnabled || !currentPassword || !encryptionSalt) {
      return data as T;
    }

    // Check if data looks encrypted
    if (!isEncryptedData(data)) {
      return data as T;
    }

    try {
      return await decryptData<T>(data as string, currentPassword, encryptionSalt);
    } catch (error) {
      logger.error('Error decrypting data:', error);
      return data as T;
    }
  }, [isEncryptionEnabled, currentPassword, encryptionSalt]);

  const disableEncryption = useCallback(async (password: string): Promise<boolean> => {
    if (!user || !encryptionSalt || !passwordVerifier) return false;

    try {
      // Verify password first
      const isValid = await verifyPassword(passwordVerifier, password, encryptionSalt);
      if (!isValid) return false;

      // Update profile to disable encryption
      const { error } = await supabase
        .from('profiles')
        .update({
          is_encrypted: false,
          encryption_salt: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove verifier
      await supabase
        .from('vorsorge_data')
        .delete()
        .eq('user_id', user.id)
        .eq('section_key', '_encryption_verifier');

      // Update local state
      setIsEncryptionEnabled(false);
      setEncryptionSalt(null);
      setPasswordVerifier(null);
      setCurrentPassword(null);
      setIsUnlocked(false);
      sessionStorage.removeItem(SESSION_PASSWORD_KEY);

      return true;
    } catch (error) {
      logger.error('Error disabling encryption:', error);
      return false;
    }
  }, [user, encryptionSalt, passwordVerifier]);

  return (
    <EncryptionContext.Provider value={{
      isEncryptionEnabled,
      isUnlocked,
      isLoading,
      encryptionSalt,
      migrationProgress,
      enableEncryption,
      unlock,
      lock,
      encrypt,
      decrypt,
      disableEncryption,
    }}>
      {children}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = (): EncryptionContextType => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
};
