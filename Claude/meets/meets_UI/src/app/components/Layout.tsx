import { Outlet, NavLink, useLocation } from "react-router";
import { Search, Heart, User, MessageCircle, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { to: "/candidates", icon: Search, label: "探す" },
    { to: "/matches", icon: Heart, label: "お相手" },
    { to: "/chat", icon: MessageCircle, label: "メッセージ" },
    { to: "/agents", icon: ShieldCheck, label: "エージェント" },
    { to: "/profile", icon: User, label: "マイページ" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* PC Header */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 items-center px-8 shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
          meets
        </h1>
        <nav className="ml-auto flex space-x-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center space-x-2 font-medium transition-colors hover:text-pink-500",
                  isActive ? "text-pink-500" : "text-gray-500"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-pink-500" : "text-gray-400"
              )}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}