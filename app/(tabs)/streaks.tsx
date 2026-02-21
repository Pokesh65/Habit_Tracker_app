import { client, DATABASE_ID, databases, HABIT_COMPLETION_COLLECTION_ID, HABITS_COLLECTION_ID, RealTimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";

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

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.eyebrow}>Your Progress ✦</Text>
                <Text style={styles.title}>Habit Streaks</Text>
            </View>

            {/* Top 3 Podium */}
            {rankedHabits.length > 0 && (
                <View style={styles.rankingContainer}>
                    <View style={styles.rankingTitleRow}>
                        <MaterialCommunityIcons name="trophy" size={18} color="#f59e0b" />
                        <Text style={styles.rankingTitle}>Top Streaks</Text>
                    </View>
                    {rankedHabits.slice(0, 3).map((item, key) => (
                        <View style={styles.rankingRow} key={key}>
                            <View style={[styles.rankingBadge, badgeStyles[key]]}>
                                <Text style={styles.rankingBadgeText}>{key + 1}</Text>
                            </View>
                            <Text style={styles.rankingHabitTitle}>{item.habit.title}</Text>
                            <View style={styles.rankingStreakBadge}>
                                <MaterialCommunityIcons name="fire" size={14} color="#fb923c" />
                                <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Habit Cards */}
            {habits.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrapper}>
                        <MaterialCommunityIcons name="chart-line" size={40} color="#7c3aed" />
                    </View>
                    <Text style={styles.emptyTitle}>No habits yet</Text>
                    <Text style={styles.emptyStateText}>Start tracking habits to see your streaks grow.</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                    {rankedHabits.map(({ streak, bestStreak, total, habit }, key) => (
                        <View
                            style={[styles.card, key === 0 && styles.firstCard]}
                            key={key}
                        >
                            {key === 0 && (
                                <View style={styles.topBanner}>
                                    <MaterialCommunityIcons name="crown" size={14} color="#f59e0b" />
                                    <Text style={styles.topBannerText}>Top Performer</Text>
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.habitTitle}>{habit.title}</Text>
                                    <Text style={styles.rankNumber}>#{key + 1}</Text>
                                </View>
                                <Text style={styles.habitDescription}>{habit.description}</Text>

                                <View style={styles.statsRow}>
                                    {/* Current */}
                                    <View style={styles.statBlock}>
                                        <View style={[styles.statBadge, styles.statBadgeCurrent]}>
                                            <MaterialCommunityIcons name="fire" size={18} color="#fb923c" />
                                            <Text style={styles.statValue}>{streak}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>Current</Text>
                                    </View>

                                    {/* Best */}
                                    <View style={styles.statBlock}>
                                        <View style={[styles.statBadge, styles.statBadgeBest]}>
                                            <MaterialCommunityIcons name="trophy" size={18} color="#f59e0b" />
                                            <Text style={styles.statValue}>{bestStreak}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>Best</Text>
                                    </View>

                                    {/* Total */}
                                    <View style={styles.statBlock}>
                                        <View style={[styles.statBadge, styles.statBadgeTotal]}>
                                            <MaterialCommunityIcons name="check-all" size={18} color="#4ade80" />
                                            <Text style={styles.statValue}>{total}</Text>
                                        </View>
                                        <Text style={styles.statLabel}>Total</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
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
        marginBottom: 24,
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

    // ── Top 3 Ranking ────────────────────────────────────
    rankingContainer: {
        marginBottom: 24,
        backgroundColor: "#1a1535",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "rgba(245,158,11,0.25)",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    rankingTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    rankingTitle: {
        fontWeight: "800",
        fontSize: 16,
        color: "#f59e0b",
        letterSpacing: 0.5,
    },
    rankingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.06)",
    },
    rankingBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    badge1: { backgroundColor: "#d6ae1c" },
    badge2: { backgroundColor: "#6b7280" },
    badge3: { backgroundColor: "#92400e" },
    rankingBadgeText: {
        fontWeight: "800",
        color: "#fff",
        fontSize: 15,
    },
    rankingHabitTitle: {
        flex: 1,
        fontSize: 15,
        color: "#ffffff",
        fontWeight: "600",
    },
    rankingStreakBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(251,146,60,0.12)",
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "rgba(251,146,60,0.25)",
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    rankingStreak: {
        fontSize: 13,
        color: "#fb923c",
        fontWeight: "800",
    },

    // ── Habit Card ───────────────────────────────────────
    card: {
        marginBottom: 14,
        borderRadius: 20,
        backgroundColor: "#1a1535",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
        overflow: "hidden",
    },
    firstCard: {
        borderColor: "#f59e0b",
        backgroundColor: "#1c1428",
        shadowColor: "#f59e0b",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    topBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(245,158,11,0.12)",
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(245,158,11,0.2)",
    },
    topBannerText: {
        color: "#f59e0b",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    cardContent: {
        padding: 18,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    habitTitle: {
        fontWeight: "800",
        fontSize: 18,
        color: "#ffffff",
        letterSpacing: -0.3,
        flex: 1,
    },
    rankNumber: {
        fontSize: 13,
        color: "rgba(255,255,255,0.25)",
        fontWeight: "700",
    },
    habitDescription: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 18,
    },

    // ── Stat Blocks ──────────────────────────────────────
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    statBlock: {
        flex: 1,
        alignItems: "center",
        gap: 6,
    },
    statBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 10,
        width: "100%",
    },
    statBadgeCurrent: {
        backgroundColor: "rgba(251,146,60,0.1)",
        borderColor: "rgba(251,146,60,0.25)",
    },
    statBadgeBest: {
        backgroundColor: "rgba(245,158,11,0.1)",
        borderColor: "rgba(245,158,11,0.25)",
    },
    statBadgeTotal: {
        backgroundColor: "rgba(74,222,128,0.1)",
        borderColor: "rgba(74,222,128,0.25)",
    },
    statValue: {
        fontWeight: "800",
        fontSize: 16,
        color: "#ffffff",
    },
    statLabel: {
        fontSize: 11,
        color: "rgba(255,255,255,0.35)",
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
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
});