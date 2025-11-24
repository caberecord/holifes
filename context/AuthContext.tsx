"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    deleteUser,
    User,
    UserCredential
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { AppUser, UserRole } from "../types/user";

interface AuthContextType {
    user: User | null;
    appUser: AppUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<UserCredential>;
    register: (email: string, password: string, displayName?: string, phone?: string, accountType?: "personal" | "business") => Promise<UserCredential>;
    logout: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    // Helper properties
    isOrganizer: boolean;
    isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        setAppUser(userDoc.data() as AppUser);
                    } else {
                        // If user document doesn't exist, create a default organizer profile
                        const defaultUser: AppUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || "",
                            role: "organizer",
                            createdAt: new Date(),
                        };
                        await setDoc(doc(db, "users", firebaseUser.uid), defaultUser);
                        setAppUser(defaultUser);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setAppUser(null);
                }
            } else {
                setUser(null);
                setAppUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (
        email: string,
        password: string,
        displayName?: string,
        phone?: string,
        accountType: "personal" | "business" = "personal"
    ) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update Firebase Auth profile with display name
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }

        // Create user document in Firestore
        const userData: AppUser = {
            uid: userCredential.user.uid,
            email,
            displayName: displayName || undefined,
            phone: phone || undefined,
            role: "organizer", // All registered users are organizers
            accountType,
            createdAt: new Date(),
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        setAppUser(userData);

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserProfile = async (displayName: string) => {
        if (!user) throw new Error("No user logged in");

        // Update Firebase Auth profile
        await updateProfile(user, { displayName });

        // Update Firestore user document
        if (appUser) {
            await updateDoc(doc(db, "users", user.uid), {
                displayName,
            });
            setAppUser({ ...appUser, displayName });
        }
    };

    const changePassword = async (newPassword: string) => {
        if (!user) throw new Error("No user logged in");
        await updatePassword(user, newPassword);
    };

    const deleteAccount = async () => {
        if (!user) throw new Error("No user logged in");

        // Delete user document from Firestore
        await deleteDoc(doc(db, "users", user.uid));

        // Delete Firebase Auth user
        await deleteUser(user);

        // Clear state
        setUser(null);
        setAppUser(null);
    };

    const value: AuthContextType = {
        user,
        appUser,
        login,
        register,
        logout,
        updateUserProfile,
        changePassword,
        deleteAccount,
        loading,
        isOrganizer: appUser?.role === "organizer",
        isStaff: appUser?.role === "staff",
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
