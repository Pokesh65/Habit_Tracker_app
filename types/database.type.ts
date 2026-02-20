import { Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
    user_id: string;
    title: string;
    description: string;
    frequency: string;
    streak_count: number;
    last_completed: string;
    // $createdAt: string;  
}

export interface HabitCompletion extends Models.Document {
    user_id: string,
    habit_id: string,
    completed_at: string
}
