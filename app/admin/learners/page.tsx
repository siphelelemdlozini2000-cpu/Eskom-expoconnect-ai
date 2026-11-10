// app/admin/learners/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Users, Search, Mail, School, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

type SubmissionRecord = {
  id: string;
  learnerEmail: string;
  learnerName: string;
  school: string;
  region: string;
  projectTitle: string;
  category: string;
  abstract: string;
  files: Array<{ name: string; progress: number; complete: boolean }>;
  status: 'pending_admin_review' | 'matched_to_judge' | 'judging' | 'completed';
  assignedJudgeEmail?: string | null;
  assignedJudgeName?: string | null;
  submittedAt: string;
};

type LearnerRow = {
  id: string;
  name: string;
  email: string;
  school: string;
  region: string;
  project: string;
  status: string;
};

const statusLabel = (status?: SubmissionRecord['status']) => {
  switch (status) {
    case 'pending_admin_review':
      return 'Pending Admin Review';
    case 'matched_to_judge':
      return 'Judge Assigned';
    case 'judging':
      return 'Judging';
    case 'completed':
      return 'Completed';
    default:
      return 'Registered';
  }
};

export default function AdminLearnersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [learners, setLearners] = useState<LearnerRow[]>([]);

  useEffect(() => {
    const loadLearners = () => {
      try {
        const submissionsRaw = localStorage.getItem('demo_project_submissions');
        const submissions: SubmissionRecord[] = submissionsRaw ? JSON.parse(submissionsRaw) : [];

        const rows: LearnerRow[] = [];

        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('demo_profile_')) continue;

          const raw = localStorage.getItem(key);
          if (!raw) continue;

          try {
            const profile: DemoProfile = JSON.parse(raw);
            if (profile.role !== 'learner') continue;

            const learnerSubs = submissions.filter(
              (s) => s.learnerEmail.toLowerCase() === profile.email.toLowerCase()
            );

            const latest = learnerSubs[0];

            rows.push({
              id: profile.email.toLowerCase(),
              name: `${profile.firstName} ${profile.lastName}`.trim() || 'Learner',
              email: profile.email,
              school: profile.school || 'Not set',
              region: profile.province || 'Not set',
              project: latest?.projectTitle || 'No submission yet',
              status: latest?.status || 'Registered',
            });
          } catch {
            // ignore bad profile
          }
        }

        setLearners(rows);
      } catch {
        setLearners([]);
      }
    };

    loadLearners();

    const refresh = () => loadLearners();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('demo-data-changed', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('demo-data-changed', refresh as EventListener);
    };
  }, []);

  const filtered = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 mb-2">Participant Directory</Badge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registered Learners</h1>
          <p className="text-slate-500 mt-1">
            Manage registered student participants, view school affiliations, and track submission statuses.
          </p>
        </header>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search learners by name, school, region, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <Card className="border-0 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Learner Name</th>
                  <th className="p-4">School / Institution</th>
                  <th className="p-4">Region</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{l.name}</span>
                      <span className="text-xs text-slate-400">{l.email}</span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{l.school}</td>
                    <td className="p-4 text-slate-500 flex items-center gap-1 mt-2">
                      <MapPin size={14} className="text-slate-400" /> {l.region}
                    </td>
                    <td className="p-4 font-medium text-blue-600">{l.project}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}