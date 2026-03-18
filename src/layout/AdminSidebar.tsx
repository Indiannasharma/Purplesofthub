"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import {
  GridIcon,
  UserCircleIcon,
  BoxCubeIcon,
  TableIcon,
  ListIcon,
  PageIcon,
  ChatIcon,
  MailIcon,
  PieChartIcon,
  PlugInIcon,
  CalenderIcon,
  HorizontaLDots,
} from "@/icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const MAIN_ITEMS: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/admin" },
  { name: "Clients", icon: <UserCircleIcon />, path: "/admin/clients" },
  { name: "Projects", icon: <BoxCubeIcon />, path: "/admin/projects" },
  { name: "Invoices", icon: <TableIcon />, path: "/admin/invoices" },
  { name: "Services", icon: <ListIcon />, path: "/admin/services" },
];

const CONTENT_ITEMS: NavItem[] = [
  { name: "Blog", icon: <PageIcon />, path: "/admin/blog" },
  { name: "Promotions", icon: <PieChartIcon />, path: "/admin/promotions" },
  { name: "Music", icon: <CalenderIcon />, path: "/admin/music" },
];

const ENGAGE_ITEMS: NavItem[] = [
  { name: "Leads", icon: <ChatIcon />, path: "/admin/leads" },
  { name: "Subscribers", icon: <MailIcon />, path: "/admin/subscribers" },
  { name: "Payments", icon: <PlugInIcon />, path: "/admin/payments" },
  { name: "Settings", icon: <UserCircleIcon />, path: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } =
    useSidebar();

  const isActive = (path: string) => pathname === path;

  const renderSection = (title: string, items: NavItem[]) => (
    <div>
      <h2
        className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? title : <HorizontaLDots />}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              onClick={() => {
                if (isMobileOpen) toggleMobileSidebar();
              }}
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
  );

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
        <Link href="/admin" className="flex items-center gap-3">
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
          <div className="flex flex-col gap-6">
            {renderSection("Main", MAIN_ITEMS)}
            {renderSection("Content", CONTENT_ITEMS)}
            {renderSection("Engage", ENGAGE_ITEMS)}
          </div>
        </nav>
      </div>
    </aside>
  );
}
