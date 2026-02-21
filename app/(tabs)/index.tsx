import { client, DATABASE_ID, databases, HABIT_COMPLETION_COLLECTION_ID, HABITS_COLLECTION_ID, RealTimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function Index() {
  const { user, signOut } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const SwipeableRef = useRef<{ [key: string]: Swipeable | null }>({})

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const habitsChennal = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`
      const habitsSubscription = client.subscribe(
        habitsChennal,
        (response: RealTimeResponse) => {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            fetchHabits()
          } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
            fetchHabits()
          } else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
            fetchHabits()
          }

        }
      )


      const habitsCompletionChennal = `databases.${DATABASE_ID}.collections.${HABIT_COMPLETION_COLLECTION_ID}.documents`
      const habitsCompletionSubscription = client.subscribe(
        habitsCompletionChennal,
        (response: RealTimeResponse) => {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            fetchTodayCompletions()
          }

        }
      )


      fetchHabits()
      fetchTodayCompletions()

      return () => {
        habitsSubscription()
        habitsCompletionSubscription()
      }
    }
  }, [user])


  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments<Habit>(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? "")
        ]
      );
      console.log(response);
      setHabits(response.documents); // ✅ No casting needed

    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID,
        HABIT_COMPLETION_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ])

      const completions = response.documents?.map((c => c.habit_id))
      console.log("completions :", completions)
      setCompletedHabits(completions ?? [])

    } catch (error) {
      console.error(error)
    }
  }

  const renderLeftActions = () => (
    <View style={styles.swipeActionsLeft}>
      <MaterialCommunityIcons name="trash-can-outline" size={32} color={"#ffffff"} />
    </View>
  )
  const renderRightActions = (habitId: string) => (
    <View style={styles.swipeActionsRight}>
      {isHabitCompleted(habitId) ? (
        <Text
          style={{
            color: "#ffffff",
            fontWeight: "bold",
            fontSize: 14,
            textShadowColor: "rgba(0, 0, 0, 0.6)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          Completed!
        </Text>

      ) : (

        <MaterialCommunityIcons name="check-circle-outline" size={32} color={"#ffffff"} />
      )}
    </View>
  )

  // const handleDeleteHabit = async (id: string) => {
  //   try {
  //     const permisions = confirm("Are you sure you want to delete this habit?")
  //     if (permisions) {
  //       if (!permisions) return;
  //       await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
  //     }
  //     SwipeableRef.current[id]?.close()
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }


  const handleDeleteHabit = (id: string) => {
    setHabitToDelete(id)
    setDeleteModalVisible(true)
  }

  const confirmDeleteHabit = async () => {
    if (!habitToDelete) return;

    try {
      // Delete the habit
      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitToDelete
      );

      // Find all completions with this habit_id
      const completions = await databases.listDocuments(
        DATABASE_ID,
        HABIT_COMPLETION_COLLECTION_ID,
        [
          Query.equal("habit_id", habitToDelete),
          Query.equal("user_id", user?.$id ?? "")
        ]
      );

      console.log("completions :", completions)


      // Delete each completion individually
      await Promise.all(
        completions.documents.map((doc) =>
          databases.deleteDocument(
            DATABASE_ID,
            HABIT_COMPLETION_COLLECTION_ID,
            doc.$id
          )
        )
      );

      SwipeableRef.current[habitToDelete]?.close();
      Toast.show({ type: "success", text1: "Habit deleted successfully." });
    } catch (error) {
      console.error("Error deleting habit:", error);
      Toast.show({ type: "error", text1: "Failed to delete habit." });
    } finally {
      setDeleteModalVisible(false);
      setHabitToDelete(null);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentData = new Date().toISOString()

      await databases.createDocument(
        DATABASE_ID,
        HABIT_COMPLETION_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user?.$id,
          completed_at: currentData,

        }

      );

      const habit = habits?.find((h) => h.$id === id)
      console.log(habit)
      if (!habit) return;

      const updatedHabit = {
        ...habit,
        streak_count: habit.streak_count + 1,
        last_completed: currentData
      }

      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, updatedHabit)

    } catch (error) {
      console.error(error)
    }
  }



  const isHabitCompleted = (habitId: string) => completedHabits?.includes(habitId)


  const getGreeting = (): string => {
    const hour = new Date().getHours();
    console.log("current hour :", hour)
    if (hour >= 5 && hour < 12) return "Good Morning ☀️"
    if (hour >= 12 && hour < 17) return "Good Afternoon 🌤️"
    if (hour >= 17 && hour < 21) return "Good Evening 🌆"
    return "Good Night 🌙"
  }


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{getGreeting()}</Text>
          <Text style={styles.title}>Today's Habits</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <MaterialCommunityIcons name="logout" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          {
            paddingBottom: 32,    // ← was 24, give more room
            paddingTop: 4,
          }}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <MaterialCommunityIcons name="leaf" size={40} color="#7c3aed" />
            </View>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyStateText}>Add your first habit and start building momentum.</Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              key={key}
              ref={(el) => { SwipeableRef.current[habit.$id] = el }}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") handleDeleteHabit(habit.$id);
                else if (direction === "right") handleCompleteHabit(habit.$id);
                SwipeableRef.current[habit.$id]?.close();
              }}
            >
              <Surface
                style={[
                  styles.card,
                  !isHabitCompleted(habit.$id) && styles.cardActive,   // purple glow if active
                  isHabitCompleted(habit.$id) && styles.cardCompleted  // muted if done
                ]}>
                {isHabitCompleted(habit.$id) && (
                  <View style={styles.completedBanner}>
                    <MaterialCommunityIcons name="check-circle" size={14} color="#4ade80" />
                    <Text style={styles.completedBannerText}>Completed</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>{habit.description}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons name="fire" size={16} color="#fb923c" />
                      <Text style={styles.streakText}>{habit.streak_count} day streak</Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>

      {/* Delete Modal */}
      <Modal transparent visible={deleteModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconWrapper}>
              <MaterialCommunityIcons name="trash-can-outline" size={28} color="#f87171" />
            </View>
            <Text style={styles.modalTitle}>Delete Habit</Text>
            <Text style={styles.modalMessage}>
              This will permanently delete your habit and reset your streak. Are you sure?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setDeleteModalVisible(false); setHabitToDelete(null); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDeleteHabit}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#fff" />
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29",
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "#a78bfa",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  signOutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },


  card: {
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: "#1a1535",        // base for all cards
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },

  // ✅ Active — needs to be done, stands out with purple glow
  cardActive: {
    backgroundColor: "#1e1248",        // rich deep purple
    borderColor: "#7c3aed",            // solid vivid purple border
    shadowColor: "#7c3aed",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },

  // ✅ Completed — clearly done, calm green signal
  cardCompleted: {
    backgroundColor: "#0d1f1a",        // deep dark green tint
    borderColor: "#16a34a",            // solid green border
    shadowColor: "#16a34a",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    opacity: 0.75,
  },

  // update banner to match completed green
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#14532d",        // solid dark green
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#16a34a",
  },
  completedBannerText: {
    color: "#4ade80",                  // bright green text
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 5,
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 18,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(251,146,60,0.12)",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(251,146,60,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  streakText: {
    color: "#fb923c",
    fontWeight: "700",
    fontSize: 13,
  },
  frequencyBadge: {
    backgroundColor: "rgba(124,58,237,0.2)",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  frequencyText: {
    color: "#a78bfa",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Swipe Actions ────────────────────────────────────
  swipeActionsLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#ef444480",
    borderRadius: 20,
    marginBottom: 14,
    paddingLeft: 20,
  },
  swipeActionsRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#22c55e80",
    borderRadius: 20,
    marginBottom: 14,
    paddingRight: 20,
  },

  // ── Empty State ──────────────────────────────────────
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(124,58,237,0.15)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },

  // ── Modal ────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1a1535",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(242, 51, 51, 0.52)",
    shadowColor: "#ee5a5ad5",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
    alignItems: "center",
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(248,113,113,0.1)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelText: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 15,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
