import { nameFromEmail } from '@/lib/format';
import { useUser } from './session-store';

/** Name for the avatar: profile name if set, else derived from the email. Null when signed out. */
export function useDisplayName() {
  const user = useUser();
  if (!user) return null;
  const fullName = user.user_metadata?.full_name;
  if (typeof fullName === 'string' && fullName.trim()) return fullName;
  return user.email ? nameFromEmail(user.email) : 'Reader';
}
