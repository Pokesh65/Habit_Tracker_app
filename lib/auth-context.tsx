import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { account } from "./appwrite";

type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    isLocadingUser: boolean;
    signUp: (email: string, password: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
    const [isLocadingUser, setIsLocadingUser] = useState<boolean>(true)

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        try {
            const response = await account.get()
            setUser(response)

        } catch (error) {
            if (error instanceof Error) {
                //     Toast.show({ type: "error", text1: error.message })
                Toast.show({ type: "error", text1: error.message })

            }
            setUser(null)
        } finally {
            setIsLocadingUser(false)
        }
    }

    const signUp = async (email: string, password: string) => {
        try {
            const response = await account.create(ID.unique(), email, password)
            if (response.status) {
                Toast.show({ type: "success", text1: "User created successfully!" })
            }
            await signIn(email, password)
            return null
        } catch (error) {
            if (error instanceof Error) {
                // await AsyncStorage.setItem("isAuth", "true"); // <-- IMPORTANT
                Toast.show({ type: "error", text1: error.message })
                return error.message
            }
            return "An error occured during singUp"
        }
    }

    const signIn = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password)
            const session = await account.get()
            setUser(session)
            if (session.status) {
                Toast.show({ type: "success", text1: "User logged in successfully!" })
            }
            return null
        } catch (error) {
            if (error instanceof Error) {
                Toast.show({ type: "error", text1: error.message });
                return error.message
            }
            return "An error occured during singIn"
        }
    }

    const signOut = async () => {
        try {
            await account.deleteSession("current")
            setUser(null)

        } catch (error) {
            if (error instanceof Error) {
                Toast.show({ type: "error", text1: error.message })
            }
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider
            value={{ isLocadingUser, user, signUp, signIn, signOut }}
        >
            {children}
        </AuthContext.Provider >
    );
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used niside of the AuthProvider")
    }
    return context
}
