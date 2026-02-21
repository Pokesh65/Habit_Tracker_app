// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import { Tabs } from "expo-router";


// export default function TabsLayout() {

//   return (
//     <Tabs screenOptions={{
//       headerStyle: { backgroundColor: "#f5f5f5" },
//       headerShadowVisible: false,
//       headerTitleAlign: "center",
//       tabBarStyle: {
//         backgroundColor: "#f5f5f5",
//         borderTopWidth: 0,
//         elevation: 0,
//         shadowOpacity: 0
//       },
//       tabBarActiveTintColor: "#6200ee",
//       tabBarInactiveTintColor: "#666666"
//     }}>
//       <Tabs.Screen name="index" options={{
//         title: "Today's Habits",
//         tabBarIcon: ({ color, size }) => {

//           return <MaterialCommunityIcons name="calendar-today" size={size} color={color} />

//         }
//       }} />
//       <Tabs.Screen name="streaks" options={{
//         title: "Streaks",
//         tabBarIcon: ({ color, size }) => {

//           return <MaterialCommunityIcons name="chart-line" size={size} color={color} />

//         }
//       }} />
//       <Tabs.Screen name="add-habit" options={{
//         title: "Add Habit",
//         tabBarIcon: ({ color, size }) => {

//           return <MaterialCommunityIcons name="plus-circle" size={size} color={color} />

//         }
//       }} />

//       {/* <Tabs.Screen name="login" options={{
//         title: "Login",
//         tabBarIcon: ({ color }) => <AntDesign name="login" size={24} color={color} />

//       }} /> */}

//     </Tabs>
//   );

// }


import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0f0c29",
        },
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: "#ffffff",
          fontWeight: "800",
          fontSize: 18,
          letterSpacing: 0.3,
        },
        // ← removed headerBackground: () => null,
        sceneContainerStyle: {
          backgroundColor: "#0f0c29", // ← fills screen body too
        },
        tabBarStyle: {
          backgroundColor: "#1a1535",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#a78bfa",
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "calendar-today" : "calendar-today-outline" as any}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "chart-line" : "chart-line-variant"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={size}
              color={color}
              style={{
                shadowColor: "#7c3aed",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: focused ? 0.7 : 0,
                shadowRadius: 10,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}