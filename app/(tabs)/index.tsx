import { client, DATABASE_ID, databases, HABIT_COMPLETION_COLLECTION_ID, HABITS_COLLECTION_ID, RealTimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

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
    if (!habitToDelete) return

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitToDelete
      )

      SwipeableRef.current[habitToDelete]?.close()
    } catch (error) {
      console.error("Error deleting habit:", error)
    } finally {
      setDeleteModalVisible(false)
      setHabitToDelete(null)
    }
  }
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





  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Today's Habits</Text>
        <Button onPress={signOut} mode="text" icon={"logout"}>Sign Out</Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText} >No habits found. Add your first Habit!</Text>
          </View>) : (
          habits?.map((habit, key) => (
            <Swipeable key={key} ref={(el) => {
              SwipeableRef.current[habit.$id] = el
            }}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={() => renderRightActions(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") {
                  handleDeleteHabit(habit.$id)
                } else if (direction === "right") {
                  handleCompleteHabit(habit.$id)
                }
                SwipeableRef.current[habit.$id]?.close()
              }}>
              <Surface style={[styles.card, isHabitCompleted(habit.$id) && styles.cardCompleted]} >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit.title}</Text>
                  <Text style={styles.cardDescription}>{habit.description}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"} />
                      <Text style={styles.streakText}>{habit.streak_count} day streak</Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      {/* {" "} */}
                      <Text style={styles.frequencyText}>{habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>

      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="fade"  
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Habit</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this habit?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false)
                  setHabitToDelete(null)
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteHabit}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",

  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#d0f1e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4

  },
  cardCompleted: {
    opacity: 0.6

  },
  cardContent: {
    padding: 20
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b"
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14
  },
  frequencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyStateText: {
    color: "#6c6c80"
  },
  swipeActionsLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e63535dd",
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingLeft: 16



  },
  swipeActionsRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#36e83fd0",
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingRight: 16

  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
  },
})
