// app/admin/judge-matching/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  BrainCircuit,
  UserCheck,
  Briefcase,
  GraduationCap,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

type JudgeRecommendation = {
  id: string;
  name: string;
  email: string;
  institution: string;
  matchScore: number;
  currentLoad: number;
  maxLoad: number;
  expertise: string[];
  conflict: string | null;
  reason: string;
};

const STATIC_JUDGES: JudgeRecommendation[] = [
  {
    id: 'j_01',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@demo.local',
    institution: 'CSIR',
    matchScore: 94,
    currentLoad: 2,
    maxLoad: 5,
    expertise: ['Cryptography', 'Network Architecture', 'Data Security'],
    conflict: null,
    reason: 'Strong alignment with cryptography and cybersecurity keywords.',
  },
  {
    id: 'j_02',
    name: 'Prof. Alan Turing',
    email: 'alan.turing@demo.local',
    institution: 'Nelson Mandela University',
    matchScore: 88,
    currentLoad: 1,
    maxLoad: 5,
    expertise: ['Software Development', 'Backend Systems', 'Algorithms'],
    conflict: 'Institutional Conflict',
    reason: 'Matches software engineering category, but shares the same institution.',
  },
  {
    id: 'j_03',
    name: 'Ms. Lerato Khumalo',
    email: 'lerato.khumalo@demo.local',
    institution: 'Nexus Community Tech',
    matchScore: 76,
    currentLoad: 4,
    maxLoad: 5,
    expertise: ['Digital Inclusion', 'Frontend Web', 'Python'],
    conflict: 'Workload Warning',
    reason: 'Relevant background, but currently near capacity.',
  },
];

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

const buildRegisteredJudges = (): JudgeRecommendation[] => {
  const judges: JudgeRecommendation[] = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('demo_profile_')) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const profile: DemoProfile = JSON.parse(raw);
      if (profile.role !== 'judge') continue;

      judges.push({
        id: `registered_${profile.email.toLowerCase()}`,
        name: `${profile.firstName} ${profile.lastName}`.trim() || 'Judge',
        email: profile.email,
        institution: profile.school || 'Registered Institution',
        matchScore: 82,
        currentLoad: 0,
        maxLoad: 5,
        expertise: [profile.province || 'General Review'],
        conflict: null,
        reason: 'Registered judge profile from ExpoConnect AI.',
      });
    } catch {
      // ignore bad data
    }
  }

  return judges;
};

export default function AdminMatchingEngine() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [selectedJudge, setSelectedJudge] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [registeredJudges, setRegisteredJudges] = useState<JudgeRecommendation[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('demo_project_submissions');
      const list: SubmissionRecord[] = raw ? JSON.parse(raw) : [];
      setSubmissions(list);

      if (list.length > 0) {
        const firstPending = list.find((s) => s.status === 'pending_admin_review') ?? list[0];
        setSelectedSubmissionId(firstPending.id);
      }
    } catch {
      setSubmissions([]);
      setSelectedSubmissionId('');
    }

    setRegisteredJudges(buildRegisteredJudges());
  }, []);

  const allJudges = useMemo(
    () => [...registeredJudges, ...STATIC_JUDGES],
    [registeredJudges]
  );

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === selectedSubmissionId) ?? null,
    [submissions, selectedSubmissionId]
  );

  const recommendations = useMemo(() => {
    if (!selectedSubmission) return allJudges;

    const text = `${selectedSubmission.projectTitle} ${selectedSubmission.category} ${selectedSubmission.abstract}`.toLowerCase();
    const schoolText = (selectedSubmission.school || '').toLowerCase();

    return [...allJudges]
      .map((judge) => {
        let score = judge.matchScore;

        if (text.includes('software') && judge.expertise.includes('Software Development')) score += 4;
        if (text.includes('security') && judge.expertise.includes('Data Security')) score += 4;
        if (text.includes('cryptography') && judge.expertise.includes('Cryptography')) score += 4;

        if (schoolText.includes(judge.institution.toLowerCase())) {
          return { ...judge, conflict: 'Institutional Conflict', matchScore: score - 15 };
        }

        return { ...judge, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedSubmission, allJudges]);

  const persist = (next: SubmissionRecord[]) => {
    setSubmissions(next);
    localStorage.setItem('demo_project_submissions', JSON.stringify(next));
  };

  const handleAssign = (judge: JudgeRecommendation) => {
    if (!selectedSubmission) return;

    setIsAssigning(true);

    setTimeout(() => {
      setSubmissions((prev) => {
        const next = prev.map((sub): SubmissionRecord =>
          sub.id === selectedSubmission.id
            ? {
              ...sub,
              status: 'matched_to_judge',
              assignedJudgeEmail: judge.email,
              assignedJudgeName: judge.name,
            }
            : sub
        );

        localStorage.setItem('demo_project_submissions', JSON.stringify(next));
        return next;
      });

      setSelectedJudge(judge.id);
      setIsAssigning(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-eskom-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="text-eskom-orange" size={28} />
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Judge Allocation</h1>
            </div>
            <p className="text-slate-500">Match learner submissions to judges from the submission queue.</p>
          </div>
        </header>

        {submissions.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select submission</label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => {
                setSelectedSubmissionId(e.target.value);
                setSelectedJudge(null);
              }}
              className="w-full md:w-[420px] p-3 border border-slate-200 rounded-lg bg-white"
            >
              {submissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.projectTitle} — {sub.learnerName}
                </option>
              ))}
            </select>
          </div>
        )}

        {!selectedSubmission ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-slate-500">No submissions found.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-0 shadow-soft">
                <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                  <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 w-fit mb-2">
                    {selectedSubmission.status}
                  </Badge>
                  <CardTitle className="text-lg text-eskom-blue leading-tight">
                    {selectedSubmission.projectTitle}
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                    <GraduationCap size={16} /> {selectedSubmission.learnerName}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Briefcase size={16} /> {selectedSubmission.school}
                  </p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                    <p className="text-sm text-slate-700 font-medium">{selectedSubmission.category}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <BarChart3 size={18} className="text-eskom-green" />
                    Live Judge Workload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                          {workloadData.map((entry: { name: string; active: number; max: number }, index: number) => (
                            <Cell key={index} fill={entry.active / entry.max > 0.8 ? '#FF7900' : '#005596'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <motion.div className="lg:col-span-2 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                AI Recommendations <Badge className="bg-eskom-green ml-2">{recommendations.length} Found</Badge>
              </h2>

              {recommendations.map((judge) => (
                <Card
                  key={judge.id}
                  className={`border ${
                    judge.conflict?.includes('Institutional') ? 'border-red-200 bg-red-50/30' : 'border-slate-100'
                  } shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
                >
                  <AnimatePresence>
                    {selectedJudge === judge.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-eskom-green/10 border-2 border-eskom-green z-10 flex items-center justify-end pr-8"
                      >
                        <Badge className="bg-eskom-green text-white text-lg py-1 px-3 flex items-center gap-2">
                          <CheckCircle size={18} /> Assigned Successfully
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{judge.name}</h3>
                          <p className="text-sm text-slate-500">{judge.institution}</p>
                        </div>
                        {judge.conflict && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-none flex items-center gap-1">
                            <AlertTriangle size={14} /> {judge.conflict}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-semibold text-eskom-blue">AI Reason: </span>
                        {judge.reason}
                      </p>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-grow max-w-[200px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Workload Capacity</span>
                            <span className="font-medium">
                              {judge.currentLoad} / {judge.maxLoad}
                            </span>
                          </div>
                          <Progress value={(judge.currentLoad / judge.maxLoad) * 100} className="h-1.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleAssign(judge)}
                        disabled={!!judge.conflict?.includes('Institutional') || isAssigning}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all shadow-sm flex items-center gap-2 ${
                          !!judge.conflict?.includes('Institutional')
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-eskom-blue text-white hover:bg-blue-700 hover:shadow-md'
                        }`}
                      >
                        {isAssigning ? <UserCheck size={18} /> : <>Assign <ChevronRight size={16} /></>}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

const workloadData: Array<{ name: string; active: number; max: number }> = [
  { name: 'Computer Sci', active: 24, max: 30 },
  { name: 'Engineering', active: 18, max: 25 },
  { name: 'Physics', active: 12, max: 20 },
  { name: 'Chemistry', active: 28, max: 30 },
  { name: 'Biology', active: 15, max: 25 },
];