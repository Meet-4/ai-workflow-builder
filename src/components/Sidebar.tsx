"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { 
  LayoutDashboard, 
  Network, 
  PlusCircle, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Workflow,
  Sparkles,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function Sidebar() {
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: SidebarItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workflows", href: "/workflows", icon: Network },
    { name: "Create Workflow", href: "/create", icon: PlusCircle },
    { name: "AI Generator", href: "/generate", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r border-zinc-800 bg-zinc-950/60 backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition shadow-md hover:border-zinc-700"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-zinc-900",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Workflow size={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-white tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              FlowMind AI
            </span>
          )}
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                isActive 
                  ? "bg-violet-600/10 text-violet-400 border border-violet-500/20" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              )}
            >
              {/* Left active marker */}
              {isActive && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-violet-500" />
              )}
              
              <Icon 
                size={18} 
                className={cn(
                  "flex-shrink-0 transition-transform group-hover:scale-105 duration-200",
                  isActive ? "text-violet-400" : "text-zinc-400 group-hover:text-white"
                )} 
              />
              
              {!isCollapsed && (
                <span className="ml-3 transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
