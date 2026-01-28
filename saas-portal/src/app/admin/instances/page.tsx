"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface OdooInstance {
    id: number;
    name: string;
    client_company: string;
    subscription_plan: string;
    domain: string;
    port: number;
    status: string;
    status_display: string;
    db_name: string;
    odoo_version: string;
    created_at: string;
}

export default function AdminInstances() {
    const [instances, setInstances] = useState<OdooInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
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
            fetchInstances();
        } catch (e) {
            router.push("/login");
        }
    };

    const fetchInstances = async () => {
        try {
            const res = await api.get("/instances/");
            setInstances(res.data);
        } catch (e) {
            console.error("Failed to fetch instances", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: string) => {
        const confirmMsg = action === 'DELETE'
            ? "Êtes-vous sûr de vouloir supprimer cette instance ? Cette action est irréversible."
            : `Voulez-vous vraiment ${action.toLowerCase()} cette instance ?`;

        if (!confirm(confirmMsg)) return;

        try {
            const endpoint = action.toLowerCase() === 'delete' ? 'remove' : action.toLowerCase();
            await api.post(`/instances/${id}/${endpoint}/`);
            fetchInstances(); // Refresh list
        } catch (e: any) {
            console.error(`Action ${action} failed`, e);
            alert(`Erreur lors de l'action ${action}: ${e.response?.data?.error || "Une erreur est survenue"}`);
        }
    };

    const filteredInstances = instances.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.client_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.db_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Chargement des instances...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            🚀 Gestion des Instances
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Surveillez et gérez tous les déploiements Odoo actifs.</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Rechercher une instance..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Instance</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client / Plan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Détails Techniques</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredInstances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Aucune instance trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInstances.map((inst) => (
                                        <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {inst.odoo_version}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white leading-tight">{inst.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(inst.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{inst.client_company}</p>
                                                <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-500 uppercase mt-1">
                                                    {inst.subscription_plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                                                        {inst.domain}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        Port: <span className="font-mono text-primary">{inst.port}</span> • DB: {inst.db_name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${inst.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                                                    inst.status === 'ERROR' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'RUNNING' ? 'bg-green-500 animate-pulse' :
                                                        inst.status === 'ERROR' ? 'bg-red-500' :
                                                            'bg-yellow-500 animate-bounce'
                                                        }`}></span>
                                                    {inst.status_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => window.open(`http://localhost:${inst.port}`, '_blank')}
                                                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                        title="Ouvrir l'instance"
                                                    >
                                                        🌐
                                                    </button>
                                                    <div className="relative group">
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                                            ⋮
                                                        </button>
                                                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-100 dark:border-gray-700 py-2 min-w-[120px]">
                                                            <button onClick={() => handleAction(inst.id, 'START')} className="w-full text-left px-4 py-2 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 font-bold transition-colors">Démarrer</button>
                                                            <button onClick={() => handleAction(inst.id, 'STOP')} className="w-full text-left px-4 py-2 text-xs text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 font-bold transition-colors">Arrêter</button>
                                                            <button onClick={() => handleAction(inst.id, 'RESTART')} className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 font-bold transition-colors">Redémarrer</button>
                                                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                                                            <button onClick={() => handleAction(inst.id, 'DELETE')} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-colors">Supprimer</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stats / Help */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Running</p>
                            <p className="text-2xl font-black text-green-500 mt-1">{instances.filter(i => i.status === 'RUNNING').length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 text-xl font-bold">✓</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">En cours</p>
                            <p className="text-2xl font-black text-yellow-500 mt-1">{instances.filter(i => ['CREATED', 'DEPLOYING'].includes(i.status)).length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 text-xl font-bold">⚠</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Erreurs</p>
                            <p className="text-2xl font-black text-red-500 mt-1">{instances.filter(i => i.status === 'ERROR').length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 text-xl font-bold">✖</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
