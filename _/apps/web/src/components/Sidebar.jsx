import {
  LayoutGrid,
  Clock,
  TrendingUp,
  Settings,
  FolderOpen,
  User,
  X,
  Crown,
  Palette,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar({ isOpen, onClose }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data to check premium status
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/token");
        if (response.ok) {
          const { user: userData } = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/" },
    { icon: FolderOpen, label: "My Subjects", href: "/subjects" },
    { icon: Clock, label: "Pomodoro Timer", href: "/timer" },
    { icon: TrendingUp, label: "Progress", href: "/progress" },
    { icon: Palette, label: "Themes", href: "/themes" },
    { icon: User, label: "Profile & Friends", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full w-60 bg-white border-r border-[#E8E9EC] z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap");
      `}</style>

      {/* Sidebar Header */}
      <div className="pt-6 pb-4 px-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg">IB Study Hub</h2>
        <button
          onClick={onClose}
          className="md:hidden p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4">
        <ul className="space-y-1">
          {!user?.is_premium && (
            <li>
              <a
                href="/premium"
                className="flex items-center gap-3 py-2 pl-3 rounded-md transition-colors bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 mb-2"
              >
                <Crown size={20} />
                <span className="font-semibold">Upgrade to Premium</span>
              </a>
            </li>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 py-2 pl-3 rounded-md transition-colors ${
                    isActive ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-[#2962FF]" : "text-gray-400"}
                  />
                  <span
                    className={
                      isActive
                        ? "font-semibold text-[#2962FF]"
                        : "text-gray-400"
                    }
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        <a
          href="/account/logout"
          className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign Out
        </a>
        <div className="flex justify-center gap-3 text-xs text-gray-400">
          <a href="/terms" className="hover:text-gray-600 transition-colors">
            Terms
          </a>
          <span>•</span>
          <a href="/privacy" className="hover:text-gray-600 transition-colors">
            Privacy
          </a>
        </div>
        <div className="text-xs text-gray-400 text-center">
          Study smart, achieve more 🎓
        </div>
      </div>
    </aside>
  );
}
