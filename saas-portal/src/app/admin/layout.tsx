import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <Sidebar isAdmin={true} />
            <div className="p-4 sm:ml-64 mt-16">
                {children}
            </div>
        </>
    );
}
