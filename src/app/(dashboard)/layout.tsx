
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Silently sync mock user — skip entirely if MongoDB is unavailable
  try {
    await connectToDatabase();
    await User.findOneAndUpdate(
      { clerkId: "mock-user-123" },
      { clerkId: "mock-user-123", name: "Mock User", email: "mock@example.com" },
      { upsert: true, new: true }
    );
  } catch {
    // MongoDB unreachable — local-store fallback handles all data needs.
    // Swallow silently; no console spam.
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
