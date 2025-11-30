"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { Contact } from "@/types/contact";
import { TransactionLog } from "@/lib/transactions";
import { ArrowLeft, Mail, Phone, MapPin, Edit, Trash2, Calendar, DollarSign, Ticket, Loader2, X } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/Contacts/ContactForm";
import { showToast } from "@/lib/toast";

interface TransactionWithId extends TransactionLog {
    id: string;
}

export default function ContactDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [contact, setContact] = useState<Contact | null>(null);
    const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const loadData = async () => {
        if (!user || !id) return;
        setLoading(true);
        try {
            // Load Contact
            const contactRef = doc(db, "contacts", id as string);
            const contactSnap = await getDoc(contactRef);

            if (contactSnap.exists()) {
                setContact({ id: contactSnap.id, ...contactSnap.data() } as Contact);

                // Load Transactions
                const transactionsQ = query(
                    collection(db, "transactions"),
                    where("organizerId", "==", user.uid),
                    where("contactId", "==", id),
                    orderBy("createdAt", "desc")
                );
                const transactionsSnap = await getDocs(transactionsQ);
                const transactionsData = transactionsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as unknown as TransactionWithId[];
                setTransactions(transactionsData);

            } else {
                showToast.error("Contacto no encontrado");
                router.push("/dashboard/contacts");
            }
        } catch (error) {
            console.error("Error loading contact:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user, id]);

    const handleDelete = async () => {
        if (transactions.length > 0) {
            showToast.error("No se puede eliminar un contacto con historial de transacciones");
            return;
        }

        if (!confirm("¿Estás seguro de eliminar este contacto?")) return;
        try {
            await deleteDoc(doc(db, "contacts", id as string));
            showToast.success("Contacto eliminado");
            router.push("/dashboard/contacts");
        } catch (error) {
            console.error("Error deleting contact:", error);
            showToast.error("Error al eliminar");
        }
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-500">Cargando perfil...</p>
            </div>
        );
    }

    if (!contact) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Link href="/dashboard/contacts" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Contactos
            </Link>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-lg">
                        {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
                        <div className="flex flex-wrap gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {contact.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {contact.phone}
                            </div>
                            {contact.address?.city && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {contact.address.city}
                                </div>
                            )}
                        </div>
                        <div className="pt-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {contact.identification.type}: {contact.identification.number}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Gastado</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${contact.totalSpent?.toLocaleString() || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tickets Comprados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {contact.totalTickets || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Última Interacción</p>
                            <p className="text-lg font-bold text-gray-900">
                                {contact.lastInteraction?.toDate ? contact.lastInteraction.toDate().toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Historial de Transacciones</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'SALE' ? 'bg-green-100 text-green-800' :
                                                tx.type === 'REFUND' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                tx.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${tx.amount.toLocaleString()} {tx.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.metadata?.description || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay transacciones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Editar Contacto</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ContactForm
                                initialData={contact}
                                onSuccess={() => {
                                    setShowEditModal(false);
                                    loadData();
                                }}
                                onCancel={() => setShowEditModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
