import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    StyleSheet, View
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

import { LinearGradient } from "expo-linear-gradient";
const { height } = Dimensions.get("window");

export default function AuthScreen() {

    const [isSignUp, setIsSignUp] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string | null>("")
    const router = useRouter()

    const theme = useTheme()
    const { signIn, signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);


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
        <LinearGradient
            colors={["#0f0c29", "#302b63", "#24243e"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.gradient}
        >
            {/* Decorative orbs for depth */}
            <View style={styles.orbTop} />
            <View style={styles.orbBottom} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.content}>

                    {/* Logo / Icon area */}
                    <View style={styles.iconWrapper}>
                        <LinearGradient
                            colors={["#7c3aed", "#a855f7"]}
                            style={styles.iconGradient}
                        >
                            <Text style={styles.iconEmoji}>✦</Text>
                        </LinearGradient>
                    </View>

                    {/* Heading */}
                    <Text style={styles.eyebrow}>
                        {isSignUp ? "Get Started" : "Welcome Back"}
                    </Text>
                    <Text style={styles.heading}>
                        {isSignUp ? "Create your account" : "Sign in to continue"}
                    </Text>
                    <Text style={styles.subheading}>
                        {isSignUp
                            ? "Start building habits that stick."
                            : "Your habits are waiting for you."}
                    </Text>

                    {/* Card */}
                    <View style={styles.card}>
                        <TextInput
                            label="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholder="example@gmail.com"
                            mode="flat"
                            onChangeText={setEmail}
                            style={styles.input}
                            underlineColor="transparent"
                            activeUnderlineColor="#a78bfa"
                            textColor="#fff"
                            left={<TextInput.Icon icon="email-outline" color="rgba(255,255,255,0.35)" />}
                            theme={{
                                colors: {
                                    onSurfaceVariant: "rgba(255,255,255,0.4)",
                                    primary: "#a78bfa",
                                },
                            }}
                        />

                        <TextInput
                            label="Password"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            mode="flat"
                            onChangeText={setPassword}
                            style={[styles.input, { marginBottom: 0 }]}
                            underlineColor="transparent"
                            activeUnderlineColor="#a78bfa"
                            textColor="#fff"
                            left={<TextInput.Icon icon="lock-outline" color="rgba(255,255,255,0.35)" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off-outline" : "eye-outline"}
                                    color="rgba(255,255,255,0.35)"
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            theme={{
                                colors: {
                                    onSurfaceVariant: "rgba(255,255,255,0.4)",
                                    primary: "#a78bfa",
                                },
                            }}
                        />
                    </View>

                    {/* Error */}
                    {error && (
                        <Text style={[styles.errorText, { color: theme.colors.error }]}>
                            {error}
                        </Text>
                    )}

                    {/* Primary CTA */}
                    <Button
                        onPress={handleAuth}
                        mode="contained"
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        contentStyle={{ paddingVertical: 6 }}
                    >
                        {isSignUp ? "Create Account ✦" : "Sign In ✦"}
                    </Button>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Switch mode */}
                    <Pressable onPress={handleSwithMode} style={styles.switchRow}>
                        <Text style={styles.switchText}>
                            {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        </Text>
                        <Text style={styles.switchLink}>
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </Text>
                    </Pressable>


                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Created by </Text>
                        <Pressable onPress={() => Linking.openURL("https://www.linkedin.com/in/pokesh-kumar/")}>
                            <Text style={styles.footerLink}>Pokesh</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}


const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    // Decorative background orbs
    orbTop: {
        position: "absolute",
        top: -80,
        right: -60,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "rgba(124, 58, 237, 0.25)",
        // blur via opacity layering — use @react-native-community/blur for true blur
    },
    orbBottom: {
        position: "absolute",
        bottom: -100,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "rgba(168, 85, 247, 0.15)",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
        paddingBottom: 32,
    },
    // Logo badge
    iconWrapper: {
        alignSelf: "center",
        marginBottom: 28,
    },
    iconGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 12,
    },
    iconEmoji: {
        fontSize: 28,
        color: "#fff",
    },
    // Text hierarchy
    eyebrow: {
        textAlign: "center",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 3,
        color: "#a78bfa",
        textTransform: "uppercase",
        marginBottom: 8,
    },
    heading: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    subheading: {
        textAlign: "center",
        fontSize: 14,
        color: "rgba(255,255,255,0.4)",
        marginBottom: 32,
    },
    // Glassmorphism card wrapping inputs
    card: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        overflow: "hidden",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    input: {
        backgroundColor: "transparent",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    errorText: {
        textAlign: "center",
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 12,
        marginTop: -8,
    },
    // CTA button
    button: {
        borderRadius: 16,
        backgroundColor: "#7c3aed",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
        marginBottom: 24,
    },
    buttonLabel: {
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    // Divider
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    dividerText: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 12,
        fontWeight: "600",
    },
    // Switch mode row
    switchRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    switchText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
    },
    switchLink: {
        color: "#a78bfa",
        fontSize: 14,
        fontWeight: "700",
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        // flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 16,                    // ← removed marginTop: 32
    },
    footerText: {
        color: "rgba(255,255,255,0.3)",
        fontSize: 13,
    },
    footerLink: {
        color: "#a78bfa",
        fontSize: 13,
        fontWeight: "700",
        textDecorationLine: "underline",
        textDecorationColor: "#a78bfa",
    },
});
