// app/admin/judges/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
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

type JudgeRow = {
  id: string;
  name: string;
  email: string;
  institution: string;
  region: string;
  workload: string;
  status: string;
};

export default function AdminJudgesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [judges, setJudges] = useState<JudgeRow[]>([]);

  useEffect(() => {
    const loadJudges = () => {
      try {
        const submissionsRaw = localStorage.getItem('demo_project_submissions');
        const submissions: SubmissionRecord[] = submissionsRaw ? JSON.parse(submissionsRaw) : [];
        const rows: JudgeRow[] = [];

        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith('demo_profile_')) continue;

          const raw = localStorage.getItem(key);
          if (!raw) continue;

          try {
            const profile: DemoProfile = JSON.parse(raw);
            if (profile.role !== 'judge') continue;

            const assigned = submissions.filter(
              (s) => s.assignedJudgeEmail?.toLowerCase() === profile.email.toLowerCase()
            );

            rows.push({
              id: profile.email.toLowerCase(),
              name: `${profile.firstName} ${profile.lastName}`.trim() || 'Judge',
              email: profile.email,
              institution: profile.school || 'Registered Judge',
              region: profile.province || 'Not set',
              workload: `${assigned.length} assigned`,
              status: assigned.length >= 15 ? 'At Capacity' : 'Active',
            });
          } catch {
            // ignore bad profile
          }
        }

        setJudges(rows);
      } catch {
        setJudges([]);
      }
    };

    loadJudges();

    const refresh = () => loadJudges();
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('demo-data-changed', refresh as EventListener);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('demo-data-changed', refresh as EventListener);
    };
  }, []);

  const filtered = judges.filter(
    (j) =>
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <Badge className="bg-green-50 text-green-700 border border-green-200 mb-2">Evaluator Directory</Badge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Judge Roster & Workload</h1>
          <p className="text-slate-500 mt-1">
            Monitor evaluator profiles, regional nodes, and review capacity in real time.
          </p>
        </header>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search judges by name, institution, or region..."
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
                  <th className="p-4">Judge Name</th>
                  <th className="p-4">Institution</th>
                  <th className="p-4">Region</th>
                  <th className="p-4">Assigned Workload</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block">{j.name}</span>
                      <span className="text-xs text-slate-400">{j.email}</span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{j.institution}</td>
                    <td className="p-4 text-slate-600">{j.region}</td>
                    <td className="p-4 font-mono font-medium text-slate-800">{j.workload}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          j.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                        }`}
                      >
                        <CheckCircle size={12} /> {j.status}
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