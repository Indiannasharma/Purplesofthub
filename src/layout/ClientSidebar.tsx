"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  GridIcon,
  BoxCubeIcon,
  TableIcon,
  ListIcon,
  CalenderIcon,
  FileIcon,
  UserCircleIcon,
  HorizontaLDots,
} from "@/icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const MAIN_ITEMS: NavItem[] = [
  { name: "Overview", icon: <GridIcon />, path: "/dashboard" },
  { name: "Services", icon: <ListIcon />, path: "/dashboard/services" },
  { name: "Projects", icon: <BoxCubeIcon />, path: "/dashboard/projects" },
  { name: "Music Promotion", icon: <CalenderIcon />, path: "/dashboard/music" },
  { name: "Files", icon: <FileIcon />, path: "/dashboard/files" },
  { name: "Invoices", icon: <TableIcon />, path: "/dashboard/invoices" },
  { name: "Settings", icon: <UserCircleIcon />, path: "/dashboard/settings" },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="PurpleSoftHub"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="PurpleSoftHub"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="PurpleSoftHub"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
            </h2>
            <ul className="flex flex-col gap-2">
              {MAIN_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`menu-item group ${
                      isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`${
                        isActive(item.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
