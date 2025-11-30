"use client";
import { useAuth } from "@/context/AuthContext";

export default function DebugUserPage() {
    const { user, appUser, isOrganizer, loading } = useAuth();

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug User Information</h1>

            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div>
                    <h2 className="font-bold text-lg mb-2">Firebase Auth User</h2>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify({ uid: user?.uid, email: user?.email }, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="font-bold text-lg mb-2">Firestore AppUser</h2>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(appUser, null, 2)}
                    </pre>
                </div>

                <div>
                    <h2 className="font-bold text-lg mb-2">Auth Context Values</h2>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify({ isOrganizer, loading }, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <strong>Expected for Staff Management:</strong>
                    <br />- appUser.role should be "organizer"
                    <br />- isOrganizer should be true
                </p>
            </div>
        </div>
    );
}
