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
  maxDocsPerCategory?: number;
  maxTotalStorageMB?: number;
  allowedTypes?: string[];
}

// Allowed file extensions mapped to MIME types for strict validation
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

const DOCUMENT_TYPES = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other'];

// Validate filename is safe (no path traversal, valid characters)
const isValidFilename = (filename: string): boolean => {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  if (/[\x00-\x1f\x7f]/.test(filename)) {
    return false;
  }
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
    maxDocsPerCategory = 3,
    maxTotalStorageMB = 50,
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  } = options;

  /** Calculate total storage used across ALL profiles for this user */
  const getTotalStorageUsed = useCallback(async (): Promise<number> => {
    if (!user) return 0;

    let totalBytes = 0;
    try {
      // List all profile folders for this user
      const { data: profileFolders } = await supabase.storage
        .from('user-documents')
        .list(user.id);

      if (!profileFolders) return 0;

      for (const folder of profileFolders) {
        if (folder.id === null) {
          // It's a folder – list document type subfolders
          for (const docType of DOCUMENT_TYPES) {
            const folderPath = `${user.id}/${folder.name}/${docType}`;
            const { data: files } = await supabase.storage
              .from('user-documents')
              .list(folderPath);

            if (files) {
              for (const file of files) {
                if (file.name !== '.emptyFolderPlaceholder' && file.id !== null && !file.name.startsWith('.')) {
                  totalBytes += file.metadata?.size || 0;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error calculating storage usage:', error);
    }

    return totalBytes;
  }, [user]);

  /** Count documents in a specific category for the active profile */
  const getCategoryDocCount = useCallback(async (documentType: string): Promise<number> => {
    if (!user || !activeProfileId) return 0;

    try {
      const folderPath = `${user.id}/${activeProfileId}/${documentType}`;
      const { data: files } = await supabase.storage
        .from('user-documents')
        .list(folderPath);

      if (!files) return 0;

      return files.filter(f =>
        f.name !== '.emptyFolderPlaceholder' &&
        f.id !== null &&
        !f.name.startsWith('.')
      ).length;
    } catch (error) {
      logger.error('Error counting category docs:', error);
      return 0;
    }
  }, [user, activeProfileId]);

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
      toast.error(`Datei zu groß. Maximum: ${maxFileSizeMB} MB`);
      return null;
    }

    // Check category limit
    const categoryCount = await getCategoryDocCount(documentType);
    if (categoryCount >= maxDocsPerCategory) {
      toast.error(`Maximal ${maxDocsPerCategory} Dokumente pro Kategorie erlaubt. Bitte lösche zuerst ein bestehendes Dokument.`);
      return null;
    }

    // Check total storage limit
    const totalUsed = await getTotalStorageUsed();
    const maxTotalBytes = maxTotalStorageMB * 1024 * 1024;
    if (totalUsed + file.size > maxTotalBytes) {
      const usedMB = (totalUsed / (1024 * 1024)).toFixed(1);
      toast.error(`Speicherlimit erreicht (${usedMB} / ${maxTotalStorageMB} MB). Bitte lösche zuerst bestehende Dokumente.`);
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.{2,}/g, '.')
        .substring(0, 100);
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
  }, [user, activeProfileId, allowedTypes, maxFileSizeMB, maxDocsPerCategory, maxTotalStorageMB, getCategoryDocCount, getTotalStorageUsed]);

  const deleteFile = useCallback(async (filePath: string): Promise<boolean> => {
    if (!user) return false;

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

    if (!filePath.startsWith(`${user.id}/`)) {
      logger.error('Unauthorized URL access attempt');
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(filePath, 3600);

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
      const folderPath = documentType 
        ? `${user.id}/${activeProfileId}/${documentType}` 
        : `${user.id}/${activeProfileId}`;
      
      const { data, error } = await supabase.storage
        .from('user-documents')
        .list(folderPath);

      if (error) throw error;

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
    uploadProgress,
    getCategoryDocCount,
    getTotalStorageUsed,
    maxDocsPerCategory,
    maxTotalStorageMB,
  };
};