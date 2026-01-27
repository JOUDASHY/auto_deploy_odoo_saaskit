"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Subscription {
    id: number;
    client: number;
    plan: number;
    start_date: string;
    end_date: string | null;
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
    auto_renew: boolean;
    billing_cycle: 'MONTHLY' | 'YEARLY';
    next_billing_date: string | null;
    client_company: string;
    plan_name: string;
    plan_price: string;
    is_active_status: boolean;
}

interface ClientProfile {
    id: number;
    company_name: string;
    user: {
        username: string;
    }
}

interface Plan {
    id: number;
    name: string;
    price: string;
}

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [clients, setClients] = useState<ClientProfile[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null as number | null,
        client: "",
        plan: "",
        end_date: "",
        status: "ACTIVE",
        auto_renew: true,
        billing_cycle: "MONTHLY"
    });
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
            fetchData();
        } catch (e) {
            router.push("/login");
        }
    };

    const fetchData = async () => {
        try {
            const [subRes, clientRes, planRes] = await Promise.all([
                api.get("/subscriptions/"),
                api.get("/clients/"),
                api.get("/plans/")
            ]);
            setSubscriptions(subRes.data);
            setClients(clientRes.data);
            setPlans(planRes.data);
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/subscriptions/${formData.id}/`, formData);
            } else {
                await api.post("/subscriptions/", formData);
            }
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (e: any) {
            alert("Erreur: " + JSON.stringify(e.response?.data || e.message));
        }
    };

    const openEdit = (sub: Subscription) => {
        setFormData({
            id: sub.id,
            client: sub.client.toString(),
            plan: sub.plan.toString(),
            end_date: sub.end_date || "",
            status: sub.status,
            auto_renew: sub.auto_renew,
            billing_cycle: sub.billing_cycle
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            id: null,
            client: "",
            plan: "",
            end_date: "",
            status: "ACTIVE",
            auto_renew: true,
            billing_cycle: "MONTHLY"
        });
        setIsEditing(false);
    };

    if (loading) return <div className="p-10 text-center">Chargement des abonnements...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        💳 Gestion des Abonnements
                    </h1>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        + Nouvel Abonnement
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cycle</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fin d'abonnement</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {sub.client_company}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-primary font-bold">{sub.plan_name}</span>
                                        <p className="text-xs text-gray-500">{sub.plan_price} €</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            {sub.billing_cycle}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                sub.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : "Illimité"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEdit(sub)}
                                            className="text-primary hover:text-primary-dark font-medium text-sm p-2"
                                        >
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                {isEditing ? "Modifier l'Abonnement" : "Nouvel Abonnement"}
                            </h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        disabled={isEditing}
                                    >
                                        <option value="">Sélectionner un client</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.company_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                                    <select
                                        required
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.plan}
                                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                    >
                                        <option value="">Sélectionner un plan</option>
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.price} €)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={formData.billing_cycle}
                                            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                                        >
                                            <option value="MONTHLY">Mensuel</option>
                                            <option value="YEARLY">Annuel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="ACTIVE">Actif</option>
                                            <option value="SUSPENDED">Suspendu</option>
                                            <option value="EXPIRED">Expiré</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration (End Date)</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="auto_renew"
                                        checked={formData.auto_renew}
                                        onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label htmlFor="auto_renew" className="text-sm font-medium text-gray-700 dark:text-gray-300">Renouvellement automatique</label>
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        {isEditing ? "Enregistrer" : "Créer"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
