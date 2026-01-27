"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface OdooInstance {
    id: number;
    name: string;
    domain: string;
    port: number;
    status: string;
    status_display?: string;
    created_at: string;
}

interface Plan {
    id: number;
    name: string;
    max_users: number;
    price: string;
    allowed_modules?: string[];
}

export default function Dashboard() {
    const [instances, setInstances] = useState<OdooInstance[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [newInstanceName, setNewInstanceName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Fetch data on load
    useEffect(() => {
        Promise.all([fetchInstances(), fetchPlans()]).finally(() => setLoading(false));

        const interval = setInterval(fetchInstances, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get("/plans/");
            setPlans(res.data);
        } catch (e) {
            console.error(e);
        }
    }

    const fetchInstances = async () => {
        try {
            const res = await api.get("/instances/");
            setInstances(res.data);
        } catch (err: any) {
            console.error("Failed to fetch instances", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInstanceName) return;

        setCreating(true);
        setError("");

        try {
            await api.post("/instances/", {
                name: newInstanceName,
                domain: `${newInstanceName}.localhost`,
            });

            setNewInstanceName("");
            fetchInstances();
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || "Erreur de création");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                    Mes Services
                </h1>

                {/* Plans Overview (Static for now, could be dynamic selection) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                            <p className="text-2xl font-bold text-primary my-2">{plan.price} € <span className="text-sm text-gray-500 font-normal">/mois</span></p>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                                <li>👥 Jusqu'à {plan.max_users} utilisateurs</li>
                                <li>📦 Stockage inclus</li>
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Formulaire Création */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                Déployer une instance
                            </h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom de l'instance
                                    </label>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={newInstanceName}
                                            onChange={(e) => setNewInstanceName(e.target.value)}
                                            placeholder="ma-societe"
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300">
                                            .localhost
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    {creating ? "Déploiement en cours..." : "Lancer mon Odoo 🚀"}
                                </button>
                                {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded">{error}</div>}
                            </form>
                        </div>
                    </div>

                    {/* Liste Instances */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                    Mes Instances
                                </h2>
                                <span className="bg-surface text-primary text-xs font-semibold px-2.5 py-0.5 rounded border border-surface-border">
                                    {instances.length} active(s)
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : instances.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <p className="mb-2">Aucune instance déployée.</p>
                                    <p className="text-sm">Utilisez le formulaire pour créer votre première instance Odoo !</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {instances.map((inst) => (
                                        <div key={inst.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`h-3 w-3 rounded-full ${inst.status === 'RUNNING' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : inst.status === 'ERROR' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'}`}></div>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-primary hover:text-primary-light">
                                                            <a href={`http://localhost:${inst.port}`} target="_blank">{inst.name}</a>
                                                        </h3>
                                                        <p className="text-sm text-gray-500">Port: {inst.port} • PostgreSQL 16</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <a
                                                        href={`http://localhost:${inst.port}`}
                                                        target="_blank"
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                                                    >
                                                        Accéder ↗
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
