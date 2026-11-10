// app/admin/announcements/page.tsx
'use client';

import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminAnnouncementsPage() {
  const [targetGroup, setTargetGroup] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [usersReached, setUsersReached] = useState(0);

  // Helper to inject the notification into a specific user's inbox
  const sendNotification = (email: string, notifTitle: string, notifMessage: string) => {
    const notifKey = `demo_notifications_${email.toLowerCase()}`;
    const existing = JSON.parse(localStorage.getItem(notifKey) || '[]');
    existing.unshift({
      id: `notif_${Date.now()}_${Math.random()}`,
      title: notifTitle,
      message: notifMessage,
      date: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem(notifKey, JSON.stringify(existing));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSentSuccess(false);

    setTimeout(() => {
      let count = 0;
      
      // Scan local storage for all registered user profiles
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('demo_profile_')) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || '');
            
            // Map the dropdown value to the actual profile role
            const targetRole = targetGroup === 'learners' ? 'learner' : targetGroup === 'judges' ? 'judge' : 'all';

            // If it matches the target, send the notification!
            if (targetRole === 'all' || profile.role === targetRole) {
              sendNotification(profile.email, `📢 Official: ${title}`, message);
              count++;
            }
          } catch {
            // Ignore malformed profile data
          }
        }
      }

      // Fire global event to instantly update notification bells across all open tabs
      window.dispatchEvent(new Event('demo-notifications-updated'));

      setUsersReached(count);
      setIsSending(false);
      setSentSuccess(true);
      setTitle('');
      setMessage('');
      
      // Hide success message after 5 seconds
      setTimeout(() => setSentSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <Badge className="bg-orange-50 text-orange-700 border border-orange-200 mb-2">Communication Hub</Badge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Broadcast Announcements</h1>
          <p className="text-slate-500 mt-1">Send official platform notices, judging deadline reminders, or award updates to participants.</p>
        </header>

        {sentSuccess && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-green-800 text-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={20} className="text-green-600" />
            <span><strong>Announcement Broadcasted Successfully:</strong> Your notice was delivered to {usersReached} user portal(s).</span>
          </div>
        )}

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Bell size={18} className="text-orange-500" /> Compose New Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Target Recipient Group</label>
                <select 
                  value={targetGroup} 
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="all">All Active Users (Learners & Judges)</option>
                  <option value="learners">All Registered Learners Only</option>
                  <option value="judges">All Active Judges Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Notice Title / Subject</label>
                <input 
                  required 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Final Judging Submission Deadline Extended" 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Announcement Message</label>
                <textarea 
                  required 
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your official announcement here..." 
                  className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70"
              >
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {isSending ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}