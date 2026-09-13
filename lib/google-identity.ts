// This input must come from Supabase auth.getUser(), never from browser form data.
type GoogleIdentityUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: Record<string, unknown>;
  identities?: {provider: string; identity_data?: Record<string, unknown>}[];
};
export function verifiedGoogleIdentity(user: GoogleIdentityUser) {
  if (!user.email || !user.email_confirmed_at) return null;
  const email = user.email.trim().toLowerCase();
  const identity = user.identities?.find(i => i.provider === 'google'
    && i.identity_data?.email_verified === true
    && typeof i.identity_data.email === 'string'
    && i.identity_data.email.trim().toLowerCase() === email);
  if (!identity) return null;
  const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null;
  return {userId:'supabase:'+user.id,email,displayName:name||email,fullName:name,
    provider:'google' as const,googleEmailVerified:true as const};
}
