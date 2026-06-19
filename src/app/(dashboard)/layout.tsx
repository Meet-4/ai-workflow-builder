
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sync mock user with MongoDB Atlas
  try {
    await connectToDatabase();
    const email = "mock@example.com";
    const name = "Mock User";
    const clerkId = "mock-user-123";

    await User.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        name,
        email,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error syncing user with database:", error);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
