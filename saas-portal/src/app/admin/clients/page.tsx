"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Client {
    id: number;
    company_name: string;
    phone: string;
    address: string;
    created_at: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    active_subscription: {
        plan_name: string;
        status: string;
    } | null;
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await api.get("/me/");
            if (!res.data.is_staff) {
                router.push("/dashboard");
                return;
            }
            fetchClients();
        } catch (e) {
            router.push("/login");
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get("/clients/");
            setClients(res.data);
        } catch (e) {
            console.error("Failed to fetch clients", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement des clients...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                    👥 Gestion des Clients
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Société</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Abonnement</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Depuis le</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        {client.company_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{client.user.username}</p>
                                        <p className="text-xs text-gray-500">{client.user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.active_subscription ? (
                                            <div className="flex flex-col">
                                                <span className="text-primary font-bold text-sm">{client.active_subscription.plan_name}</span>
                                                <span className="text-[10px] uppercase font-black text-green-500">{client.active_subscription.status}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-red-500 font-medium">Aucun abonnement actif</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(client.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
