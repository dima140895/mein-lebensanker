import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/browserClient';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import RelativesSummary from '@/components/relatives/RelativesSummary';
import PINEntry from '@/components/relatives/PINEntry';
import RecoveryKeyEntry from '@/components/relatives/RecoveryKeyEntry';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';
import { decryptData, isEncryptedData } from '@/lib/encryption';

interface VorsorgeData {
  section_key: string;
  data: Record<string, unknown>;
  is_for_partner: boolean;
  person_profile_id: string | null;
  profile_name: string | null;
}

interface PersonProfile {
  profile_id: string;
  profile_name: string;
  birth_date: string | null;
}

interface EncryptionInfo {
  encryption_salt: string | null;
  encrypted_password_recovery: string | null;
  is_encrypted: boolean;
}

const RelativesViewContent = () => {
  const { token } = useParams<{ token: string }>();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vorsorgeData, setVorsorgeData] = useState<VorsorgeData[]>([]);
  const [profiles, setProfiles] = useState<PersonProfile[]>([]);
  const [sharedSections, setSharedSections] = useState<string[]>([]);
  const [sharedProfileSections, setSharedProfileSections] = useState<Record<string, string[]> | null>(null);
  const [requiresPIN, setRequiresPIN] = useState(false);
  const [pinVerified, setPINVerified] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [verifiedPIN, setVerifiedPIN] = useState<string | null>(null);
  
  // Encryption state
  const [encryptionInfo, setEncryptionInfo] = useState<EncryptionInfo | null>(null);
  const [decryptionPassword, setDecryptionPassword] = useState<string | null>(null);
  const [requiresDecryption, setRequiresDecryption] = useState(false);

  const t = {
    de: {
      title: 'Übersicht zur Orientierung',
      loading: 'Daten werden geladen...',
      invalidLink: 'Dieser Zugangslink ist ungültig oder abgelaufen.',
      noData: 'Es wurden noch keine Informationen hinterlegt.',
      mainMessage: 'Du musst jetzt nicht alles entscheiden.',
      mainMessageSub: 'Diese Übersicht soll Dir Orientierung geben. Nimm Dir die Zeit, die Du brauchst.',
      disclaimerTop: 'Diese Übersicht dient ausschließlich der persönlichen Orientierung und hat keinerlei rechtliche Wirkung. Sie ersetzt keine rechtliche, notarielle, medizinische oder steuerliche Beratung.',
      disclaimerBottom: 'Alle hier dokumentierten Informationen dienen der Übersicht und vorbereitenden Organisation. Sie sind nicht rechtlich bindend und ersetzen keine professionelle Beratung bei rechtlichen, steuerlichen oder medizinischen Fragen.',
      decryptionError: 'Fehler beim Entschlüsseln der Daten.',
    },
    en: {
      title: 'Overview for Orientation',
      loading: 'Loading data...',
      invalidLink: 'This access link is invalid or expired.',
      noData: 'No information has been recorded yet.',
      mainMessage: "You don't have to decide everything now.",
      mainMessageSub: 'This overview is meant to give you orientation. Take the time you need.',
      disclaimerTop: 'This overview is for personal orientation only and has no legal effect. It does not replace legal, notarial, medical, or tax advice.',
      disclaimerBottom: 'All information documented here is for overview and preparatory organization purposes only. It is not legally binding and does not replace professional advice on legal, tax, or medical matters.',
      decryptionError: 'Error decrypting data.',
    },
  };

  const texts = t[language];

  // Check if PIN is required on initial load
  useEffect(() => {
    const checkPINRequirement = async () => {
      if (!token) {
        setError(texts.invalidLink);
        setLoading(false);
        return;
      }

      try {
        // First check with no PIN to see if PIN is required
        const { data: tokenValidation, error: tokenError } = await supabase
          .rpc('validate_share_token_with_pin', { _token: token, _pin: null });

        if (tokenError || !tokenValidation?.length) {
          setError(texts.invalidLink);
          setLoading(false);
          return;
        }

        const validation = tokenValidation[0];
        
        // Check if locked (0 remaining attempts)
        if (validation.remaining_attempts === 0) {
          setIsLocked(true);
          setRequiresPIN(true);
          setRemainingAttempts(0);
          setLoading(false);
          return;
        }
        
        if (!validation.is_valid) {
          setError(texts.invalidLink);
          setLoading(false);
          return;
        }

        if (validation.requires_pin && !validation.pin_valid) {
          // PIN is required, show PIN entry with remaining attempts
          setRequiresPIN(true);
          setRemainingAttempts(validation.remaining_attempts ?? 3);
          setLoading(false);
          return;
        }

        // No PIN required or PIN not set, load encryption info
        await loadEncryptionInfo(null);
      } catch (err) {
        logger.error('Error:', err);
        setError(texts.invalidLink);
        setLoading(false);
      }
    };

    checkPINRequirement();
  }, [token]);

  const loadEncryptionInfo = async (pin: string | null) => {
    if (!token) return;

    try {
      const { data: encInfo, error: encError } = await supabase
        .rpc('get_encryption_info_by_token', { _token: token, _pin: pin });

      if (encError || !encInfo?.length) {
        // No encryption info, load data directly
        await loadFullData(null, pin);
        return;
      }

      const info = encInfo[0] as EncryptionInfo;
      setEncryptionInfo(info);

      if (info.is_encrypted && info.encrypted_password_recovery) {
        // Data is encrypted, need recovery key
        setRequiresDecryption(true);
        setLoading(false);
      } else {
        // Not encrypted, load directly
        await loadFullData(null, pin);
      }
    } catch (err) {
      logger.error('Error loading encryption info:', err);
      await loadFullData(null, pin);
    }
  };

  const loadFullData = async (password: string | null, pin: string | null = verifiedPIN) => {
    if (!token) return;

    try {
      // Get profiles, vorsorge data, shared sections, and per-profile sections in parallel
      // Pass PIN to all RPCs to ensure authorization
      const [profilesResult, dataResult, sectionsResult, profileSectionsResult] = await Promise.all([
        supabase.rpc('get_profiles_by_token', { _token: token, _pin: pin }),
        supabase.rpc('get_vorsorge_data_by_token', { _token: token, _pin: pin }),
        supabase.rpc('get_shared_sections_by_token', { _token: token, _pin: pin }),
        supabase.rpc('get_shared_profile_sections_by_token', { _token: token, _pin: pin }),
      ]);

      // Store shared sections (legacy)
      if (sectionsResult.data) {
        setSharedSections(sectionsResult.data as string[]);
      }
      
      // Store per-profile sections (new structure)
      if (profileSectionsResult.data && typeof profileSectionsResult.data === 'object') {
        setSharedProfileSections(profileSectionsResult.data as Record<string, string[]>);
      }

      if (profilesResult.data) {
        const transformedProfiles: PersonProfile[] = (profilesResult.data || []).map((p: { profile_id: string; profile_name: string; birth_date: string | null }) => ({
          profile_id: p.profile_id,
          profile_name: p.profile_name,
          birth_date: p.birth_date,
        }));
        setProfiles(transformedProfiles);
      }

      if (dataResult.error) {
        logger.error('Error loading data:', dataResult.error);
        setError(texts.invalidLink);
      } else {
        // Transform and potentially decrypt data
        const rawData = dataResult.data || [];
        const transformedData: VorsorgeData[] = [];

        for (const item of rawData) {
          let parsedData: Record<string, unknown> = {};
          
          // Check if data needs decryption
          if (typeof item.data === 'string' && isEncryptedData(item.data) && password && encryptionInfo?.encryption_salt) {
            try {
              parsedData = await decryptData<Record<string, unknown>>(
                item.data,
                password,
                encryptionInfo.encryption_salt
              );
            } catch (decryptErr) {
              logger.error('Error decrypting item:', decryptErr);
              // Skip items that can't be decrypted
              continue;
            }
          } else if (typeof item.data === 'object' && item.data !== null) {
            parsedData = item.data as Record<string, unknown>;
          }

          // Skip internal verifier sections
          if (item.section_key === '_encryption_verifier') continue;

          transformedData.push({
            section_key: item.section_key,
            data: parsedData,
            is_for_partner: item.is_for_partner ?? false,
            person_profile_id: item.person_profile_id,
            profile_name: item.profile_name,
          });
        }
        
        setVorsorgeData(transformedData);
      }
    } catch (err) {
      logger.error('Error:', err);
      setError(texts.invalidLink);
    } finally {
      setLoading(false);
    }
  };

  const handlePINSubmit = async (enteredPIN: string): Promise<{ valid: boolean; remainingAttempts: number }> => {
    if (!token) return { valid: false, remainingAttempts: 0 };

    try {
      const { data: tokenValidation, error: tokenError } = await supabase
        .rpc('validate_share_token_with_pin', { _token: token, _pin: enteredPIN });

      if (tokenError || !tokenValidation?.length) {
        return { valid: false, remainingAttempts: 0 };
      }

      const validation = tokenValidation[0];
      const newRemainingAttempts = validation.remaining_attempts ?? 0;
      
      if (validation.is_valid && validation.pin_valid) {
        setPINVerified(true);
        setRequiresPIN(false);
        setVerifiedPIN(enteredPIN); // Store verified PIN for subsequent calls
        setLoading(true);
        await loadEncryptionInfo(enteredPIN);
        return { valid: true, remainingAttempts: 3 };
      }

      // Update state for locked status
      if (newRemainingAttempts === 0) {
        setIsLocked(true);
      }

      return { valid: false, remainingAttempts: newRemainingAttempts };
    } catch (err) {
      logger.error('Error validating PIN:', err);
      return { valid: false, remainingAttempts: 0 };
    }
  };

  const handleDecrypted = async (password: string) => {
    setDecryptionPassword(password);
    setRequiresDecryption(false);
    setLoading(true);
    // Pass verifiedPIN to loadFullData
    await loadFullData(password);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (requiresPIN && !pinVerified) {
    return (
      <div className="container mx-auto px-4 py-12">
        <PINEntry 
          onSubmit={handlePINSubmit} 
          language={language} 
          initialRemainingAttempts={remainingAttempts}
          isLocked={isLocked}
        />
      </div>
    );
  }

  if (requiresDecryption && encryptionInfo?.encrypted_password_recovery) {
    return (
      <div className="container mx-auto px-4 py-12">
        <RecoveryKeyEntry
          language={language}
          encryptedPasswordRecovery={encryptionInfo.encrypted_password_recovery}
          onDecrypted={handleDecrypted}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-xl bg-amber-light/30 border border-amber/20 p-8">
            <Shield className="h-12 w-12 text-amber mx-auto mb-4" />
            <p className="text-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-sage-light/50 border border-sage/30 p-6"
        >
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-sage-dark flex-shrink-0 mt-0.5" />
            <p className="text-sm text-sage-dark leading-relaxed">{texts.disclaimerTop}</p>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            {texts.mainMessage}
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            {texts.mainMessageSub}
          </p>
        </motion.div>

        {/* Data Summary */}
        {vorsorgeData.length > 0 ? (
          <RelativesSummary 
            data={vorsorgeData} 
            profiles={profiles}
            sharedSections={sharedSections}
            sharedProfileSections={sharedProfileSections}
            token={token}
            pin={verifiedPIN}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">{texts.noData}</p>
          </div>
        )}

        {/* Bottom Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-cream-dark/50 border border-border p-6"
        >
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">{texts.disclaimerBottom}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const RelativesView = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <RelativesViewContent />
      </main>
    </div>
  );
};

export default RelativesView;
