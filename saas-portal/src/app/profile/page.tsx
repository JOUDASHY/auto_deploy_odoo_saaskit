"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface UserProfile {
    id: number;
    username: string;
    email: string;
    role: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // First, try to load from localStorage for instant display
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
        }

        // Then fetch from API to get fresh data
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/me/");
            const userData = res.data;
            setUser(userData);
            localStorage.setItem("user_info", JSON.stringify(userData));
        } catch (e) {
            console.error("Failed to fetch user", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    👤 Mon Profil
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                {user?.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                                <span className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full uppercase">
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
                                    value={user?.username || ""}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    defaultValue={user?.email || ""}
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all">
                                Sauvegarder les modifications
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <h3 className="text-red-700 dark:text-red-400 font-bold mb-2">Zone de sécurité</h3>
                    <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">Vous pouvez changer votre mot de passe ou activer l'authentification à deux facteurs.</p>
                    <button className="text-red-700 dark:text-red-400 font-bold text-sm underline">Changer le mot de passe</button>
                </div>
            </div>
        </div>
    );
}
