"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Plan {
    id: number;
    name: string;
    price: string;
    max_users: number;
    storage_limit_gb: number;
    max_instances: number;
    allowed_modules: string[];
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchPlans();
    }, []);

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

    const handleSubscribe = async (planId: number) => {
        setSubmitting(planId);
        try {
            await api.post("/subscriptions/", {
                plan: planId,
                billing_cycle: "MONTHLY"
            });
            router.push("/dashboard/subscription");
        } catch (e) {
            console.error("Subscription failed", e);
            alert("Erreur lors de la souscription. Veuillez réessayer.");
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement des offres...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                    Choisissez votre Plan <span className="text-primary italic">ODDSaaS</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Des solutions adaptées à chaque étape de votre croissance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 transition-all hover:scale-[1.02] ${plan.name === 'Business' ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 dark:border-gray-700'
                            }`}
                    >
                        {plan.name === 'Business' && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Recommandé
                            </span>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-5xl font-black text-primary">{parseFloat(plan.price).toFixed(0)}€</span>
                                <span className="text-gray-500 ml-1">/mois</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>{plan.max_users} Utilisateurs</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>{plan.max_instances} Instance(s) Odoo</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>{plan.storage_limit_gb} GB Stockage</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                <span className="text-green-500 font-bold">✓</span>
                                <span>Mises à jour incluses</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={submitting !== null}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${plan.name === 'Business'
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white'
                                }`}
                        >
                            {submitting === plan.id ? "Traitement..." : "Choisir ce plan"}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center text-gray-500 text-sm">
                <p>Toutes nos offres incluent un support technique 24/7 et des sauvegardes quotidiennes.</p>
            </div>
        </div>
    );
}
