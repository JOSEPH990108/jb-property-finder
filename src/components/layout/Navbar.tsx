// src/components/layout/Navbar.tsx

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  X,
  UserCircle,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import MegaMenuWrapper from "@/components/utils/MegaMenuWrapper";
import { Button } from "../ui/button";
import { useLeadFormStore } from "@/stores/leadFormStore";
import { useAuthStore } from "@/stores/authStore";

// -----
// Navbar = sticky header w/ mega menu, auth, and theming
// -----
export default function Navbar() {
  // ----- State & hooks -----
  const openLeadForm = useLeadFormStore((state) => state.openForm); // Opens appointment modal
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Tracks mobile hamburger menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // Tracks profile dropdown
  const dropdownRef = useRef<HTMLDivElement>(null); // For closing dropdown on outside click

  // User & auth actions (Zustand)
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // ----- Logout logic -----
  // This logs out both your app and Better Auth provider
  const handleLogout = useCallback(async () => {
    await logout();
    await fetch("/api/auth/signout", { method: "POST" });
  }, [logout]);

  // ----- Close dropdown if click outside -----
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -----
  // Render: Main Navbar
  // -----
  return (
    <header className="px-4 sm:px-6 lg:px-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* --- Logo --- */}
        <Link
          href="/"
          className="text-2xl font-bold text-primary dark:text-white"
        >
          JB Property Finder
        </Link>

        {/* --- Hamburger icon on mobile --- */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* --- Main Desktop Nav --- */}
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          {/* --- Projects Dropdown (MegaMenu) --- */}
          <div className="group relative">
            {/* Dropdown label */}
            <div className="flex items-center gap-1 text-zinc-800 dark:text-white hover:text-primary transition cursor-pointer">
              Projects
              <ChevronDown
                size={16}
                className="transition-transform duration-300 transform rotate-[-90deg] group-hover:rotate-0"
              />
            </div>
            {/* Dropdown content (Mega menu) */}
            <div className="fixed top-16 left-1/2 -translate-x-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 w-full max-w-4xl z-50 px-4">
              <MegaMenuWrapper>
                {/* --- New Projects --- */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    New Projects
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link
                        href="/projects/new"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        All New Projects
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/new?area=jb"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        Johor Bahru
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* --- Sub-Sale --- */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Sub-Sale</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link
                        href="/projects/sub-sale"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        All Sub-Sales
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/sub-sale?type=condo"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        Condo
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* --- Rental --- */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Rental</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link
                        href="/projects/rent"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        All Rentals
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects/rent?area=skudai"
                        className="hover:underline text-zinc-700 dark:text-zinc-300"
                      >
                        Skudai Area
                      </Link>
                    </li>
                  </ul>
                </div>
              </MegaMenuWrapper>
            </div>
          </div>

          {/* --- News link --- */}
          <Link
            href="/news"
            className="text-zinc-800 dark:text-white hover:text-primary transition"
          >
            News
          </Link>

          {/* --- Services Dropdown (Mini MegaMenu) --- */}
          <div className="group relative">
            {/* Dropdown label */}
            <div className="flex items-center gap-1 text-zinc-800 dark:text-white hover:text-primary transition cursor-pointer">
              Services
              <ChevronDown
                size={16}
                className="transition-transform duration-300 transform rotate-[-90deg] group-hover:rotate-0"
              />
            </div>
            {/* Dropdown content */}
            <div className="fixed top-16 left-1/2 -translate-x-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 w-full max-w-4xl z-50 px-4">
              <MegaMenuWrapper>
                {/* --- Consultation --- */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">
                    Consultation
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Property advice & strategy
                  </p>
                </div>
                {/* --- Legal --- */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Legal</h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    SPA, loan, documentation
                  </p>
                </div>
              </MegaMenuWrapper>
            </div>
          </div>

          {/* --- Book Appointment button --- */}
          <Button variant="default" onClick={() => openLeadForm()}>
            Book Appointment
          </Button>

          {/* --- User Profile Dropdown or Login Button --- */}
          {user ? (
            // Logged-in dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="flex items-center gap-1 text-zinc-800 dark:text-white hover:text-primary transition focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700"
                  />
                ) : (
                  <UserCircle className="w-6 h-6" />
                )}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {/* --- Profile dropdown menu --- */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-800 rounded-md shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700 z-50">
                  <ul className="py-1 text-sm text-zinc-700 dark:text-zinc-200">
                    <li>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 transition"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Not logged in: show Login
            <Link
              href="/login"
              className="text-zinc-800 dark:text-white hover:text-primary transition"
            >
              Login
            </Link>
          )}

          {/* --- Dark/Light theme toggle --- */}
          <ThemeToggle />
        </nav>
      </div>

      {/* --- Mobile nav menu --- */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-2 space-y-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          <Link href="/projects/new" className="block">
            New Projects
          </Link>
          <Link href="/projects/sub-sale" className="block">
            Sub-Sales
          </Link>
          <Link href="/projects/rent" className="block">
            Rentals
          </Link>
          <Link href="/news" className="block">
            News
          </Link>
          <Link href="/services" className="block">
            Services
          </Link>
          <ThemeToggle />
        </div>
      )}
    </header>
  );
}
