import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isAuthenticated } from '@/services/auth';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  //BLOCCAVA TUTTA L'APP IMPEDENDO IL LOGIN E IL LOGOUT 
/*   useEffect(() => {
    async function checkAuthStatus() {
      const auth = await isAuthenticated();
      setAuthStatus(auth);
    }
    checkAuthStatus();
  }, []); */

  useEffect(() => {
    if (authStatus === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    console.log('Stato autenticazione:', authStatus, 'Segmento:', segments[0]);

    if (!authStatus && !inAuthGroup) {
      console.log('Reindirizzamento a login');
      router.replace('/(auth)/login');
    } else if (authStatus && inAuthGroup) {
      console.log('Reindirizzamento a tabs');
      router.replace('/(tabs)');
    }
  }, [authStatus, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
    </ThemeProvider>
  );
}