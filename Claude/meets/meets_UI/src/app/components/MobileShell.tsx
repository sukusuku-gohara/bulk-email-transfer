import { Outlet, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { Home, Users, MessageCircle, Heart, User, Search } from "lucide-react";

const tabs = [
  { path: "/home", icon: Search, label: "さがす" },
  { path: "/candidates", icon: Heart, label: "お相手から" },
  { path: "/chat", icon: MessageCircle, label: "メッセージ" },
  { path: "/profile", icon: User, label: "マイページ" },
];

export function MobileShell() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 relative">
      <div className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between px-2 h-14">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
              >
                <div className="relative">
                  <tab.icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? "text-[#FF5A71]" : "text-gray-400"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Mock badge for message/likes */}
                  {tab.path === "/chat" && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#FF5A71] rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                      4
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-[#FF5A71]" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
