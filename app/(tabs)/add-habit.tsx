import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
// import { StyleSheet, View } from "react-native";
// import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { ID } from "react-native-appwrite";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"]
type Frequency = (typeof FREQUENCIES)[number];
export default function AddHabitScreen() {
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [frequency, setFrequency] = useState<Frequency>("daily")
    const [error, setError] = useState<string | null>("")
    const { user, signOut } = useAuth()
    const theme = useTheme()
    const router = useRouter()


    const handleClear = () => {
        setTitle("")
        setDescription("")
        setFrequency("daily")
        setError(null)
    }

    useFocusEffect(
        useCallback(() => {
            handleClear()
        }, [])
    )


    console.log("user from useAuth :", user)
    const handleSubmit = async () => {
        if (!user) return;
        try {
            await databases.createDocument(DATABASE_ID,
                HABITS_COLLECTION_ID,
                ID.unique(),
                {
                    user_id: user.$id,
                    title,
                    description,
                    frequency,
                    streak_count: 0,
                    last_completed: new Date().toISOString(),
                }
            )
            router.back()

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return;
            }
            setError("There was an error adding the habit")
            console.error(error)
        }
    }

    return (

        <LinearGradient
            colors={["#0f0c29", "#302b63", "#24243e"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        {/* Header */}
                        <Text style={styles.eyebrow}>New Routine</Text>
                        <Text style={styles.heading}>Build a Habit</Text>
                        <Text style={styles.subheading}>Small steps. Big change.</Text>
                        <View style={styles.divider} />

                        {/* Inputs */}
                        <TextInput
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            mode="flat"
                            style={styles.input}
                            underlineColor="transparent"
                            activeUnderlineColor="#a78bfa"
                            textColor="#fff"
                            theme={{
                                colors: {
                                    onSurfaceVariant: "rgba(255,255,255,0.4)",
                                    primary: "#a78bfa",
                                },
                            }}
                        />
                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            mode="flat"
                            style={styles.input}
                            underlineColor="transparent"
                            activeUnderlineColor="#a78bfa"
                            textColor="#fff"
                            multiline
                            numberOfLines={3}
                            theme={{
                                colors: {
                                    onSurfaceVariant: "rgba(255,255,255,0.4)",
                                    primary: "#a78bfa",
                                },
                            }}
                        />

                        {/* Frequency */}
                        <View style={styles.frequencyContainer}>
                            <Text style={styles.frequencyLabel}>Frequency</Text>
                            <View style={styles.pillRow}>
                                {FREQUENCIES?.map((freq) => {
                                    const isActive = frequency === freq;
                                    return (
                                        <Pressable
                                            key={freq}
                                            style={[styles.pill, isActive && styles.pillActive]}
                                            onPress={() => setFrequency(freq)}
                                        >
                                            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* CTA */}
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            disabled={!title || !description}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                            contentStyle={{ paddingVertical: 4 }}
                        >
                            Add Habit ✦
                        </Button>

                        {error && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {error}
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
        elevation: 20,

    },
    eyebrow: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 3,
        color: "#a78bfa",
        textTransform: "uppercase",
        marginBottom: 8,
    },
    heading: {
        fontSize: 30,
        fontWeight: "800",
        color: "#ffffff",
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subheading: {
        fontSize: 14,
        color: "rgba(255,255,255,0.45)",
        marginBottom: 32,
        fontWeight: "400",
    },
    input: {
        marginBottom: 16,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 14,
    },
    frequencyLabel: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1.5,
        color: "rgba(255,255,255,0.5)",
        textTransform: "uppercase",
        marginBottom: 12,
    },
    frequencyContainer: {
        marginBottom: 28,
    },
    pillRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    pill: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.15)",
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    pillActive: {
        backgroundColor: "#7c3aed",
        borderColor: "#7c3aed",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    pillText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        fontWeight: "600",
    },
    pillTextActive: {
        color: "#ffffff",
    },
    button: {
        borderRadius: 16,
        paddingVertical: 6,
        marginTop: 4,
        backgroundColor: "#7c3aed",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    buttonLabel: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    errorText: {
        marginTop: 14,
        textAlign: "center",
        fontSize: 13,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginBottom: 24,
    },
});