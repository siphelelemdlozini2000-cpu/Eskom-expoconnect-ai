// app/admin/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, Users, Award, 
  CheckCircle2, Bell, BarChart3, LogOut, ShieldCheck 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const navItems = [
    { name: 'Analytics Overview', href: '/admin/analytics', icon: LayoutDashboard },
    { name: 'Submissions', href: '/admin/submissions', icon: FileText },
    { name: 'Learner Directory', href: '/admin/learners', icon: Users },
    { name: 'Judge Roster', href: '/admin/judges', icon: ShieldCheck },
    { name: 'Scores & Leaderboard', href: '/admin/scores', icon: Award },
    { name: 'Broadcast Announcements', href: '/admin/announcements', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="relative w-8 h-8 bg-white rounded-lg p-1 flex items-center justify-center">
              <Image 
                src="/EskomExpo.jpg" 
                alt="Logo" 
                fill 
                className="object-contain p-0.5" 
              />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">ExpoConnect <span className="text-blue-400">AI</span></h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Admin Portal</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Management Suite</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="bg-slate-800/50 p-3 rounded-xl mb-3 flex items-center gap-3 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@eskomexpo.co.za</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2.5 rounded-lg text-xs font-semibold transition-all border border-slate-700 hover:border-red-500/30"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">ExpoConnect AI <span className="text-blue-400">Admin</span></span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-xs font-semibold"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}