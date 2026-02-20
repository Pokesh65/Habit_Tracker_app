import { client, DATABASE_ID, databases, HABIT_COMPLETION_COLLECTION_ID, HABITS_COLLECTION_ID, RealTimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
    const { user, signOut } = useAuth()
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);


    // useEffect(() => {
    //     if (user) {
    //         fetchHabits()
    //         fetchCompletions()
    //     }
    // }, [user])

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
                        fetchCompletions()
                    }

                }
            )


            fetchHabits()
            fetchCompletions()

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

    const fetchCompletions = async () => {
        try {

            const response = await databases.listDocuments<HabitCompletion>(
                DATABASE_ID,
                HABIT_COMPLETION_COLLECTION_ID,
                [
                    Query.equal("user_id", user?.$id ?? ""),

                ])

            setCompletedHabits(response.documents ?? [])

        } catch (error) {
            console.error(error)
        }
    }

    interface StreakData {
        streak: number,
        bestStreak: number,
        total: number
    }

    // const getStreakData = (habitId: string): StreakData => {
    //     const habitCompletions = completedHabits
    //         ?.filter((c) => c.habit_id === habitId)
    //         .sort(
    //             (a, b) =>
    //                 new Date(a.completed_at).getTime() -
    //                 new Date(b.completed_at).getTime()
    //         ) || []

    //     if (habitCompletions.length === 0) {
    //         return {
    //             streak: 0,
    //             bestStreak: 0,
    //             total: 0
    //         }
    //     }

    //     let bestStreak = 0
    //     let currentStreak = 0
    //     let lastDate: Date | null = null

    //     habitCompletions.forEach((c) => {
    //         const date = new Date(c.completed_at)

    //         if (lastDate) {
    //             const diffInDays =
    //                 (date.getTime() - lastDate.getTime()) /
    //                 (1000 * 60 * 60 * 24)

    //             if (diffInDays <= 1.5) {
    //                 currentStreak++
    //             } else {
    //                 currentStreak = 1
    //             }
    //         } else {
    //             currentStreak = 1
    //         }

    //         // update best streak every loop
    //         if (currentStreak > bestStreak) {
    //             bestStreak = currentStreak
    //         }

    //         // move lastDate forward
    //         lastDate = date
    //     })

    //     return {
    //         streak: currentStreak,   // current active streak
    //         bestStreak,              // highest streak ever
    //         total: habitCompletions.length
    //     }
    // }



    const getStreakData = (habitId: string): StreakData => {
        const habitCompletions = completedHabits
            ?.filter((c) => c.habit_id === habitId).sort((a, b) =>
                new Date(a.completed_at).getTime() -
                new Date(b.completed_at).getTime()
            )

        if (!habitCompletions || habitCompletions.length === 0) {
            return { streak: 0, bestStreak: 0, total: 0 }
        }

        let bestStreak = 1
        let currentStreak = 0
        let streak = 0
        let total = habitCompletions.length
        let lastDate: Date | null = null

        habitCompletions.forEach((c) => {
            const date = new Date(c.completed_at)

            if (lastDate) {
                const diff =
                    (date.getTime() - lastDate.getTime()) /
                    (1000 * 60 * 60 * 24)

                if (diff <= 1) {
                    currentStreak += 1
                } else {
                    currentStreak = 1
                }
            } else {
                currentStreak = 1
            }

            if (currentStreak > bestStreak) {
                bestStreak = currentStreak
            }

            streak = currentStreak
            lastDate = date
        })

        return {
            streak,
            bestStreak,
            total,
        }
    }





    const habitStreaks = habits.map((habit) => {
        const { streak, bestStreak, total } = getStreakData(habit.$id)
        return { habit, streak, bestStreak, total }
    })

    const rankedHabits = [...habitStreaks].sort(
        (a, b) => b.bestStreak - a.bestStreak
    )

    console.log("rankedHabits", rankedHabits)



    const badgeStyles = [styles.badge1, styles.badge2, styles.badge3]


    return (
        <View style={styles.container}>

            <Text style={styles.title}> Habit Streaks</Text>
            {rankedHabits.length > 0 && (
                <View style={styles.rankingContainer}>
                    <Text style={styles.rankingTitle}>🥇Top Streaks</Text>
                    {rankedHabits?.slice(0, 3).map((item, key) => (
                        <View style={styles.rankingRow} key={key}>
                            <View style={[styles.rankingBadge, badgeStyles[key]]}>
                                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
                            </View>

                            <Text style={styles.rankingHabitTitle}>{item.habit.title}</Text>

                            <Text style={styles.rankingStreak}>{item.bestStreak}</Text>

                        </View>
                    ))}
                </View>
            )}

            {habits.length === 0 ? (
                <View >
                    <Text >No habits found. Add your first Habit!</Text>
                </View>
            ) : (
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    {rankedHabits.map(({ streak, bestStreak, total, habit }, key) => (
                        <Card style={[styles.card, key === 0 && styles.firstCard]} key={key}>
                            <Card.Content>
                                <Text style={styles.habitTitle}>{habit.title}</Text>
                                <Text style={styles.habitDescription}>{habit.description}</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.statBadgeText}>❤️‍🔥 {streak}</Text>
                                        <Text style={styles.statLabel}> Current</Text>
                                    </View>
                                    <View style={styles.statBadgeGold}>
                                        <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
                                        <Text style={styles.statLabel}> Best</Text>
                                    </View>
                                    <View style={styles.statBadgeGreen}>
                                        <Text style={styles.statBadgeText}>☯️ {total}</Text>
                                        <Text style={styles.statLabel}> Total</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5"
    },
    title: {
        fontWeight: "bold",
        marginBottom: 24
    },
    card: {
        marginBottom: 18,
        borderRadius: 18,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f0f0f0"

    },
    firstCard: {
        borderWidth: 2,
        borderColor: "#7c4dff",
        // backgroundColor: "#f0fcd5"
    },
    habitTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 2
    },
    habitDescription: {
        color: "#6c6c80",
        marginBottom: 8

    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 12
    },
    statBadge: {
        backgroundColor: "#fff3e0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: "center",
        minWidth: 60
    },
    statBadgeGold: {
        backgroundColor: "#fcf7bd",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: "center",
        minWidth: 60
    },
    statBadgeGreen: {
        backgroundColor: "#f1ffe0",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: "center",
        minWidth: 60
    },
    statBadgeText: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#22223b"
    },
    statLabel: {

        fontSize: 12,
        color: "#888",
        marginTop: 2,
        fontWeight: "500"
    },
    rankingContainer: {
        marginBottom: 24,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0"
    },
    rankingTitle: {
        fontWeight: "bold",
        marginBottom: 12,
        fontSize: 18,
        color: "#7c4dff",
        letterSpacing: 0.5
    },
    rankingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingBottom: 8
    },
    rankingBadge: {
        width: 28,
        height: 28,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e0e0e0",
        marginRight: 10
    },
    badge1: {
        backgroundColor: "#ffd700"
    },
    badge2: {
        backgroundColor: "#c0c0c0"
    },
    badge3: {
        backgroundColor: "#cd7f32"
    },
    rankingBadgeText: {
        fontWeight: "bold",
        color: "#fff",
        fontSize: 16
    },
    rankingHabitTitle: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        fontWeight: "600"
    },
    rankingStreak: {
        fontSize: 14,
        color: "#7c4dff",
        fontWeight: "bold"
    },




})