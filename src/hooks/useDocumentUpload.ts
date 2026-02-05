import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface UploadedDocument {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface UseDocumentUploadOptions {
  onUploadComplete?: (documents: UploadedDocument[]) => void;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
}

// Allowed file extensions mapped to MIME types for strict validation
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

// Validate filename is safe (no path traversal, valid characters)
const isValidFilename = (filename: string): boolean => {
  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  // Check for null bytes or other control characters
  if (/[\x00-\x1f\x7f]/.test(filename)) {
    return false;
  }
  // Must have a file extension
  if (!filename.includes('.')) {
    return false;
  }
  return true;
};

// Validate file extension matches MIME type
const validateFileExtension = (filename: string, mimeType: string): boolean => {
  const allowedExts = ALLOWED_EXTENSIONS[mimeType];
  if (!allowedExts) return false;
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExts.includes(ext);
};

export const useDocumentUpload = (options: UseDocumentUploadOptions = {}) => {
  const { user } = useAuth();
  const { activeProfileId } = useProfiles();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const {
    onUploadComplete,
    maxFileSizeMB = 10,
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  } = options;

  const uploadFile = useCallback(async (file: File, documentType: string): Promise<UploadedDocument | null> => {
    if (!user) {
      toast.error('Bitte melden Sie sich an.');
      return null;
    }

    if (!activeProfileId) {
      toast.error('Bitte wählen Sie ein Profil aus.');
      return null;
    }

    // Security: Validate filename first (prevent path traversal)
    if (!isValidFilename(file.name)) {
      toast.error('Ungültiger Dateiname');
      return null;
    }

    // Validate file type (MIME type check)
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Dateityp nicht erlaubt. Erlaubt: PDF, JPG, PNG, WEBP`);
      return null;
    }

    // Security: Validate file extension matches MIME type (prevent MIME confusion attacks)
    if (!validateFileExtension(file.name, file.type)) {
      toast.error('Dateiendung stimmt nicht mit Dateityp überein');
      return null;
    }

    // Validate file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Datei zu groß. Maximum: ${maxFileSizeMB}MB`);
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique file path: userId/profileId/documentType/timestamp-filename
      const timestamp = Date.now();
      // Sanitize filename: only allow alphanumeric, dots, hyphens, underscores
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.') // Prevent multiple dots
        .substring(0, 100); // Limit filename length
      const filePath = `${user.id}/${activeProfileId}/${documentType}/${timestamp}-${sanitizedFileName}`;

      const { data, error } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadProgress(100);

      const uploadedDoc: UploadedDocument = {
        name: file.name,
        path: data.path,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      toast.success('Dokument hochgeladen!');
      return uploadedDoc;
    } catch (error: unknown) {
      logger.error('Upload error:', error);
      toast.error('Upload fehlgeschlagen');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [user, activeProfileId, allowedTypes, maxFileSizeMB]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    if (!user) return false;

    // Security: Validate file path belongs to user
    if (!filePath.startsWith(`${user.id}/`)) {
      logger.error('Unauthorized delete attempt');
      return false;
    }

    try {
      const { error } = await supabase.storage
        .from('user-documents')
        .remove([filePath]);

      if (error) throw error;

      toast.success('Dokument gelöscht.');
      return true;
    } catch (error: unknown) {
      logger.error('Delete error:', error);
      toast.error('Löschen fehlgeschlagen');
      return false;
    }
  }, [user]);

  const getFileUrl = useCallback(async (filePath: string): Promise<string | null> => {
    if (!user) return null;

    // Security: Validate file path belongs to user
    if (!filePath.startsWith(`${user.id}/`)) {
      logger.error('Unauthorized URL access attempt');
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error: unknown) {
      logger.error('Get URL error:', error);
      return null;
    }
  }, [user]);

  const listFiles = useCallback(async (documentType?: string): Promise<UploadedDocument[]> => {
    if (!user || !activeProfileId) return [];

    try {
      // Profile-specific path: userId/profileId/documentType
      const folderPath = documentType 
        ? `${user.id}/${activeProfileId}/${documentType}` 
        : `${user.id}/${activeProfileId}`;
      
      const { data, error } = await supabase.storage
        .from('user-documents')
        .list(folderPath);

      if (error) throw error;

      // Filter out placeholder files and folders (folders have id: null)
      // Only include actual files that have a valid id
      return (data || [])
        .filter(file => 
          file.name !== '.emptyFolderPlaceholder' && 
          file.id !== null &&
          !file.name.startsWith('.')
        )
        .map(file => ({
          name: file.name,
          path: `${folderPath}/${file.name}`,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at || ''
        }));
    } catch (error: unknown) {
      logger.error('List files error:', error);
      return [];
    }
  }, [user, activeProfileId]);

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    listFiles,
    uploading,
    uploadProgress
  };
};
