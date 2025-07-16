// app/profile/page.tsx
import { getSession } from "@/lib/auth/session";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto mt-20 px-4 text-center">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-white">
          Please log in to view your profile.
        </h1>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">My Profile</h1>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
            Personal Information
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Name:</strong> {user.name}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Phone:</strong> {user.phone || "-"}
          </p>
        </div>

        <div className="p-4 border rounded-lg dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-2">
            Preferences
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Preferred Location: Johor Bahru
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Budget: RM 500k - RM 1M
          </p>
        </div>

        <div className="flex justify-end">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
