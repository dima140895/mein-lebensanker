import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://vorsorge.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, ''))) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

interface DocumentInfo {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
  signedUrl: string;
  documentType: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token, profileId } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for storage access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate the token and check if 'documents' section is shared
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('validate_share_token', { _token: token })

    if (tokenError || !tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validation = tokenData[0]
    if (!validation.is_valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = validation.user_id

    // Check if 'documents' section is in shared_sections (supports both legacy and new structure)
    const { data: sharedSections, error: sectionsError } = await supabase
      .rpc('get_shared_sections_by_token', { _token: token })

    // Also get per-profile sections for new structure
    const { data: profileSections, error: profileSectionsError } = await supabase
      .rpc('get_shared_profile_sections_by_token', { _token: token })

    if (sectionsError && profileSectionsError) {
      console.error('Section retrieval failed')
      return new Response(
        JSON.stringify({ error: 'Failed to get shared sections' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if documents is shared via new per-profile structure
    let documentsSharedViaProfile = false
    if (profileSections && typeof profileSections === 'object' && Object.keys(profileSections).length > 0) {
      documentsSharedViaProfile = Object.values(profileSections as Record<string, string[]>).some(
        (sections: string[]) => sections?.includes('documents')
      )
    }

    // Check if documents is shared via legacy structure or new structure
    const documentsSharedViaLegacy = sharedSections?.includes('documents') ?? false
    const isDocumentsShared = documentsSharedViaProfile || documentsSharedViaLegacy

    if (!isDocumentsShared) {
      return new Response(
        JSON.stringify({ error: 'Documents section is not shared', documents: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Document types that can be uploaded
    const documentTypes = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other']
    
    const allDocuments: DocumentInfo[] = []

    // List files for each document type
    for (const docType of documentTypes) {
      const folderPath = `${userId}/${docType}`
      
      const { data: files, error: listError } = await supabase.storage
        .from('user-documents')
        .list(folderPath)

      if (listError) {
        continue
      }

      if (!files || files.length === 0) continue

      // Filter out placeholder files and .emptyFolderPlaceholder
      const validFiles = files.filter(f => 
        f.name !== '.emptyFolderPlaceholder' && 
        !f.name.startsWith('.')
      )

      for (const file of validFiles) {
        const filePath = `${folderPath}/${file.name}`
        
        // Create signed URL (valid for 15 minutes for security)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('user-documents')
          .createSignedUrl(filePath, 900) // 15 minutes - shorter for security

        if (signedUrlError) {
          continue
        }

        // Get display name (remove timestamp prefix)
        const parts = file.name.split('-')
        let displayName = file.name
        if (parts.length > 1 && !isNaN(parseInt(parts[0]))) {
          displayName = parts.slice(1).join('-')
        }

        allDocuments.push({
          name: displayName,
          path: filePath,
          size: file.metadata?.size || 0,
          uploadedAt: file.created_at || '',
          signedUrl: signedUrlData.signedUrl,
          documentType: docType,
        })
      }
    }

    return new Response(
      JSON.stringify({ documents: allDocuments }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Document retrieval error occurred')
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})