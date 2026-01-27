"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface KPI {
    total_clients: number;
    total_instances: number;
    active_plans: number;
    revenue: number;
}

export default function AdminDashboard() {
    const [kpi, setKpi] = useState<KPI>({ total_clients: 0, total_instances: 0, active_plans: 0, revenue: 0 });
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        try {
            const res = await api.get("/me/");
            const me = res.data;

            // Check if user is staff/admin
            if (!me.is_staff) {
                alert("Accès refusé. Vous n'avez pas les droits d'administrateur.");
                router.push("/dashboard"); // Redirect to client dashboard
                return;
            }

            fetchAdminData();

        } catch (e) {
            console.error(e);
            router.push("/login");
        }
    };

    const fetchAdminData = async () => {
        try {
            const [instRes, clientRes, plansRes] = await Promise.all([
                api.get("/instances/"),
                api.get("/clients/"),
                api.get("/plans/"),
            ]);

            const instances = instRes.data;
            const clients = clientRes.data;
            const plans = plansRes.data;

            setInstances(instances);
            setKpi({
                total_clients: clients.length,
                total_instances: instances.length,
                active_plans: plans.length,
                // Mock revenue calculation
                revenue: 290.00
            });

        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    🛡️ Administration SaaS
                </h1>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Clients Totaux</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.total_clients}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Instances Déployées</p>
                        <p className="text-3xl font-bold text-primary">{kpi.total_instances}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Plans Actifs</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.active_plans}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Revenus Mensuels (Est.)</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-500">{kpi.revenue} €</p>
                    </div>
                </div>

                {/* Global Instances Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Vue Globale des Instances</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client ID</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Instance</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">DB Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {instances.map((inst) => (
                                <tr key={inst.id}>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white">{inst.client}</td>
                                    <td className="px-6 py-4 font-bold text-primary">
                                        <a href={`http://localhost:${inst.port}`} target="_blank">{inst.name}</a>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{inst.db_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${inst.status === 'RUNNING' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {inst.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-red-600 hover:text-red-900 cursor-pointer">
                                        Arrêter / Supprimer
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
