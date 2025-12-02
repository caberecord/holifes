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
    UserCredential,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { AppUser, UserRole } from "../types/user";
import { Organization } from "@/features/organizations/types/organization.schema";
import { getUserOrganizations } from "@/features/organizations/services/organization.service";

interface AuthContextType {
    user: User | null;
    appUser: AppUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<UserCredential>;
    loginWithGoogle: () => Promise<UserCredential>;
    register: (email: string, password: string, displayName?: string, phone?: string, accountType?: "personal" | "business") => Promise<UserCredential>;
    logout: () => Promise<void>;
    updateUserProfile: (displayName: string) => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    // Helper properties
    isOrganizer: boolean;
    isStaff: boolean;
    // Enterprise properties
    organizations: Organization[];
    currentOrganization: Organization | null;
    switchOrganization: (orgId: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch user data from Firestore
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const existingUser = userDoc.data() as AppUser;

                        // Check if we need to sync Google data (photo, name, phone)
                        const updates: Partial<AppUser> = {};
                        let needsUpdate = false;

                        if (!existingUser.photoURL && firebaseUser.photoURL) {
                            updates.photoURL = firebaseUser.photoURL;
                            needsUpdate = true;
                        }
                        if (!existingUser.displayName && firebaseUser.displayName) {
                            updates.displayName = firebaseUser.displayName;
                            needsUpdate = true;
                        }
                        if (!existingUser.phone && firebaseUser.phoneNumber) {
                            updates.phone = firebaseUser.phoneNumber;
                            needsUpdate = true;
                        }

                        if (needsUpdate) {
                            await updateDoc(userDocRef, updates);
                            setAppUser({ ...existingUser, ...updates });
                        } else {
                            setAppUser(existingUser);
                        }

                        // === Enterprise: Fetch Organizations ===
                        // Moved below to share logic with new users and isolate errors

                    } else {
                        // If user document doesn't exist (e.g. first Google login), create it
                        const newUser: AppUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || "",
                            role: "organizer",
                            accountType: "personal", // Default for Google Login
                            createdAt: new Date(),
                        };

                        if (firebaseUser.displayName) newUser.displayName = firebaseUser.displayName;
                        if (firebaseUser.photoURL) newUser.photoURL = firebaseUser.photoURL;
                        if (firebaseUser.phoneNumber) newUser.phone = firebaseUser.phoneNumber;

                        await setDoc(userDocRef, newUser);
                        setAppUser(newUser);

                        // New users have no organizations yet
                        setOrganizations([]);
                        setCurrentOrganization(null);
                    }

                    // === Enterprise: Fetch Organizations ===
                    try {
                        const userOrgs = await getUserOrganizations(firebaseUser.uid);
                        setOrganizations(userOrgs);

                        // Set default org (first one or from local storage preference)
                        if (userOrgs.length > 0) {
                            const lastOrgId = localStorage.getItem('lastOrgId');
                            const savedOrg = lastOrgId ? userOrgs.find(o => o.id === lastOrgId) : null;
                            setCurrentOrganization(savedOrg || userOrgs[0]);
                        } else {
                            setCurrentOrganization(null);
                        }
                    } catch (orgError) {
                        console.error("Error fetching user organizations:", orgError);
                        // Don't block login if org fetch fails
                        setOrganizations([]);
                        setCurrentOrganization(null);
                    }

                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setAppUser(null);
                    setOrganizations([]);
                    setCurrentOrganization(null);
                }
            } else {
                setUser(null);
                setAppUser(null);
                setOrganizations([]);
                setCurrentOrganization(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const register = async (
        email: string,
        password: string,
        displayName?: string,
        phone?: string,
        accountType: "personal" | "business" = "personal"
    ) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }

        const userData: AppUser = {
            uid: userCredential.user.uid,
            email,
            role: "organizer",
            accountType,
            createdAt: new Date(),
        };

        if (displayName) userData.displayName = displayName;
        if (phone) userData.phone = phone;

        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        setAppUser(userData);

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserProfile = async (displayName: string) => {
        if (!user) throw new Error("No user logged in");
        await updateProfile(user, { displayName });
        if (appUser) {
            await updateDoc(doc(db, "users", user.uid), { displayName });
            setAppUser({ ...appUser, displayName });
        }
    };

    const changePassword = async (newPassword: string) => {
        if (!user) throw new Error("No user logged in");
        await updatePassword(user, newPassword);
    };

    const deleteAccount = async () => {
        if (!user) throw new Error("No user logged in");
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);
        setUser(null);
        setAppUser(null);
    };

    const switchOrganization = (orgId: string) => {
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            setCurrentOrganization(org);
            localStorage.setItem('lastOrgId', org.id);
        }
    };

    const value: AuthContextType = {
        user,
        appUser,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUserProfile,
        changePassword,
        deleteAccount,
        loading,
        isOrganizer: appUser?.role === "organizer",
        isStaff: appUser?.role === "staff",
        organizations,
        currentOrganization,
        switchOrganization,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
