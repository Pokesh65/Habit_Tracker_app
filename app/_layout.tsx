import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";


function RouteGuard({ children }: { children: React.ReactNode }) {

  const { user: isAuth, isLocadingUser } = useAuth();
  const segments = useSegments()
  console.log("segments", segments)
  const router = useRouter();


  // useEffect(() => {
  //   const inAuthGroup = segments[0] === 'auth'

  //   if (!isAuth && !inAuthGroup && !isLocadingUser) {
  //     <Redirect href="/auth" />;
  //   } else if (isAuth && inAuthGroup && !isLocadingUser) {
  //     <Redirect href="/" />;
  //   }

  // }, [isAuth, segments]);


  useEffect(() => {
    const inAuthGroup = segments[0] === "auth";

    if (!isAuth && !inAuthGroup && !isLocadingUser) {
      router.replace("/auth");
    }
    else if (isAuth && inAuthGroup && !isLocadingUser) {
      router.replace("/");
    }

  }, [isAuth, segments]);

  return <>{children}</>
}


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="/auth" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
