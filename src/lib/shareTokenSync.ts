/**
 * Utility to keep share tokens in sync when encryption password changes.
 * 
 * When a user changes their encryption password, all existing share links
 * that have PIN-based decryption (encrypted_recovery_key) need to be updated
 * with the new password encrypted with their respective PINs.
 * 
 * However, since we don't store the PIN in plain text (only the hash),
 * we cannot re-encrypt with the original PIN. The solution is to:
 * 1. Delete the encrypted_recovery_key from affected tokens
 * 2. Users will need to either:
 *    a) Create new share links, or
 *    b) Relatives use the manual recovery key
 */

import { supabase } from '@/integrations/supabase/browserClient';
import { logger } from '@/lib/logger';

/**
 * Invalidates the encrypted_recovery_key on all share tokens for a user.
 * This should be called when the encryption password changes.
 * 
 * @param userId - The user's ID
 * @returns Object with success status and count of affected tokens
 */
export async function invalidateShareTokenEncryption(userId: string): Promise<{
  success: boolean;
  affectedCount: number;
}> {
  try {
    // Find all active tokens with encrypted_recovery_key
    const { data: tokens, error: fetchError } = await supabase
      .from('share_tokens')
      .select('id, encrypted_recovery_key')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('encrypted_recovery_key', 'is', null);

    if (fetchError) {
      logger.error('Error fetching share tokens:', fetchError);
      return { success: false, affectedCount: 0 };
    }

    if (!tokens || tokens.length === 0) {
      return { success: true, affectedCount: 0 };
    }

    // Clear encrypted_recovery_key on all affected tokens
    const { error: updateError } = await supabase
      .from('share_tokens')
      .update({ encrypted_recovery_key: null })
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('encrypted_recovery_key', 'is', null);

    if (updateError) {
      logger.error('Error updating share tokens:', updateError);
      return { success: false, affectedCount: 0 };
    }

    logger.debug(`Invalidated encrypted_recovery_key on ${tokens.length} share tokens`);
    return { success: true, affectedCount: tokens.length };
  } catch (error) {
    logger.error('Error in invalidateShareTokenEncryption:', error);
    return { success: false, affectedCount: 0 };
  }
}

/**
 * Checks if a user has any share tokens that would be affected by
 * a password change.
 * 
 * @param userId - The user's ID
 * @returns Number of affected tokens
 */
export async function countAffectedShareTokens(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('share_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('encrypted_recovery_key', 'is', null);

    if (error) {
      logger.error('Error counting share tokens:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    logger.error('Error in countAffectedShareTokens:', error);
    return 0;
  }
}
