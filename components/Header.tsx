"use client";

import React from "react";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoginButton } from "./LoginButton";
import { SwitchTheme } from "./SwitchTheme";
// import { hardhat } from "viem/chains";
import { ListIcon, ScanIcon, WalletIcon } from "~~/components/icons/index";
// import { Badge } from "~~/components/kibo";
// import { FaucetButton } from "~~/components/scaffold-eth";
// import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useAuthStore } from "~~/services/store/auth-store.";

// COLOR: Agregar useMemo

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const userMenuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <WalletIcon className="size-7 md:size-4" />,
  },
  {
    label: "Camera",
    href: "/order/camera",
    icon: <ScanIcon className="size-7 md:size-4" />,
  },
  {
    label: "Transactions",
    href: "/movements",
    icon: <ListIcon className="size-7 md:size-4" />,
  },
];

const allyMenuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <WalletIcon className="size-7 md:size-4" />,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: <WalletIcon className="size-7 md:size-4" />,
  },
  {
    label: "Availables",
    href: "/availables",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { userRole } = useAuthStore();

  const currentMenuLinks = userRole === "ally" ? allyMenuLinks : userMenuLinks;

  return (
    <>
      {currentMenuLinks.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              className={`${
                isActive ? "bg-primary text-white underline underline-offset-4" : "text-white"
              } hover:bg-primary/10 hover:text-base-content transition-all duration-200 py-2 px-4 text-sm rounded-full font-medium`}
            >
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { userRole } = useAuthStore(); // COLOR: Obtener el rol del usuario
  // COLOR: Determinar la clase de fondo según el rol
  const headerBackgroundClass = useMemo(() => {
    switch (userRole) {
      case "admin":
        return "bg-admin";
      case "ally":
        return "bg-ally";
      default:
        return "bg-primary"; // Mantener bg-primary como fallback
    }
  }, [userRole]);

  // const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;

  // const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  // useOutsideClick(burgerMenuRef, () => {
  //   burgerMenuRef?.current?.removeAttribute("open");
  // });

  return (
    <header className={`sticky ${headerBackgroundClass} top-0 min-h-0 shrink-0 z-20 header-scroll-shadow`}>
      <div className="navbar justify-between px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="navbar-start w-auto lg:w-1/2">
          <Link href="/" className="flex items-center gap-3 mr-6 shrink-0 group">
            <div
              className={`w-10 h-10 ${headerBackgroundClass} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
            >
              <Image alt="Kibo logo" className="cursor-pointer" width={24} height={24} src="/logo.svg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-white">Kibo</span>
              {/* {isLocalNetwork && (
                <Badge variant="warning" size="sm" className="text-xs mt-1">
                  Local
                </Badge>
              )} */}
            </div>
          </Link>
          <nav className="hidden lg:flex">
            <ul className="flex items-center gap-1">
              <HeaderMenuLinks />
            </ul>
          </nav>
        </div>
        <div className="navbar-end flex gap-3 items-center">
          <LoginButton />
          <SwitchTheme className="hover:text-primary transition-colors text-white" />
          {/* {isLocalNetwork && (
            <div className="flex items-center">
              <FaucetButton />
            </div>
          )} */}
        </div>
      </div>
    </header>
  );
};
