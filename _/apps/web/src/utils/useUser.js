import * as React from "react";
import { useSession } from "@auth/create/react";

// Fetch preferences from your API
const fetchPreferences = async (userId) => {
  if (!userId) return null;
  try {
    const res = await fetch("/api/preferences");
    if (!res.ok) throw new Error("Failed to fetch preferences");
    const data = await res.json();
    return data.preferences;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const useUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = React.useState(session?.user ?? null);

  React.useEffect(() => {
    if (!session?.user) return;

    fetchPreferences(session.user.id).then((prefs) => {
      setUser({ ...session.user, preferences: prefs });
    });
  }, [session?.user]);

  return {
    user,
    data: user,
    loading: status === "loading" || (status === "authenticated" && !user),
    refetch: () => {}, // optional
  };
};

export { useUser };
export default useUser;