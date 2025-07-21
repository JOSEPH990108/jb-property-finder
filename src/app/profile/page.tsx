// src\app\profile\page.tsx
import { getSession } from "@/lib/auth/session";
import ProfileContent from "./ProfileContent";

// Fake user preferences (replace with DB fetch if needed)
const preferences = {
  location: "Johor Bahru",
  budget: "RM 500k - RM 1M",
};

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

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">My Profile</h1>
      {/* Pass user and preferences to client component */}
      <ProfileContent user={session.user} preferences={preferences} />
    </div>
  );
}
