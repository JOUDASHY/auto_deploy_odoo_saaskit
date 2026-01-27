"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserInfo {
    username: string;
    email: string;
    role: string;
}

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_info");
        router.push("/login");
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 fixed w-full z-30 top-0 start-0 flex items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    S
                </div>
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                    SaaS Portal
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {user && (
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{user.username}</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">{user.role}</span>
                    </div>
                )}
                <div className="group relative">
                    <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold border-2 border-primary/20 hover:border-primary transition-all">
                        {user?.username ? user.username[0].toUpperCase() : "?"}
                    </button>
                    {/* Tooltip or Dropdown could go here */}
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors text-sm font-medium"
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}
