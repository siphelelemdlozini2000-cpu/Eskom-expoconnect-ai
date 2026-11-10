// app/learner/results/page.tsx
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Award, Trophy, Star, 
  MessageSquare, TrendingUp, CheckCircle, Lightbulb
} from 'lucide-react';

// Simulated UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// --- MOCK DATA ---
const resultData = {
  projectTitle: 'Zero-Knowledge Proof Frameworks for Decentralized Inclusion',
  category: 'Computer Sciences and Software Engineering',
  status: 'Evaluated',
  dateEvaluated: 'August 12, 2026',
  overallScore: 88,
  maxScore: 100,
  rubricScores: [
    { label: 'Innovation', score: 14, max: 15 },
    { label: 'Originality', score: 13, max: 15 },
    { label: 'Scientific Method', score: 18, max: 20 },
    { label: 'Research Quality', score: 17, max: 20 },
    { label: 'Practical Impact', score: 14, max: 15 },
    { label: 'Presentation & Communication', score: 12, max: 15 },
  ],
  feedback: {
    strengths: 'Exceptional application of advanced cryptography to a real-world localized problem. The methodology was highly rigorous, and the custom algorithms demonstrated a deep understanding of zero-knowledge proofs.',
    weaknesses: 'The presentation could be simplified for a non-technical audience. Some of the architecture diagrams were slightly dense and hard to parse quickly.',
    overall: 'An outstanding project with significant real-world potential. With some refinement to the visual communication of the data, this could easily compete at an international level. Keep up the excellent work!'
  }
};

export default function LearnerResults() {
  const router = useRouter();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const getMedalColor = (score: number) => {
    if (score >= 90) return 'text-yellow-500 bg-yellow-50 border-yellow-200'; // Gold
    if (score >= 80) return 'text-slate-400 bg-slate-50 border-slate-200'; // Silver
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200'; // Bronze
    return 'text-eskom-blue bg-blue-50 border-blue-100'; // Merit
  };

  return (
    <div className="min-h-screen bg-eskom-background pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/learner/dashboard')}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
          >
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
          <Badge className="bg-eskom-green text-white hover:bg-green-600 shadow-none">
            Official Results Released
          </Badge>
        </div>
      </div>

      <motion.div 
        className="max-w-4xl mx-auto px-6 pt-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Hero Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-soft overflow-hidden relative bg-white">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-eskom-blue to-eskom-green"></div>
            <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              
              {/* Score Display */}
              <div className="flex-shrink-0 relative">
                <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${getMedalColor(resultData.overallScore)}`}>
                  <Trophy size={32} className="mb-1 opacity-80" />
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{resultData.overallScore}</span>
                    <span className="text-sm font-bold opacity-60">/{resultData.maxScore}</span>
                  </div>
                </div>
              </div>

              {/* Project Title & Meta */}
              <div className="flex-grow">
                <p className="text-sm font-bold text-eskom-blue uppercase tracking-wider mb-2">Final Evaluation</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">
                  {resultData.projectTitle}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Award size={16} /> {resultData.category}</span>
                  <span className="flex items-center gap-1.5"><CheckCircle size={16} /> Evaluated {resultData.dateEvaluated}</span>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Quantitative Rubric Breakdown */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-0 shadow-soft h-full">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-eskom-blue" size={18} /> Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {resultData.rubricScores.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      <span className="text-sm font-bold text-slate-900">{item.score} <span className="text-slate-400 font-medium">/ {item.max}</span></span>
                    </div>
                    <Progress 
                      value={(item.score / item.max) * 100} 
                      className={`h-2 ${((item.score / item.max) * 100) >= 80 ? '[&>div]:bg-eskom-green' : '[&>div]:bg-eskom-blue'}`} 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Qualitative Feedback */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="border-0 shadow-soft h-full">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                  <MessageSquare className="text-eskom-orange" size={18} /> Judge Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-green-800 flex items-center gap-2 mb-2">
                    <Star size={16} className="text-green-600" /> Strengths
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {resultData.feedback.strengths}
                  </p>
                </div>

                <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-orange-600" /> Areas for Improvement
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {resultData.feedback.weaknesses}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Overall Comments</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {resultData.feedback.overall}
                  </p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}