"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/types/user";
import { Search, Ban, UserCheck, LogIn, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const usersData: AppUser[] = [];
            snapshot.forEach((doc) => {
                usersData.push(doc.data() as AppUser);
            });
            setUsers(usersData);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (uid: string, action: 'suspend' | 'ban' | 'recover') => {
        if (!confirm(`¿Estás seguro de que quieres ${action === 'recover' ? 'recuperar' : action === 'ban' ? 'banear' : 'suspender'} a este usuario?`)) return;

        setProcessing(uid);
        try {
            const res = await fetch('/api/admin/users/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, action })
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => {
                    if (u.uid === uid) {
                        return {
                            ...u,
                            status: action === 'recover' ? 'active' : action === 'suspend' ? 'suspended' : 'banned'
                        };
                    }
                    return u;
                }));
                showToast.success(`Usuario ${action === 'recover' ? 'recuperado' : action === 'ban' ? 'baneado' : 'suspendido'} correctamente.`);
            } else {
                const data = await res.json();
                showToast.error("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            showToast.error("Error de conexión");
        } finally {
            setProcessing(null);
        }
    };

    const handleImpersonate = async (uid: string) => {
        if (!confirm("⚠️ ADVERTENCIA: Esto cerrará tu sesión actual de Super Admin e iniciará sesión como este usuario. ¿Continuar?")) return;

        setProcessing(uid);
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid })
            });

            const data = await res.json();
            if (res.ok) {
                await signInWithCustomToken(auth, data.token);
                router.push('/dashboard');
            } else {
                showToast.error("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            showToast.error("Error al iniciar sesión como usuario");
        } finally {
            setProcessing(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
                    <p className="text-gray-400">Administra todos los usuarios de la plataforma.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo Cuenta</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">Cargando usuarios...</td>
                            </tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.uid} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold">
                                            {user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">{user.displayName || 'Sin nombre'}</div>
                                            <div className="text-sm text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'banned' ? 'bg-red-900 text-red-200' :
                                        user.status === 'suspended' ? 'bg-yellow-900 text-yellow-200' :
                                            'bg-green-900 text-green-200'
                                        }`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                                        user.role === 'organizer' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {user.accountType === 'business' ? 'Empresa' : 'Personal'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {processing === user.uid ? (
                                            <span className="text-gray-500 text-xs">Procesando...</span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleImpersonate(user.uid)}
                                                    className="text-indigo-400 hover:text-indigo-300 p-1"
                                                    title="Login As (Impersonar)"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </button>

                                                {user.status === 'banned' || user.status === 'suspended' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(user.uid, 'recover')}
                                                        className="text-green-400 hover:text-green-300 p-1"
                                                        title="Recuperar Cuenta"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(user.uid, 'suspend')}
                                                            className="text-yellow-400 hover:text-yellow-300 p-1"
                                                            title="Suspender (Soft Delete)"
                                                        >
                                                            <Power className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(user.uid, 'ban')}
                                                            className="text-red-400 hover:text-red-300 p-1"
                                                            title="Banear (Bloqueo Total)"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
