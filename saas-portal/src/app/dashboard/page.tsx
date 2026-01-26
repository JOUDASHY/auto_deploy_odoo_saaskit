"use client";

import { useState, useEffect } from "react";

interface OdooInstance {
    id: number;
    name: string;
    domain: string;
    port: number;
    status: string;
    status_display?: string;
    created_at: string;
}

export default function Dashboard() {
    const [instances, setInstances] = useState<OdooInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [newInstanceName, setNewInstanceName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    // Fetch instances on load
    useEffect(() => {
        // Basic Auth Check
        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        fetchInstances();
        const interval = setInterval(fetchInstances, 5000); // Polling every 5s for status updates
        return () => clearInterval(interval);
    }, []);

    const fetchInstances = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8000/api/instances/", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setInstances(data);
            } else if (res.status === 401) {
                // Token expired or invalid
                localStorage.removeItem("access_token");
                window.location.href = "/login";
            }
        } catch (err) {
            console.error("Failed to fetch instances", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInstanceName) return;

        setCreating(true);
        setError("");

        try {
            // client and subscription are now auto-detected by backend thanks to Auth
            const payload = {
                name: newInstanceName,
                domain: `${newInstanceName}.localhost`,
                // port, client, subscription are handled by backend
            };

            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8000/api/instances/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Erreur lors de la création (Vérifiez que le Client ID 1 existe)");
            }

            setNewInstanceName("");
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                    Tableau de Bord Client
                </h1>

                {/* Create Instance Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                        Deployer une nouvelle instance Odoo
                    </h2>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nom de l'instance
                            </label>
                            <input
                                type="text"
                                value={newInstanceName}
                                onChange={(e) => setNewInstanceName(e.target.value)}
                                placeholder="ex: ma-societe"
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            {creating ? "Déploiement..." : "Créer l'instance"}
                        </button>
                    </form>
                    {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                </div>

                {/* Instances List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Mes Instances Actives
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Chargement...</div>
                    ) : instances.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            Aucune instance déployée pour le moment.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL Access</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Port</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {instances.map((inst) => (
                                    <tr key={inst.id}>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {inst.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`http://localhost:${inst.port}`}
                                                target="_blank"
                                                className="text-blue-600 hover:underline"
                                            >
                                                http://localhost:{inst.port}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${inst.status === 'RUNNING' ? 'bg-green-100 text-green-800' :
                                                    inst.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {inst.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {inst.port}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
