import { Slot } from 'expo-router';

import { AuthProvider } from '@/context/AuthContext';
import { TeamProvider } from '@/context/TeamContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TeamProvider>
        <Slot />
      </TeamProvider>
    </AuthProvider>
  );
}