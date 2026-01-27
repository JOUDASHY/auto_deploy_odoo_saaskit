"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        company_name: "",
        phone: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/register/", formData);

            // Auto login after registration
            const loginRes = await api.post("/token/", {
                username: formData.username,
                password: formData.password,
            });

            localStorage.setItem("access_token", loginRes.data.access);
            localStorage.setItem("refresh_token", loginRes.data.refresh);

            // Fetch user info
            const meRes = await api.get("/me/");
            localStorage.setItem("user_info", JSON.stringify(meRes.data));

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            if (err.response?.data) {
                const data = err.response.data;
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : "Erreur lors de l'inscription");
            } else {
                setError("Une erreur est survenue");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-10 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700">
                    <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Rejoignez <span className="text-primary italic">ODDSaaS</span>
                    </h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Utilisateur
                                </label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border-gray-200 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    placeholder="jdoe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border-gray-200 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                Entreprise
                            </label>
                            <input
                                name="company_name"
                                type="text"
                                required
                                value={formData.company_name}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                placeholder="Ma Super Entreprise"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                Téléphone
                            </label>
                            <input
                                name="phone"
                                type="text"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                placeholder="+33 6 12 34 56 78"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                Mot de passe
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl bg-primary px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-primary-light hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                {loading ? "Création en cours..." : "Créer mon compte 🚀"}
                            </button>
                        </div>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Déjà inscrit ?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-primary-light">
                                Connectez-vous ici
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
