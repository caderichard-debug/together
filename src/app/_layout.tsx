import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DataProvider } from '../lib/data';
import { FavoritesProvider } from '../lib/favorites';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <DataProvider>
      <FavoritesProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.brand,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Together' }} />
          <Stack.Screen name="couple/[id]" options={{ title: '' }} />
        </Stack>
      </FavoritesProvider>
    </DataProvider>
  );
}
