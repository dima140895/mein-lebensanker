import { createClient } from "npm:@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://mein-lebensanker.lovable.app",
  "https://id-preview--3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovable.app",
  // Lovable preview origin can also be served from lovableproject.com
  "https://3aceebdb-8fff-4d04-bf5f-d8b882169f3d.lovableproject.com",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin =
    origin &&
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")))
      ? origin
      : ALLOWED_ORIGINS[0];

  // Include supabase client headers to avoid preflight failures
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

type RequestBody = {
  token?: unknown;
  pin?: unknown;
};

const isSixDigitPin = (v: unknown): v is string =>
  typeof v === "string" && /^\d{6}$/.test(v);

const parseRequest = (raw: unknown): { token: string; pin: string | null } | null => {
  const body = (raw ?? {}) as RequestBody;

  if (typeof body.token !== "string") return null;
  const token = body.token.trim();
  if (token.length < 1 || token.length > 128) return null;

  if (body.pin == null) return { token, pin: null };
  if (!isSixDigitPin(body.pin)) return null;

  return { token, pin: body.pin };
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = parseRequest(rawBody);

    if (!parsed) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { token, pin } = parsed;

    // Create client with service role key for storage access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token + PIN (PIN may be null)
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      "validate_share_token_with_pin",
      { _token: token, _pin: pin }
    );

    if (tokenError || !tokenData || tokenData.length === 0) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = tokenData[0] as {
      user_id: string;
      is_valid: boolean;
      pin_valid: boolean;
    };

    if (!validation.is_valid || !validation.pin_valid) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = validation.user_id;

    // One RPC is enough: it returns a per-profile mapping even for legacy tokens
    const { data: sharedProfileSections, error: sharedProfileSectionsError } =
      await supabase.rpc("get_shared_profile_sections_by_token", {
        _token: token,
        _pin: pin,
      });

    if (sharedProfileSectionsError) {
      return new Response(JSON.stringify({ error: "Operation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sharedProfiles, error: profilesError } = await supabase.rpc(
      "get_profiles_by_token",
      { _token: token, _pin: pin }
    );

    if (profilesError) {
      return new Response(JSON.stringify({ error: "Operation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mapping =
      (sharedProfileSections ?? {}) as Record<string, unknown>;

    // Build a map of profileId -> profileName (only those with 'documents' permission)
    const profilesWithDocuments = new Map<string, string>();
    for (const profile of sharedProfiles || []) {
      const sections = mapping[(profile as any).profile_id] as unknown;
      const sectionList = Array.isArray(sections) ? sections : [];
      if (sectionList.includes("documents")) {
        profilesWithDocuments.set(
          (profile as any).profile_id,
          (profile as any).profile_name
        );
      }
    }

    if (profilesWithDocuments.size === 0) {
      return new Response(
        JSON.stringify({ error: "Documents section is not shared", documents: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const documentTypes = [
      "testament",
      "power-of-attorney",
      "living-will",
      "insurance",
      "property",
      "other",
    ] as const;

    const allDocuments: DocumentInfo[] = [];

    const profileIds = Array.from(profilesWithDocuments.keys());

    for (const profileId of profileIds) {
      const profileName = profilesWithDocuments.get(profileId) || "";

      for (const docType of documentTypes) {
        const newPath = `${userId}/${profileId}/${docType}`;
        const legacyPath = `${userId}/${docType}`;

        // New path structure first: userId/profileId/documentType
        const { data: newFiles } = await supabase.storage
          .from("user-documents")
          .list(newPath);

        if (newFiles && newFiles.length > 0) {
          const validFiles = newFiles.filter(
            (f) =>
              f.name !== ".emptyFolderPlaceholder" &&
              !f.name.startsWith(".") &&
              f.id !== null
          );

          for (const file of validFiles) {
            const filePath = `${newPath}/${file.name}`;

            const { data: signedUrlData, error: signedUrlError } =
              await supabase.storage
                .from("user-documents")
                .createSignedUrl(filePath, 900);

            if (signedUrlError || !signedUrlData?.signedUrl) continue;

            const parts = file.name.split("-");
            let displayName = file.name;
            if (parts.length > 1 && !isNaN(parseInt(parts[0], 10))) {
              displayName = parts.slice(1).join("-");
            }

            allDocuments.push({
              name: displayName,
              path: filePath,
              size: (file.metadata as any)?.size || 0,
              uploadedAt: (file as any).created_at || "",
              signedUrl: signedUrlData.signedUrl,
              documentType: docType,
              profileId,
              profileName,
            });
          }
        }

        // Legacy path structure: userId/documentType (avoid duplicates; only for first profile)
        const isFirstProfile = profileIds[0] === profileId;
        if (isFirstProfile) {
          const { data: legacyFiles } = await supabase.storage
            .from("user-documents")
            .list(legacyPath);

          if (legacyFiles && legacyFiles.length > 0) {
            const validFiles = legacyFiles.filter(
              (f) =>
                f.name !== ".emptyFolderPlaceholder" &&
                !f.name.startsWith(".") &&
                f.id !== null
            );

            for (const file of validFiles) {
              const filePath = `${legacyPath}/${file.name}`;

              // Avoid duplicates
              const alreadyAdded = allDocuments.some((d) => {
                const parts = file.name.split("-");
                const legacyDisplay =
                  parts.length > 1 && !isNaN(parseInt(parts[0], 10))
                    ? parts.slice(1).join("-")
                    : file.name;
                return d.name === legacyDisplay;
              });

              if (alreadyAdded) continue;

              const { data: signedUrlData, error: signedUrlError } =
                await supabase.storage
                  .from("user-documents")
                  .createSignedUrl(filePath, 900);

              if (signedUrlError || !signedUrlData?.signedUrl) continue;

              const parts = file.name.split("-");
              let displayName = file.name;
              if (parts.length > 1 && !isNaN(parseInt(parts[0], 10))) {
                displayName = parts.slice(1).join("-");
              }

              allDocuments.push({
                name: displayName,
                path: filePath,
                size: (file.metadata as any)?.size || 0,
                uploadedAt: (file as any).created_at || "",
                signedUrl: signedUrlData.signedUrl,
                documentType: docType,
                profileId,
                profileName,
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ documents: allDocuments }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
