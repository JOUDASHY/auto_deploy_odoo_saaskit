"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Payment {
    id: number;
    amount: string;
    payment_date: string;
    method: string;
    status: string;
    transaction_id: string;
    subscription_plan: string;
}

export default function ClientBilling() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get("/payments/");
            setPayments(res.data);
        } catch (e) {
            console.error("Failed to fetch payments", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        💳 Facturation & Paiements
                    </h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Historique des transactions</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Méthode</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-gray-500">
                                            Aucune transaction trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-8 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {new Date(payment.payment_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {payment.subscription_plan}
                                            </td>
                                            <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-white">
                                                {payment.amount} €
                                            </td>
                                            <td className="px-8 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-2">
                                                    {payment.method === 'STRIPE' && <span>💳</span>}
                                                    {payment.method === 'PAYPAL' && <span>🅿️</span>}
                                                    {payment.method}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button className="text-primary hover:text-primary-dark font-bold text-sm">
                                                    PDF 📄
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Billing Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Méthode de paiement</h3>
                        <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center font-bold text-xs uppercase tracking-tighter">Visa</div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-gray-500">Expire le 12/26</p>
                                </div>
                            </div>
                            <button className="text-primary font-bold text-sm">Modifier</button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Informations de facturation</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Ces informations apparaîtront sur vos factures.
                        </p>
                        <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors">
                            Editer les informations
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
