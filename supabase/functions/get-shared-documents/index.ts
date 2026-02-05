import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
  // Lovable preview origin can also be served from lovableproject.com
  "https://3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace(/\/$/, ''))) 
    ? origin 
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface DocumentInfo {
  name: string;
  path: string;
  size: number;
  uploadedAt: string;
  signedUrl: string;
  documentType: string;
  profileId: string;
  profileName: string;
}

// Input validation schema
const SharedDocumentsSchema = z.object({
  token: z.string().min(1).max(128),
  pin: z.string().length(6).regex(/^\d{6}$/).optional().nullable(),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse and validate request body with Zod
    const rawBody = await req.json();
    const parseResult = SharedDocumentsSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { token, pin } = parseResult.data;

    // Create Supabase client with service role key for storage access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate the token AND PIN using the PIN-aware validation function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('validate_share_token_with_pin', { _token: token, _pin: pin ?? null })

    if (tokenError || !tokenData || tokenData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validation = tokenData[0]
    // Check both is_valid AND pin_valid to ensure proper authorization
    if (!validation.is_valid || !validation.pin_valid) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = validation.user_id

    // Get per-profile sections for new structure - pass PIN for authorization
    const { data: profileSections, error: profileSectionsError } = await supabase
      .rpc('get_shared_profile_sections_by_token', { _token: token, _pin: pin || null })

    // Also get legacy shared sections - pass PIN for authorization
    const { data: sharedSections, error: sectionsError } = await supabase
      .rpc('get_shared_sections_by_token', { _token: token, _pin: pin || null })

    if (profileSectionsError && sectionsError) {
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get profiles shared via this token - pass PIN for authorization
    const { data: sharedProfiles, error: profilesError } = await supabase
      .rpc('get_profiles_by_token', { _token: token, _pin: pin || null })

    if (profilesError) {
      return new Response(
        JSON.stringify({ error: 'Operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build a map of profileId -> profileName and check which profiles have documents shared
    const profileMap = new Map<string, { name: string; hasDocuments: boolean }>()
    
    if (profileSections && typeof profileSections === 'object' && Object.keys(profileSections).length > 0) {
      // New per-profile structure
      for (const profile of sharedProfiles || []) {
        const sections = (profileSections as Record<string, string[]>)[profile.profile_id]
        if (sections?.includes('documents')) {
          profileMap.set(profile.profile_id, { name: profile.profile_name, hasDocuments: true })
        }
      }
    } else if (sharedSections?.includes('documents')) {
      // Legacy structure - all shared profiles have documents access
      for (const profile of sharedProfiles || []) {
        profileMap.set(profile.profile_id, { name: profile.profile_name, hasDocuments: true })
      }
    }

    if (profileMap.size === 0) {
      return new Response(
        JSON.stringify({ error: 'Documents section is not shared', documents: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Document types that can be uploaded
    const documentTypes = ['testament', 'power-of-attorney', 'living-will', 'insurance', 'property', 'other']
    
    const allDocuments: DocumentInfo[] = []

    // List files for each profile that has documents shared
    for (const [profileId, profileInfo] of profileMap) {
      if (!profileInfo.hasDocuments) continue

      for (const docType of documentTypes) {
        // Check BOTH new and legacy paths
        const newPath = `${userId}/${profileId}/${docType}`
        const legacyPath = `${userId}/${docType}`
        
        // Try new path structure first: userId/profileId/documentType
        const { data: newFiles } = await supabase.storage
          .from('user-documents')
          .list(newPath)

        if (newFiles && newFiles.length > 0) {
          const validFiles = newFiles.filter(f => 
            f.name !== '.emptyFolderPlaceholder' && 
            !f.name.startsWith('.') &&
            f.id !== null
          )

          for (const file of validFiles) {
            const filePath = `${newPath}/${file.name}`
            
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('user-documents')
              .createSignedUrl(filePath, 900)

            if (signedUrlError) continue

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
              profileId: profileId,
              profileName: profileInfo.name,
            })
          }
        }

        // Also check legacy path structure: userId/documentType (for backward compatibility)
        // Only for the first profile to avoid duplicate documents
        const isFirstProfile = Array.from(profileMap.keys())[0] === profileId
        if (isFirstProfile) {
          const { data: legacyFiles } = await supabase.storage
            .from('user-documents')
            .list(legacyPath)
          
          if (legacyFiles && legacyFiles.length > 0) {
            const validFiles = legacyFiles.filter(f => 
              f.name !== '.emptyFolderPlaceholder' && 
              !f.name.startsWith('.') &&
              f.id !== null
            )

            for (const file of validFiles) {
              const filePath = `${legacyPath}/${file.name}`
              
              // Check if this file was already added from new path (avoid duplicates)
              const alreadyAdded = allDocuments.some(d => d.name === file.name.split('-').slice(1).join('-') || d.name === file.name)
              if (alreadyAdded) continue
              
              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('user-documents')
                .createSignedUrl(filePath, 900)

              if (signedUrlError) continue

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
                profileId: profileId,
                profileName: profileInfo.name,
              })
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ documents: allDocuments }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
