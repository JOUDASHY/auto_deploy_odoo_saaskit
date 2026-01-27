"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
    isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const linkClass = (path: string) => `
    flex items-center p-2 text-gray-900 rounded-lg dark:text-white 
    hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors
    ${isActive(path) ? "bg-primary/10 text-primary font-bold" : ""}
  `;

    return (
        <aside className="fixed top-0 left-0 z-20 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                <ul className="space-y-2 font-medium">
                    {isAdmin ? (
                        <>
                            <li>
                                <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                                    <span className="ms-3">Vue Globale</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/clients" className={linkClass("/admin/clients")}>
                                    <span className="ms-3">Clients</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/subscriptions" className={linkClass("/admin/subscriptions")}>
                                    <span className="ms-3">Abonnements</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/instances" className={linkClass("/admin/instances")}>
                                    <span className="ms-3">Instances</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/plans" className={linkClass("/admin/plans")}>
                                    <span className="ms-3">Plans & Tarifs</span>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/dashboard" className={linkClass("/dashboard")}>
                                    <span className="ms-3">Mes Instances</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/subscription" className={linkClass("/dashboard/subscription")}>
                                    <span className="ms-3">Mon Abonnement</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/billing" className={linkClass("/dashboard/billing")}>
                                    <span className="ms-3">Facturation</span>
                                </Link>
                            </li>
                        </>
                    )}

                    <li className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
                        <Link href="/profile" className={linkClass("/profile")}>
                            <span className="ms-3">Mon Profil</span>
                        </Link>
                        <Link href="https://odoo.com/documentation" target="_blank" className={linkClass("/docs")}>
                            <span className="ms-3">Aide & Documentation</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
