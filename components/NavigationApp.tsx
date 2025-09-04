import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "~~/services/store/auth-store.";

export const NavigationApp = () => {
  const pathname = usePathname();
  const { userRole } = useAuthStore();

  const userMenuLinks = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Camera",
      href: "/order/camera",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Transactions",
      href: "/movements",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      ),
    },
  ];

  const allyMenuLinks = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: "Availables",
      href: "/availables",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
  ];

  const adminMenuLinks = [
    {
      label: "Home",
      href: "/admin",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: (
        <svg className="size-7 md:size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
  ];

  const currentMenuLinks = useMemo(() => {
    if (userRole === "admin") return adminMenuLinks;
    if (userRole === "ally") return allyMenuLinks;
    return userMenuLinks;
  }, [userRole]);

  return (
    <nav className="fixed bottom-0 z-10 w-full bg-base-100 dark:bg-base-300 border-t border-base-300 dark:border-base-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {currentMenuLinks.map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              href={href}
              key={href}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg min-w-[4rem] transition-all duration-200 ${
                isActive
                  ? "text-primary-content bg-primary/10"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200 dark:hover:bg-base-200"
              }`}
            >
              <div className={`transition-transform duration-200 mb-0.5 ${isActive ? "scale-110" : "scale-100"}`}>
                {icon}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
