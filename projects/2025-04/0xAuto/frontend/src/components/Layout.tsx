"use client"; // Required for hooks like usePathname

import React, { useState, useEffect } from "react"; // Import useState, useEffect
import Image from "next/image";
import Link from "next/link"; // Import Link
import { usePathname } from "next/navigation"; // Import usePathname
import {
  CpuChipIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon, // For avatar placeholder
  CreditCardIcon, // For points
  StarIcon, // Added for Subscription
  SunIcon, // For theme toggle
  MoonIcon, // For theme toggle
} from "@heroicons/react/24/outline"; // Import necessary icons

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname(); // Get current path
  const [currentTheme, setCurrentTheme] = useState("cyberpunk"); // Default theme

  // Apply theme to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === "cyberpunk" ? "light" : "cyberpunk");
  };

  // Define menu items with icons
  const menuItems = [
    { path: "/agents", label: "Agents", icon: CpuChipIcon },
    { path: "/store", label: "Store", icon: BuildingStorefrontIcon },
    { path: "/dashboard", label: "Dashboard", icon: ChartBarIcon },
    { path: "/subscription", label: "Subscription", icon: StarIcon }, // Added Subscription item
    { path: "/setting", label: "Setting", icon: Cog6ToothIcon },
  ];

  // Mock data for points (replace with actual data later)
  const userPoints = 1234;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {" "}
        {/* Main content area */}
        {/* Navbar - Simplified, only shows toggle on small screens */}
        <div className="navbar bg-base-100 w-full sticky top-0 z-30 lg:hidden">
          {" "}
          {/* Only visible on small screens */}
          <div className="flex-none">
            {" "}
            {/* Drawer toggle */}
            <label
              htmlFor="my-drawer-2"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <h1 className="flex-1 px-2 mx-2 font-pixel">
            {" "}
            {/* Title */}
            0xAuto
          </h1>
        </div>
        {/* Page content */}
        <main className="p-4 w-full flex-grow">{children}</main>
      </div>
      <div className="drawer-side">
        {" "}
        {/* Sidebar */}
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        {/* Use flex column and justify-between to push user section to bottom */}
        <div className="flex flex-col justify-between p-4 w-72 min-h-full bg-base-200 text-base-content">
          {" "}
          {/* Increased width to w-72 */}
          {/* Top section: Logo and Menu */}
          <div>
            <div className="mb-4 text-lg font-bold">
              <Link
                className="font-pixel flex items-center gap-2"
                href="/agents"
              >
                <Image
                  src="/logo.png"
                  alt="0xAuto Logo"
                  width={32}
                  height={32}
                  className="transition-transform duration-700 ease-in-out hover:rotate-[360deg]"
                />
                <span className="font-pixel text-2xl">0xAuto</span>
              </Link>
            </div>
            <ul className="menu w-full">
              {/* Map through menu items */}
              {menuItems.map((item) => (
                <li key={item.path} className="mb-2">
                  {" "}
                  {/* Added mb-2 for spacing */}
                  <Link
                    href={item.path}
                    className={`${
                      pathname.startsWith(item.path) ? "active" : ""
                    } flex gap-2 p-2 text-lg w-full`} // Check if pathname starts with item.path for active state
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />{" "}
                    {/* Increased icon size slightly, added flex-shrink-0 */}
                    <span className="flex-grow">{item.label}</span>{" "}
                    {/* Allow label to grow */}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Bottom section: Points and User */}
          <div className="mt-auto pt-4 border-t border-base-300">
            {" "}
            {/* Add margin-top auto and padding-top */}
            {/* Points Display */}
            <div className="mb-2 p-2 rounded bg-base-300 text-sm flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 opacity-70" />
              <span>Points: {userPoints}</span>
            </div>
            {/* Theme Toggle will be moved next to username */}
            {/* User Avatar Dropdown */}
            <div className="dropdown dropdown-top w-50%">
              {" "}
              {/* Changed to dropdown-top */}
              {/* Adjusted padding & height */}
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost w-full justify-start items-center px-1 py-1 h-auto"
              >
                {/* User Avatar */}
                <div className="avatar w-8 mr-2 flex-shrink-0">
                  {" "}
                  {/* Added flex-shrink-0 */}
                  <div className="rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                    {" "}
                    {/* Added ring for visibility */}
                    <UserCircleIcon className="w-full h-full text-base-content opacity-60" />{" "}
                    {/* Using Heroicon */}
                  </div>
                </div>
                {/* Username */}
                <span className="flex-grow text-left mr-1">MockUser</span>{" "}
                {/* Adjusted margin */}
                {/* Theme Toggle Button */}
              </div>
              <ul
                tabIndex={0}
                className="mb-1 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-300 rounded-box w-52"
              >
                <li>
                  <a>Profile</a>
                </li>{" "}
                {/* Placeholder */}
                <li>
                  <Link href="/setting">Settings</Link>
                </li>{" "}
                {/* Link to settings */}
                <li>
                  <a>Logout</a>
                </li>{" "}
                {/* Placeholder */}
              </ul>
            </div>
            <label className="swap swap-rotate btn btn-ghost btn-circle btn-lg ml-auto">
              {" "}
              {/* Use circle, small size, align right */}
              <input
                type="checkbox"
                onChange={toggleTheme}
                checked={currentTheme === "light"}
                aria-label="Toggle theme"
              />
              <SunIcon className="swap-on h-4 w-4" />{" "}
              {/* Slightly smaller icon */}
              <MoonIcon className="swap-off h-4 w-4" />{" "}
              {/* Slightly smaller icon */}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
