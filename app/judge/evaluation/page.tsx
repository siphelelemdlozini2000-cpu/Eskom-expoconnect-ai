// app/judge/evaluation/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Save, Send, CheckCircle, AlertCircle, 
  FileText, User, ChevronLeft, Award, Sparkles 
} from 'lucide-react';

// Simulated UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// --- MOCK DATA ---
const projectData = {
  id: 'prj_8842',
  learner: 'Kutlwano Modise',
  school: 'Nelson Mandela University',
  title: 'Zero-Knowledge Proof Frameworks for Decentralized Inclusion',
  category: 'Computer Sciences and Software Engineering',
};

const rubricCriteria = [
  { id: 'innovation', label: 'Innovation', max: 15, desc: 'Does the project introduce a novel concept or approach?' },
  { id: 'originality', label: 'Originality', max: 15, desc: 'Is the work independent and creatively executed?' },
  { id: 'method', label: 'Scientific Method', max: 20, desc: 'Are the variables, controls, and testing protocols rigorous?' },
  { id: 'research', label: 'Research Quality', max: 20, desc: 'Is the data analysis accurate, thorough, and well-documented?' },
  { id: 'impact', label: 'Practical Impact', max: 15, desc: 'Does this solve a real-world problem effectively?' },
  { id: 'presentation', label: 'Presentation & Communication', max: 15, desc: 'Is the display clear, and can the learner explain the concepts well?' },
];

export default function JudgeEvaluation() {
  const router = useRouter();
  
  // --- STATE ---
  const [scores, setScores] = useState<Record<string, number>>(
    rubricCriteria.reduce((acc, crit) => ({ ...acc, [crit.id]: Math.floor(crit.max * 0.5) }), {})
  );
  const [comments, setComments] = useState({
    strengths: '',
    weaknesses: '',
    recommendations: '',
    overall: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- CALCULATIONS ---
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossible = rubricCriteria.reduce((acc, crit) => acc + crit.max, 0);
  const scorePercentage = (totalScore / maxPossible) * 100;

  // --- HANDLERS ---
  const handleScoreChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      const now = new Date();
      setLastSaved(`Saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 1000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  // --- ANIMATIONS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  // --- RENDER SUCCESS STATE ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-eskom-background flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-2xl shadow-soft text-center max-w-md border border-slate-100"
        >
          <div className="w-20 h-20 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="text-eskom-green" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Evaluation Complete</h2>
          <p className="text-slate-500 mb-6">
            Your final score of <strong className="text-slate-800">{totalScore}/{maxPossible}</strong> has been securely submitted to the judging database.
          </p>
          <button 
            onClick={() => router.push('/judge/dashboard')} // Simulated routing
            className="w-full bg-eskom-blue text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Assigned Projects
          </button>
        </motion.div>
      </div>
    );
  }

  // --- RENDER MAIN EVALUATION ---
  return (
    <div className="min-h-screen bg-eskom-background pb-20">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors">
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            {lastSaved && <span className="text-xs text-slate-400 font-mono">{lastSaved}</span>}
            <button 
              onClick={handleSaveDraft} disabled={isSaving}
              className="flex items-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={16} /></motion.div> : <Save size={16} />}
              Save Draft
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 pt-8 space-y-6"
        variants={containerVariants} initial="hidden" animate="visible"
      >
        {/* Project Header */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-soft bg-gradient-to-r from-eskom-blue to-blue-800 text-white overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <CardContent className="p-8 relative z-10 flex justify-between items-end">
              <div>
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-4 tracking-wide">
                  Evaluation in Progress
                </Badge>
                <h1 className="text-3xl font-bold mb-2 max-w-2xl leading-tight">{projectData.title}</h1>
                <div className="flex gap-6 text-blue-100 text-sm">
                  <span className="flex items-center gap-1.5"><User size={16} /> {projectData.learner}</span>
                  <span className="flex items-center gap-1.5"><FileText size={16} /> {projectData.category}</span>
                </div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm">
                View Project Documents
              </button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Rubric Sliders */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-soft">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <Award className="text-eskom-orange" size={20} /> Official Scoring Rubric
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {rubricCriteria.map((crit, idx) => (
                  <div key={crit.id} className={`p-6 ${idx !== rubricCriteria.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{crit.label}</h3>
                        <p className="text-sm text-slate-500 mt-1">{crit.desc}</p>
                      </div>
                      <div className="bg-blue-50 text-eskom-blue font-bold px-3 py-1 rounded-md text-lg">
                        {scores[crit.id]} <span className="text-sm font-medium text-blue-300">/ {crit.max}</span>
                      </div>
                    </div>
                    
                    {/* Custom Tailwind Range Slider */}
                    <input 
                      type="range" min="0" max={crit.max} step="1"
                      value={scores[crit.id]}
                      onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eskom-blue hover:accent-blue-600 transition-all"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                      <span>Needs Work (0)</span>
                      <span>Outstanding ({crit.max})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Feedback & Submit */}
          <motion.div variants={itemVariants} className="space-y-6">
            
            {/* Live Score Widget */}
            <Card className="border-2 border-eskom-blue shadow-soft overflow-hidden">
              <div className="bg-blue-50 p-6 text-center border-b border-blue-100">
                <p className="text-sm font-bold text-eskom-blue uppercase tracking-wider mb-2">Total Score</p>
                <div className="flex justify-center items-baseline gap-1">
                  <span className="text-6xl font-black text-slate-900 tracking-tighter">{totalScore}</span>
                  <span className="text-xl font-medium text-slate-400">/ {maxPossible}</span>
                </div>
              </div>
              <div className="p-6 bg-white space-y-4">
                <Progress 
                  value={scorePercentage} 
                  className={`h-2.5 ${scorePercentage >= 80 ? '[&>div]:bg-eskom-green' : scorePercentage >= 60 ? '[&>div]:bg-eskom-blue' : '[&>div]:bg-eskom-orange'}`} 
                />
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-eskom-green text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={20} /></motion.div>
                  ) : (
                    <><Send size={20} /> Submit Final Score</>
                  )}
                </button>
                <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                  <AlertCircle size={12} /> Submission is final and cannot be edited.
                </p>
              </div>
            </Card>

            {/* Qualitative Feedback */}
            <Card className="border-0 shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Qualitative Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Strengths</label>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-eskom-blue outline-none resize-none h-20"
                    placeholder="What did the learner do exceptionally well?"
                    value={comments.strengths} onChange={e => setComments({...comments, strengths: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Areas for Improvement</label>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-eskom-blue outline-none resize-none h-20"
                    placeholder="Where could the research be strengthened?"
                    value={comments.weaknesses} onChange={e => setComments({...comments, weaknesses: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Overall Comments</label>
                  <textarea 
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-eskom-blue outline-none resize-none h-24"
                    placeholder="Final thoughts for the learner..."
                    value={comments.overall} onChange={e => setComments({...comments, overall: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}