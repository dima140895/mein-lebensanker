import { useRef, useCallback } from 'react';
import { useFormData, VorsorgeFormData } from '@/contexts/FormContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/contexts/EncryptionContext';
import { logger } from '@/lib/logger';
import { sectionStatusEvents } from './useSectionStatusRefresh';

interface UseAutoSaveOptions {
  section: keyof VorsorgeFormData;
  /** If true, syncs fullName/birthDate to person_profiles after saving 'personal' section */
  syncToProfile?: boolean;
  /** Callback to trigger after successful save (e.g., to refresh progress status) */
  onSaveComplete?: () => void;
}

export const useAutoSave = ({ section, syncToProfile = false, onSaveComplete }: UseAutoSaveOptions) => {
  const { formData, saveSection, saveSectionWithData } = useFormData();
  const { activeProfileId, updateProfile, loadProfiles } = useProfiles();
  const { profile } = useAuth();
  const { isEncryptionEnabled, isUnlocked } = useEncryption();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const lastProfileIdRef = useRef<string | null>(null);

  // Store captured data at the time of blur to prevent data loss during profile switch
  const capturedDataRef = useRef<{
    profileId: string | null;
    data: VorsorgeFormData[keyof VorsorgeFormData] | null;
  }>({ profileId: null, data: null });

  const triggerSave = useCallback(async () => {
    const captured = capturedDataRef.current;
    const profileIdToSave = captured.profileId;
    const dataToSave = captured.data;
    
    if (!profile?.has_paid || !profileIdToSave || !dataToSave) {
      capturedDataRef.current = { profileId: null, data: null };
      return;
    }
    
    // If encryption is enabled but not unlocked, skip save
    if (isEncryptionEnabled && !isUnlocked) {
      logger.warn('Auto-save skipped: encryption locked');
      capturedDataRef.current = { profileId: null, data: null };
      return;
    }
    
    // If profile changed, reset the hash to allow saving for new profile
    if (lastProfileIdRef.current !== profileIdToSave) {
      lastSavedRef.current = '';
      lastProfileIdRef.current = profileIdToSave;
    }
    
    // Create a hash of captured data to avoid duplicate saves
    const currentDataHash = JSON.stringify(dataToSave);
    if (currentDataHash === lastSavedRef.current) {
      capturedDataRef.current = { profileId: null, data: null };
      return; // No changes, skip save
    }
    
    try {
      // Use the new saveSectionWithData that accepts explicit data and profileId
      await saveSectionWithData(section, dataToSave, profileIdToSave);
      lastSavedRef.current = currentDataHash;
      
      // Sync personal data to profile if needed (only if still on same profile)
      if (syncToProfile && section === 'personal' && profileIdToSave === activeProfileId) {
        const personalData = dataToSave as VorsorgeFormData['personal'];
        if (personalData.fullName || personalData.birthDate) {
          const profileName = personalData.fullName?.trim() || 'Unbenannt';
          await updateProfile(profileIdToSave, profileName, personalData.birthDate || undefined);
          await loadProfiles();
        }
      }
      
      // Trigger global refresh of section status (updates progress bar)
      sectionStatusEvents.emit();
      
      // Trigger optional callback after successful save
      onSaveComplete?.();
      
      logger.debug(`Auto-saved section: ${section} for profile: ${profileIdToSave}`);
    } catch (error) {
      logger.error(`Error auto-saving section ${section}:`, error);
    } finally {
      capturedDataRef.current = { profileId: null, data: null };
    }
  }, [profile?.has_paid, activeProfileId, section, saveSectionWithData, syncToProfile, updateProfile, loadProfiles, isEncryptionEnabled, isUnlocked, onSaveComplete]);

  const scheduleSave = useCallback(
    (dataSnapshot: VorsorgeFormData[keyof VorsorgeFormData]) => {
      // Capture BOTH the current profile ID AND the data snapshot
      // Important for components that trigger saves immediately after state updates (e.g. Select onValueChange)
      capturedDataRef.current = {
        profileId: activeProfileId,
        data: JSON.parse(JSON.stringify(dataSnapshot)),
      };

      // Clear any pending timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save by 300ms to avoid saving on rapid field changes
      saveTimeoutRef.current = setTimeout(() => {
        triggerSave();
      }, 300);
    },
    [activeProfileId, triggerSave]
  );

  const handleBlur = useCallback(() => {
    scheduleSave(formData[section]);
  }, [formData, scheduleSave, section]);

  const handleBlurWithData = useCallback(
    (dataSnapshot: VorsorgeFormData[keyof VorsorgeFormData]) => {
      scheduleSave(dataSnapshot);
    },
    [scheduleSave]
  );

  // Reset the last saved hash when profile changes (to allow saving for new profile)
  const resetSaveState = useCallback(() => {
    lastSavedRef.current = '';
    // Cancel any pending save when profile changes, but still process the captured data
    if (saveTimeoutRef.current) {
      // If there's pending data from the old profile, save it immediately before clearing
      if (capturedDataRef.current.profileId && capturedDataRef.current.data) {
        triggerSave();
      }
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [triggerSave]);

  return {
    handleBlur,
    handleBlurWithData,
    triggerSave,
    resetSaveState,
  };
};
