export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <div className="mb-6 self-start">
        <h1 className="text-3xl font-bold tracking-tight text-white">User Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account settings and credentials.</p>
      </div>
      
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-xl text-center">
        <p className="text-zinc-400">Profile management is temporarily disabled.</p>
      </div>
    </div>
  );
}
