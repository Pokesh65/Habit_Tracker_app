// import { AuthProvider, useAuth } from "@/lib/auth-context";
// import { Stack, useRouter, useSegments } from "expo-router";
// import { useEffect } from "react";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { PaperProvider } from "react-native-paper";
// import { SafeAreaProvider } from "react-native-safe-area-context";


// function RouteGuard({ children }: { children: React.ReactNode }) {

//   const { user: isAuth, isLocadingUser } = useAuth();
//   const segments = useSegments()
//   console.log("segments", segments)
//   const router = useRouter();


//   useEffect(() => {
//     const inAuthGroup = segments[0] === "auth";

//     if (!isAuth && !inAuthGroup && !isLocadingUser) {
//       router.replace("/auth");
//     }
//     else if (isAuth && inAuthGroup && !isLocadingUser) {
//       router.replace("/");
//     }

//   }, [isAuth, segments]);

//   return <>{children}</>
// }


// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <AuthProvider>
//         <PaperProvider>
//           <SafeAreaProvider>
//             <RouteGuard>
//               <Stack>
//                 <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//                 <Stack.Screen name="/auth" options={{ headerShown: false }} />
//               </Stack>
//             </RouteGuard>
//           </SafeAreaProvider>
//         </PaperProvider>
//       </AuthProvider>
//     </GestureHandlerRootView>
//   );
// }


import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Custom theme matching your purple dark aesthetic
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#7c3aed",
    secondary: "#a78bfa",
    background: "#0f0c29",
    surface: "rgba(255,255,255,0.07)",
    surfaceVariant: "rgba(255,255,255,0.07)",
    onSurface: "#ffffff",
    onSurfaceVariant: "rgba(255,255,255,0.4)",
    outline: "rgba(255,255,255,0.15)",
    error: "#f87171",
  },
};

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user: isAuth, isLocadingUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLocadingUser) return; // Wait until auth state is resolved

    const inAuthGroup = segments[0] === "auth";

    if (!isAuth && !inAuthGroup) {
      router.replace("/auth");
    } else if (isAuth && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuth, segments, isLocadingUser]); // Added isLocadingUser to deps

  if (isLocadingUser) return null; // Prevent flash of wrong screen

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}