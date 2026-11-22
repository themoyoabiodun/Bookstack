import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { sendSignInCode, signOut, verifySignInCode } from '@/features/auth/auth';
import { useUser } from '@/features/auth/session-store';
import { useDisplayName } from '@/features/auth/use-display-name';
import { syncNow } from '@/features/sync/engine';
import { useSyncStore } from '@/features/sync/sync-store';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';
import { isSyncConfigured } from '@/lib/supabase';
import { colors } from '@/theme/tokens';

export default function AccountScreen() {
  const user = useUser();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <Text variant="h2">{user ? 'Account' : 'Sync your shelf'}</Text>
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <X size={22} color={colors.content} />
        </IconButton>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!isSyncConfigured ? <NotConfigured /> : user ? <SignedIn /> : <SignInForm />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NotConfigured() {
  return (
    <Text className="mt-4 px-4 text-content-secondary">
      Accounts aren’t set up in this build yet. Add your Supabase URL and key to .env.local (see
      .env.example), then restart the dev server.
    </Text>
  );
}

function SignInForm() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailLooksValid = /^\S+@\S+\.\S+$/.test(email.trim());

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      await sendSignInCode(email);
      setStep('code');
    });

  // On success the session updates and this screen switches to the signed-in view.
  const verify = () => run(() => verifySignInCode(email, code));

  return (
    <View className="flex-1 px-4">
      <Text className="mt-2 text-content-secondary">
        {step === 'email'
          ? 'Back up your books and keep them in sync on all your phones. We’ll email you a sign-in code — no password needed.'
          : `Enter the code we sent to ${email.trim()}.`}
      </Text>

      {step === 'email' ? (
        <Field
          key="email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          onSubmitEditing={() => emailLooksValid && sendCode()}
        />
      ) : (
        <Field
          key="code"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
          placeholder="123456"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={10}
          className="tracking-[4px]"
          onSubmitEditing={() => code.length >= 6 && verify()}
        />
      )}

      {error && <Text className="mt-3 text-warning">{error}</Text>}

      <View className="flex-1" />

      {step === 'email' ? (
        <Button
          label={busy ? 'Sending…' : 'Email me a code'}
          size="lg"
          disabled={!emailLooksValid || busy}
          onPress={sendCode}
        />
      ) : (
        <View className="gap-3">
          <Button
            label={busy ? 'Checking…' : 'Sign in'}
            size="lg"
            disabled={code.length < 6 || busy}
            onPress={verify}
          />
          <Pressable
            onPress={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
            className="h-11 items-center justify-center"
            accessibilityRole="button">
            <Text variant="body-sm-semibold" className="text-content-secondary">
              Use a different email
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function SignedIn() {
  const user = useUser();
  const name = useDisplayName();
  const { status, lastSyncedAt, error } = useSyncStore();
  const [signingOut, setSigningOut] = useState(false);

  const doSignOut = async (force = false) => {
    setSigningOut(true);
    try {
      const { unsynced } = await signOut({ force });
      if (unsynced > 0) {
        Alert.alert(
          'Some changes haven’t synced',
          `${unsynced} ${unsynced === 1 ? 'change' : 'changes'} on this phone haven’t reached your account yet. If you sign out now, they’ll be lost.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out anyway', style: 'destructive', onPress: () => doSignOut(true) },
          ],
        );
        return;
      }
      router.back();
    } finally {
      setSigningOut(false);
    }
  };

  const syncLabel =
    status === 'syncing'
      ? 'Syncing…'
      : status === 'error'
        ? 'Couldn’t sync'
        : lastSyncedAt
          ? formatRelativeTime(lastSyncedAt)
          : 'Not yet';

  return (
    <View className="flex-1 px-4">
      <View className="mt-4 overflow-hidden rounded-2xl bg-surface-subtle">
        <Row label="Name" value={name ?? ''} />
        <Row label="Email" value={user?.email ?? ''} />
        <Row label="Last synced" value={syncLabel} warn={status === 'error'} />
      </View>
      {status === 'error' && error && (
        <Text className="mt-3 px-1 text-content-secondary">{error}</Text>
      )}

      <View className="flex-1" />

      <View className="gap-3">
        <Button
          label="Sync now"
          tone="secondary"
          size="lg"
          disabled={status === 'syncing'}
          onPress={() => void syncNow()}
        />
        <Button
          label={signingOut ? 'Signing out…' : 'Sign out'}
          size="lg"
          disabled={signingOut}
          onPress={() => doSignOut()}
        />
      </View>
    </View>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View className="h-12 flex-row items-center justify-between gap-4 px-3">
      <Text variant="body-lg-medium" className="text-content-secondary">
        {label}
      </Text>
      <Text
        variant="body-lg-semibold"
        numberOfLines={1}
        className={cn('shrink', warn && 'text-warning')}>
        {value}
      </Text>
    </View>
  );
}

function Field({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      autoFocus
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={colors.contentSecondary}
      className={cn(
        'mt-6 h-[54px] rounded-full bg-surface-subtle px-5 font-body text-body-lg text-content',
        className,
      )}
      {...props}
    />
  );
}
