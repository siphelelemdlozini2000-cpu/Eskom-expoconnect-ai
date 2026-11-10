// app/admin/submissions/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Loader2, UserPlus, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SubmissionStatus = 'pending_admin_review' | 'matched_to_judge' | 'judging' | 'completed' | 'published';

type SubmissionRecord = {
  id: string;
  learnerEmail: string;
  learnerName: string;
  school: string;
  region: string;
  projectTitle: string;
  category: string;
  abstract: string;
  files: Array<{ name: string; data?: string; progress: number; complete: boolean }>;
  status: SubmissionStatus;
  assignedJudgeEmail?: string | null;
  assignedJudgeName?: string | null;
  submittedAt: string;
  judgeScore?: string;
  judgeFeedback?: string;
};

type DemoProfile = {
  role: 'learner' | 'judge' | 'admin';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school?: string;
  province?: string;
  qualification?: string;
  scientificDisciplines?: string;
  createdAt: string;
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

// We keep a few static judges just to populate the list if no one registers
const STATIC_JUDGES: JudgeRecommendation[] = [
  {
    id: 'j_01',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@demo.local',
    institution: 'CSIR',
    matchScore: 60,
    currentLoad: 2,
    maxLoad: 5,
    expertise: ['Computer Sciences & Software', 'Data Security'],
    conflict: null,
    reason: 'Matches software engineering and cyber keywords.',
  },
  {
    id: 'j_02',
    name: 'Prof. Alan Turing',
    email: 'alan.turing@demo.local',
    institution: 'Nelson Mandela University',
    matchScore: 55,
    currentLoad: 1,
    maxLoad: 5,
    expertise: ['Mathematics & Data Science', 'Algorithms'],
    conflict: null,
    reason: 'Strong mathematical modeling background.',
  }
];

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [registeredJudges, setRegisteredJudges] = useState<JudgeRecommendation[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [selectedJudgeBySubmission, setSelectedJudgeBySubmission] = useState<Record<string, string>>({});
  const [isMatching, setIsMatching] = useState(false);
  const [manualAssigningId, setManualAssigningId] = useState<string | null>(null);

  // 1. EXTRACT NEW JUDGE DISCIPLINES FROM REGISTRATION
  const loadRegisteredJudges = useCallback((): JudgeRecommendation[] => {
    const judges: JudgeRecommendation[] = [];

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('demo_profile_')) continue;

      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const profile: DemoProfile = JSON.parse(raw);
        if (profile.role !== 'judge') continue;

        // Pull the exact discipline the judge chose when registering
        const mainDiscipline = profile.scientificDisciplines || 'General Review';

        judges.push({
          id: `registered_${profile.email.toLowerCase()}`,
          name: `${profile.firstName} ${profile.lastName}`.trim() || 'Judge',
          email: profile.email,
          institution: profile.school || 'Registered Institution',
          matchScore: 50, // Base starting score for registered users
          currentLoad: 0,
          maxLoad: 5,
          expertise: [mainDiscipline], // Store it securely in their expertise array
          conflict: null,
          reason: `Registered expert in ${mainDiscipline}.`,
        });
      } catch {
        // ignore malformed data
      }
    }

    return judges;
  }, []);

  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem('demo_project_submissions');
      const parsed = raw ? JSON.parse(raw) : [];
      const list: SubmissionRecord[] = Array.isArray(parsed) ? parsed : [];

      setSubmissions(list);

      if (list.length > 0) {
        const firstPending = list.find((s) => s.status === 'pending_admin_review') ?? list[0];
        setSelectedSubmissionId(firstPending.id);
      } else {
        setSelectedSubmissionId('');
      }
    } catch {
      setSubmissions([]);
      setSelectedSubmissionId('');
    }

    setRegisteredJudges(loadRegisteredJudges());
  }, [loadRegisteredJudges]);

  useEffect(() => {
    loadData();

    const handleRefresh = () => loadData();

    window.addEventListener('storage', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('demo-data-changed', handleRefresh as EventListener);

    return () => {
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('demo-data-changed', handleRefresh as EventListener);
    };
  }, [loadData]);

  const allJudges = useMemo(() => [...registeredJudges, ...STATIC_JUDGES], [registeredJudges]);

  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.id === selectedSubmissionId) ?? null,
    [submissions, selectedSubmissionId]
  );
  
  const completedSubmission = useMemo(
    () => submissions.find((s) => s.status === 'completed'),
    [submissions]
  );

  // 2. THE DYNAMIC AI MATCHING ALGORITHM
  const recommendations = useMemo(() => {
    if (!selectedSubmission) return allJudges;

    const submissionCategory = selectedSubmission.category.toLowerCase();
    const schoolText = (selectedSubmission.school || '').toLowerCase();

    return [...allJudges]
      .map((judge) => {
        let score = judge.matchScore;
        let conflict = judge.conflict;
        let reason = judge.reason;

        // A. Direct Scientific Discipline Match!
        const hasDirectMatch = judge.expertise.some(exp => exp.toLowerCase() === submissionCategory);
        
        if (hasDirectMatch) {
          score += 50; // Massive score boost to guarantee they sit at #1
          reason = `Perfect Match: Specializes exactly in ${selectedSubmission.category}.`;
        }

        // B. Conflict of Interest Check (Same School)
        if (schoolText && schoolText.includes(judge.institution.toLowerCase()) && judge.institution.length > 3) {
          conflict = 'Institutional Conflict';
          score -= 100; // Heavy penalty
          reason = `Conflict Warning: Shares the same institution (${judge.institution}).`;
        }

        return { ...judge, matchScore: score, reason, conflict };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedSubmission, allJudges]);

  const saveSubmissions = useCallback((next: SubmissionRecord[]) => {
    setSubmissions(next);
    localStorage.setItem('demo_project_submissions', JSON.stringify(next));
    window.dispatchEvent(new Event('demo-data-changed'));
  }, []);

  const runAiMatching = () => {
    if (!selectedSubmission) return;

    setIsMatching(true);

    setTimeout(() => {
      // Find the #1 highest scoring judge who does NOT have a conflict
      const bestJudge = recommendations.find((judge) => !judge.conflict) ?? recommendations[0];

      if (!bestJudge) {
        setIsMatching(false);
        return;
      }

      const next = submissions.map((sub): SubmissionRecord =>
        sub.id === selectedSubmission.id
          ? {
              ...sub,
              status: 'matched_to_judge',
              assignedJudgeEmail: bestJudge.email,
              assignedJudgeName: bestJudge.name,
            }
          : sub
      );

      saveSubmissions(next);
      localStorage.setItem(`demo_workflow_step_${selectedSubmission.learnerEmail.toLowerCase()}`, '2_assigned');

      setIsMatching(false);
    }, 1200);
  };

  const assignJudgeManually = (submissionId: string, judgeEmail: string) => {
    const judge = allJudges.find((item) => item.email === judgeEmail);
    if (!judge) return;

    setManualAssigningId(submissionId);

    setTimeout(() => {
      const submission = submissions.find(s => s.id === submissionId);
      const next = submissions.map((sub): SubmissionRecord =>
        sub.id === submissionId
          ? {
              ...sub,
              status: 'matched_to_judge',
              assignedJudgeEmail: judge.email,
              assignedJudgeName: judge.name,
            }
          : sub
      );

      saveSubmissions(next);
      if (submission) {
         localStorage.setItem(`demo_workflow_step_${submission.learnerEmail.toLowerCase()}`, '2_assigned');
      }
      
      setManualAssigningId(null);
      setSelectedJudgeBySubmission((prev) => ({ ...prev, [submissionId]: '' }));
    }, 700);
  };

const handlePublishResults = () => {
    if (completedSubmission) {
      const next = submissions.map((sub): SubmissionRecord =>
        sub.id === completedSubmission.id ? { ...sub, status: 'published' } : sub
      );
      saveSubmissions(next);
      
      const emailKey = completedSubmission.learnerEmail.toLowerCase();
      localStorage.setItem(`demo_workflow_step_${emailKey}`, '4_published');
      localStorage.setItem(`demo_project_status_${emailKey}`, 'Published');
    }
    
    // Removed the redirect and updated the alert message!
    alert("Results successfully published! The learner can now view their scores.");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <Badge className="bg-green-50 text-green-700 border border-green-200 mb-2">
              Admin Control Center
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900">Project Submissions & AI Matching</h1>
            <p className="text-slate-500 mt-1">
              Review learner submissions, view AI recommendation rationale, and assign judges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runAiMatching}
              disabled={isMatching || !selectedSubmission || selectedSubmission.status !== 'pending_admin_review'}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              {isMatching ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="text-yellow-300" />}
              {isMatching ? 'Matching...' : 'Run AI Judge Matching'}
            </button>

            <button type="button" onClick={loadData} className="text-sm font-semibold text-blue-700 hover:underline">
              Refresh submissions
            </button>
          </div>
        </header>
        
        {/* ACTION REQUIRED BANNER */}
        {completedSubmission && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border border-orange-200 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-orange-800 font-bold flex items-center gap-2"><AlertCircle size={16} /> Action Required: Review Evaluation</h3>
              <p className="text-orange-700 text-xs mt-1">
                Judge submitted a final score of <strong>{completedSubmission.judgeScore}/100</strong> for "{completedSubmission.projectTitle}". Review and publish to release to the learner.
              </p>
            </div>
            <button onClick={handlePublishResults} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors">
              Approve & Publish Results
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Project Title</th>
                      <th className="p-4">Learner</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Judge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {submissions.length === 0 ? (
                      <tr>
                        <td className="p-4 text-slate-500 text-center" colSpan={5}>
                          No submissions found.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((submission) => {
                        const assignedLabel = submission.assignedJudgeName || submission.assignedJudgeEmail || 'Unassigned';
                        const isSelected = selectedSubmissionId === submission.id;

                        return (
                          <tr
                            key={submission.id}
                            onClick={() => setSelectedSubmissionId(submission.id)}
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                          >
                            <td className="p-4 font-semibold text-slate-900">{submission.projectTitle}</td>
                            <td className="p-4 font-medium text-slate-800">{submission.learnerName}</td>
                            <td className="p-4 text-slate-600 text-xs">{submission.category}</td>
                            <td className="p-4 text-slate-700">
                              {submission.status === 'published' ? 'Published' : submission.status.replace(/_/g, ' ')}
                            </td>
                            <td className="p-4 text-slate-700 text-xs font-semibold">
                              {assignedLabel}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white sticky top-24">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500"/> AI Engine Recommendations
                </h3>
                {selectedSubmission ? (
                  <p className="text-xs text-slate-500 mt-1">Analyzing matches for: <span className="font-semibold text-blue-600">{selectedSubmission.category}</span></p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Select a project to view matches.</p>
                )}
              </div>
              
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {!selectedSubmission ? (
                  <div className="text-center text-sm text-slate-400 py-8">No project selected</div>
                ) : (
                  recommendations.map((judge, idx) => (
                    <div key={judge.id} className={`p-3 rounded-lg border ${judge.conflict ? 'bg-red-50 border-red-100' : idx === 0 ? 'bg-green-50 border-green-200 ring-1 ring-green-500/20' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                            {judge.name} 
                            {idx === 0 && !judge.conflict && <Badge className="ml-1 bg-green-500 text-white text-[10px] px-1.5 py-0">Top Match</Badge>}
                          </h4>
                          <span className="text-xs text-slate-500">{judge.institution}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${judge.conflict ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {judge.conflict ? 'Conflict' : `${judge.matchScore} Pts`}
                        </span>
                      </div>
                      
                      <div className="text-[11px] font-medium text-slate-600 bg-slate-100/50 p-2 rounded mb-3 flex items-start gap-1.5">
                        {judge.conflict ? <ShieldAlert size={14} className="text-red-500 shrink-0"/> : <CheckCircle2 size={14} className="text-green-500 shrink-0"/>}
                        <span className="leading-tight">{judge.reason}</span>
                      </div>

                      <button
                        onClick={() => assignJudgeManually(selectedSubmission.id, judge.email)}
                        disabled={selectedSubmission.status !== 'pending_admin_review'}
                        className={`w-full py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors ${
                          selectedSubmission.assignedJudgeEmail === judge.email 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {selectedSubmission.assignedJudgeEmail === judge.email ? 'Currently Assigned' : 'Manual Override Assign'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}