import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";

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
        <View style={styles.container}>
            <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
            <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" style={styles.input} />
            <View style={styles.frequencyContainer}>
                <SegmentedButtons buttons={FREQUENCIES?.map((freq) => ({
                    value: freq,
                    label: freq.charAt(0).toUpperCase() + freq.slice(1)
                }))}
                    value={frequency}
                    onValueChange={(value) => setFrequency(value as Frequency)}
                    style={styles.segmentedButtons} />
            </View>
            <Button mode="contained" onPress={handleSubmit} disabled={!title || !description} style={styles.button}>Add habit</Button>
            {error && <Text style={{ color: theme.colors.error, textAlign: "center" }}>{error}</Text>}
            {/* <Button onPress={signOut} mode="contained" icon={"logout"}>Sign Out</Button> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
        justifyContent: "center"

    },
    input: {
        marginBottom: 16,

    },
    frequencyContainer: {
        marginBottom: 24,
    },
    segmentedButtons: {
        // marginBottom: 16,
    },
    button: {
        // marginTop: 8,
    }

})