// app/judge/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import { FileText, CheckCircle2, Clock, BrainCircuit, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  scoreInnovation?: string;
  scoreMethod?: string;
  scorePresentation?: string;
};

export default function JudgeDashboardPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [workflowStep, setWorkflowStep] = useState<SubmissionStatus | ''>('');
  
  const [judgeName, setJudgeName] = useState('Judge');
  const [judgeEmail, setJudgeEmail] = useState('');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveCategory, setLiveCategory] = useState('');
  const [liveAbstract, setLiveAbstract] = useState('');
  const [assignedSubmission, setAssignedSubmission] = useState<SubmissionRecord | null>(null);

  const [scoreInnovation, setScoreInnovation] = useState('');
  const [scoreMethod, setScoreMethod] = useState('');
  const [scorePresentation, setScorePresentation] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const totalScore =
    parseInt(scoreInnovation || '0', 10) +
    parseInt(scoreMethod || '0', 10) +
    parseInt(scorePresentation || '0', 10);

  const handleDownloadRealFile = (file: { name: string; data?: string }) => {
    if (!file.data) {
      alert("No actual file data found. This might be an older test submission.");
      return;
    }
    
    const a = document.createElement('a');
    a.href = file.data;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };  

  const loadAssignedProject = useCallback(() => {
    try {
      const savedProfileRaw = localStorage.getItem('demo_active_profile');
      const profile: DemoProfile | null = savedProfileRaw ? JSON.parse(savedProfileRaw) : null;

      const currentJudgeEmail = profile?.role === 'judge' ? profile.email.toLowerCase() : '';
      setJudgeEmail(currentJudgeEmail);
      setJudgeName(
        profile?.role === 'judge'
          ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Judge'
          : 'Judge'
      );

      const submissionsRaw = localStorage.getItem('demo_project_submissions');
      const submissions: SubmissionRecord[] = submissionsRaw ? JSON.parse(submissionsRaw) : [];
      const safeSubmissions = Array.isArray(submissions) ? submissions : [];

      const mySubmission =
        safeSubmissions.find(
          (sub) => sub.assignedJudgeEmail?.toLowerCase() === currentJudgeEmail
        ) || null;

      setAssignedSubmission(mySubmission);

      if (mySubmission) {
        setWorkflowStep(mySubmission.status);
        setLiveTitle(mySubmission.projectTitle);
        setLiveCategory(mySubmission.category);
        setLiveAbstract(mySubmission.abstract);
        
        // PRE-FILL SCORES AND FEEDBACK IF THEY EXIST
        setScoreInnovation(mySubmission.scoreInnovation || '');
        setScoreMethod(mySubmission.scoreMethod || '');
        setScorePresentation(mySubmission.scorePresentation || '');
        setFeedbackText(mySubmission.judgeFeedback || '');
      } else {
        setWorkflowStep('');
        setLiveTitle('');
        setLiveCategory('');
        setLiveAbstract('');
        setScoreInnovation('');
        setScoreMethod('');
        setScorePresentation('');
        setFeedbackText('');
      }
    } catch {
      setAssignedSubmission(null);
      setWorkflowStep('');
      setLiveTitle('');
      setLiveCategory('');
      setLiveAbstract('');
    }
  }, []);

  useEffect(() => {
    loadAssignedProject();

    const refresh = () => loadAssignedProject();

    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('demo-data-changed', refresh as EventListener);

    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('demo-data-changed', refresh as EventListener);
    };
  }, [loadAssignedProject]);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignedSubmission) {
      alert('No assigned project found.');
      return;
    }

    if (!scoreInnovation || !scoreMethod || !scorePresentation || !feedbackText) {
      alert('Please complete the scores and written feedback.');
      return;
    }

    // Include the individual scores in the saved record
    const updated: SubmissionRecord = {
      ...assignedSubmission,
      status: 'completed',
      judgeScore: totalScore.toString(),
      judgeFeedback: feedbackText,
      scoreInnovation: scoreInnovation,
      scoreMethod: scoreMethod,
      scorePresentation: scorePresentation,
    };

    const raw = localStorage.getItem('demo_project_submissions');
    const submissions: SubmissionRecord[] = raw ? JSON.parse(raw) : [];
    const next = submissions.map((sub) => (sub.id === assignedSubmission.id ? updated : sub));

    localStorage.setItem('demo_project_submissions', JSON.stringify(next));
    localStorage.setItem('demo_judge_score', totalScore.toString());
    localStorage.setItem('demo_judge_feedback', feedbackText);
    localStorage.setItem('demo_workflow_step', '3_evaluated');

    window.dispatchEvent(new Event('demo-data-changed'));

    alert('Evaluation submitted successfully to Admin! Redirecting to login...');
    window.location.href = '/login';
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const isReviewed = workflowStep === 'completed' || workflowStep === 'published';
  const hasAssignment = !!assignedSubmission;

  return (
    <div className="p-8 pb-20">
      <motion.div
        className="max-w-6xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <header className="border-b border-slate-200 pb-6 flex justify-between items-end">
          <div>
            <Badge className="bg-green-50 text-green-700 border border-green-200 mb-2">
              Evaluator Workspace
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {judgeName}</h1>
            <p className="text-slate-500 mt-1">
              Review AI-matched project submissions and submit official evaluations.
            </p>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1 rounded-xl mb-8 max-w-md mx-auto">
            <TabsTrigger
              value="projects"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Assigned Projects
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Active Evaluation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="m-0 space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle>AI-Matched Workload</CardTitle>
                </CardHeader>

                <div className="divide-y divide-slate-100">
                  {hasAssignment ? (
                    <div className="p-6 bg-blue-50/30">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max ${
                              isReviewed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isReviewed ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            {isReviewed ? 'Evaluation Submitted' : 'Action Required'}
                          </span>

                          <h3 className="text-xl font-bold text-slate-900">{liveTitle}</h3>

                          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-100">
                            <BrainCircuit size={14} /> AI Matched: {liveCategory} Expertise
                          </div>

                          <p className="text-xs text-slate-500">
                            Assigned to: {assignedSubmission?.assignedJudgeName || judgeName}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab('evaluation')}
                          className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-800 text-sm shadow-sm"
                        >
                          {isReviewed ? 'View Record' : 'Open & Evaluate'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      Inbox is empty. Waiting for Admin assignment...
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="evaluation" className="m-0">
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Title</p>
                      <p className="text-sm font-semibold text-slate-900">{liveTitle || 'No project assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Category</p>
                      <p className="text-xs font-medium text-blue-600">{liveCategory || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Abstract</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{liveAbstract || '—'}</p>
                    </div>
                   <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-800 mb-2">Attached Files</p>
                      {assignedSubmission?.files?.length ? (
                        assignedSubmission.files.map((file) => (
                          <div
                            key={file.name}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center justify-between mb-2 group"
                          >
                            <span className="flex items-center gap-2 overflow-hidden">
                              <FileText size={14} className="text-blue-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{file.name}</span>
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleDownloadRealFile(file)}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors shrink-0"
                            >
                              <Download size={12} />
                              <span>Download</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500">No files attached.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Evaluation Rubric</CardTitle>
                      <span className="text-2xl font-black text-blue-600">
                        {totalScore}
                        <span className="text-sm text-slate-400 font-medium">/100</span>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmitEvaluation} className="space-y-6">
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <label className="text-sm font-bold text-slate-800">
                            Innovation & Originality (0-30)
                          </label>
                          <p className="text-xs text-slate-500">Does it show creative thinking?</p>
                        </div>
                        <input
                          type="number"
                          max="30"
                          min="0"
                          required
                          disabled={isReviewed}
                          value={scoreInnovation}
                          onChange={(e) => setScoreInnovation(e.target.value)}
                          className="w-20 p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-75 disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="0-30"
                        />
                      </div>

                      <div className="flex justify-between items-center gap-4 border-t pt-4">
                        <div>
                          <label className="text-sm font-bold text-slate-800">
                            Methodology & Execution (0-40)
                          </label>
                          <p className="text-xs text-slate-500">Is the approach sound?</p>
                        </div>
                        <input
                          type="number"
                          max="40"
                          min="0"
                          required
                          disabled={isReviewed}
                          value={scoreMethod}
                          onChange={(e) => setScoreMethod(e.target.value)}
                          className="w-20 p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-75 disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="0-40"
                        />
                      </div>

                      <div className="flex justify-between items-center gap-4 border-t pt-4">
                        <div>
                          <label className="text-sm font-bold text-slate-800">
                            Presentation & Findings (0-30)
                          </label>
                          <p className="text-xs text-slate-500">Are results clear?</p>
                        </div>
                        <input
                          type="number"
                          max="30"
                          min="0"
                          required
                          disabled={isReviewed}
                          value={scorePresentation}
                          onChange={(e) => setScorePresentation(e.target.value)}
                          className="w-20 p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-75 disabled:bg-slate-50 disabled:cursor-not-allowed"
                          placeholder="0-30"
                        />
                      </div>

                      <div className="space-y-2 border-t pt-6">
                        <label className="text-sm font-bold text-slate-800">
                          Actionable Feedback for Learner
                        </label>
                        <textarea
                          required
                          disabled={isReviewed}
                          rows={4}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Type your constructive comments here..."
                          className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-600 resize-none text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!hasAssignment || isReviewed}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                      >
                        {isReviewed ? 'Evaluation Already Submitted' : 'Submit Final Evaluation to Admin'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}