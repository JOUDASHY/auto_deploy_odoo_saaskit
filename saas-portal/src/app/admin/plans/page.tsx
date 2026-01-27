"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Plan {
    id?: number;
    name: string;
    price: string | number;
    max_users: number;
    storage_limit_gb: number;
    max_instances: number;
    allowed_modules: string[];
    is_active: boolean;
    created_at?: string;
}

export default function AdminPlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<Plan>({
        name: "",
        price: "0.00",
        max_users: 1,
        storage_limit_gb: 10,
        max_instances: 1,
        allowed_modules: [],
        is_active: true
    });
    const [showModal, setShowModal] = useState(false);
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
            fetchPlans();
        } catch (e) {
            console.error(e);
            router.push("/login");
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await api.get("/plans/");
            setPlans(res.data);
        } catch (e) {
            console.error("Failed to fetch plans", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing
            ? `/plans/${currentPlan.id}/`
            : "/plans/";

        try {
            const res = isEditing
                ? await api.put(url, currentPlan)
                : await api.post(url, currentPlan);

            if (res.status === 200 || res.status === 201) {
                setShowModal(false);
                fetchPlans();
                resetForm();
            }
        } catch (e: any) {
            console.error("Save error", e);
            alert("Erreur lors de l'enregistrement: " + JSON.stringify(e.response?.data || e.message));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) return;

        try {
            await api.delete(`/plans/${id}/`);
            fetchPlans();
        } catch (e) {
            console.error("Delete error", e);
        }
    };

    const resetForm = () => {
        setCurrentPlan({
            name: "",
            price: "0.00",
            max_users: 1,
            storage_limit_gb: 10,
            max_instances: 1,
            allowed_modules: [],
            is_active: true
        });
        setIsEditing(false);
    };

    const openEdit = (plan: Plan) => {
        setCurrentPlan(plan);
        setIsEditing(true);
        setShowModal(true);
    };

    const toggleModule = (module: string) => {
        const modules = [...currentPlan.allowed_modules];
        if (modules.includes(module)) {
            setCurrentPlan({ ...currentPlan, allowed_modules: modules.filter(m => m !== module) });
        } else {
            setCurrentPlan({ ...currentPlan, allowed_modules: [...modules, module] });
        }
    };

    const availableModules = [
        "base", "web", "mail", "contacts", "calendar", "crm", "sale", "purchase",
        "stock", "account", "project", "hr", "helpdesk", "website", "mass_mailing",
        "documents", "sign", "voip", "knowledge", "studio"
    ];

    if (loading) return <div className="p-10 text-center">Chargement des plans...</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        💎 Gestion des Plans & Tarifs
                    </h1>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Nouveau Plan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:scale-[1.02] transition-transform">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                        <p className="text-3xl font-black text-primary mt-2">{plan.price} €<span className="text-sm font-normal text-gray-500"> / mois</span></p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {plan.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="text-primary text-xl">👤</span>
                                        <span>Jusqu'à <b>{plan.max_users}</b> utilisateurs</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="text-primary text-xl">📦</span>
                                        <span><b>{plan.storage_limit_gb} GB</b> de stockage</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="text-primary text-xl">🚀</span>
                                        <span><b>{plan.max_instances}</b> instances max</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <span className="text-primary text-xl">🧩</span>
                                        <span><b>{plan.allowed_modules.length}</b> modules inclus</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(plan)}
                                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-semibold py-2 rounded-lg transition-colors"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id!)}
                                        className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CRUD Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSave} className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {isEditing ? "Modifier le Plan" : "Nouveau Plan"}
                                    </h2>
                                    <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">&times;</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom du Plan</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentPlan.name}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix Mensuel (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentPlan.price}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Utilisateurs</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentPlan.max_users}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, max_users: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stockage (GB)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentPlan.storage_limit_gb}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, storage_limit_gb: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instances Max</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentPlan.max_instances}
                                            onChange={(e) => setCurrentPlan({ ...currentPlan, max_instances: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modules Autorisés</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableModules.map(module => (
                                            <button
                                                key={module}
                                                type="button"
                                                onClick={() => toggleModule(module)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${currentPlan.allowed_modules.includes(module)
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {module}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-8">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={currentPlan.is_active}
                                        onChange={(e) => setCurrentPlan({ ...currentPlan, is_active: e.target.checked })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Actif</label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all"
                                    >
                                        {isEditing ? "Mettre à jour" : "Créer le Plan"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 rounded-xl transition-colors"
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
