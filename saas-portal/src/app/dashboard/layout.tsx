import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <Sidebar isAdmin={false} />
            <div className="p-4 sm:ml-64 mt-16">
                {children}
            </div>
        </>
    );
}
