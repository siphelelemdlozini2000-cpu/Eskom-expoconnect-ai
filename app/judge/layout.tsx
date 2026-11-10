// app/judge/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DemoProfile = {
  role: 'learner' | 'judge' | 'admin';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school?: string;
  province?: string;
  createdAt: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [judgeName, setJudgeName] = useState('Judge');
  const [userEmail, setUserEmail] = useState('');
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const loadProfileAndNotifications = () => {
    try {
      const activeRaw = localStorage.getItem('demo_active_profile');
      if (activeRaw) {
        const activeProfile: DemoProfile = JSON.parse(activeRaw);
        if (activeProfile?.role === 'judge') {
          setJudgeName(
            `${activeProfile.firstName || ''} ${activeProfile.lastName || ''}`.trim() ||
              activeProfile.email ||
              'Judge'
          );
          setUserEmail(activeProfile.email.toLowerCase());
          
          // Load notifications specific to this judge
          const notifsRaw = localStorage.getItem(`demo_notifications_${activeProfile.email.toLowerCase()}`);
          if (notifsRaw) {
            setNotifications(JSON.parse(notifsRaw));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfileAndNotifications();

    const handleUpdate = () => loadProfileAndNotifications();
    window.addEventListener('demo-notifications-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('demo-notifications-updated', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('demo_active_profile');
    router.push('/login');
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (userEmail) {
      localStorage.setItem(`demo_notifications_${userEmail}`, JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-8 h-8 bg-slate-50 rounded-lg p-1 flex items-center justify-center border border-slate-100">
              <Image src="/EskomExpo.jpg" alt="Logo" fill className="object-contain p-0.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                ExpoConnect <span className="text-blue-600">AI</span>
              </h2>
              <span className="text-slate-300 font-light hidden sm:block">|</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden sm:block flex items-center gap-1">
                <ShieldCheck size={14} className="text-green-600" /> Judge Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATION BELL */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50"
                  >
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 font-semibold hover:underline">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`px-4 py-3 border-b border-slate-50 flex gap-3 ${notif.read ? 'bg-white opacity-60' : 'bg-blue-50/30'}`}>
                            <div className="mt-0.5">
                              <CheckCircle2 size={16} className={notif.read ? "text-slate-400" : "text-green-500"} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 mt-2 block">
                                {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">
                {judgeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 leading-none">{judgeName}</span>
                <span className="text-[10px] text-slate-500 leading-none mt-0.5">Senior Evaluator</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>
    </div>
  );
}