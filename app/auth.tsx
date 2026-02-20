import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function AuthScreen() {

    const [isSignUp, setIsSignUp] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string | null>("")
    const router = useRouter()

    const theme = useTheme()
    const { signIn, signUp } = useAuth();


    const handleAuth = async () => {
        try {
            if (!email || !password) {
                setError("Please fill all required fields!")
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters long!")
                return;
            }

            setError(null)

            if (isSignUp) {
                const error = await signUp(email, password)
                if (error) {
                    setError(error)
                    return
                }
            } else {
                const error = await signIn(email, password)
                if (error) {
                    setError(error)
                    return
                }
                router.replace("/")


            }

            // router.replace("/"); // go to tabs after login
        } catch (error) {
            Alert.alert("Error", "Login failed");
        }
    };

    const handleSwithMode = () => {
        setIsSignUp((prev) => !prev)
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : "padding"}>
            <View
                style={styles.content}
            >
                <Text
                    variant="headlineMedium"
                    style={styles.title}
                >{isSignUp ? "Create Account" : "Welcome Back"}</Text>

                <TextInput
                    style={styles.input}
                    label="Email *"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    mode="outlined"
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    secureTextEntry
                    label={`Password *`}
                    autoCapitalize="none"
                    mode="outlined"
                    onChangeText={setPassword}
                />
                {error && <Text style={{ color: theme.colors.error, textAlign: "center" }}>{error}</Text>}

                <Button
                    onPress={handleAuth}
                    style={styles.button}
                    mode="contained">{isSignUp ? "Sign Up" : "Sign In"}</Button>
                <Button mode="text"
                    onPress={handleSwithMode}
                >{isSignUp ? "Already have an account? Sing In" : "Don't have an account? Sign Up"}</Button>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 24,
        // fontStyle: "italic",
        fontWeight: "bold",
        marginBottom: 24
    },
    input: {
        marginBottom: 12,
        textAlign: "left",
    },
    button: {
        marginBottom: 24,
        textAlign: "center",
        marginTop: 8
    },

})