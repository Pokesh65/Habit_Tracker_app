import Toast from "react-native-toast-message";

export const toastConfig = {
    success: (text1: string, text2?: string) =>
        Toast.show({ type: "success", text1, text2, position: "top", visibilityTime: 3000 }),

    error: (text1: string, text2?: string) =>
        Toast.show({ type: "error", text1, text2, position: "top", visibilityTime: 3000 }),

    warning: (text1: string, text2?: string) =>
        Toast.show({ type: "warning", text1, text2, position: "top", visibilityTime: 3000 }),
};