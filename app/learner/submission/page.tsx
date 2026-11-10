// app/learner/submission/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  File,
  FileText,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Personal Info' },
  { id: 2, title: 'Project Info' },
  { id: 3, title: 'Documents' },
  { id: 4, title: 'Review' },
];

type SubmissionStatus = 'pending_admin_review' | 'matched_to_judge' | 'judging' | 'completed';

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
  status: SubmissionStatus;
  assignedJudgeEmail?: string | null;
  assignedJudgeName?: string | null;
  submittedAt: string;
};

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

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export default function SubmissionWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const [formData, setFormData] = useState({
    firstName: 'Kutlwano',
    lastName: 'Modise',
    school: 'Nelson Mandela University',
    region: 'Eastern Cape',
    projectTitle: '',
    category: 'Computer Sciences and Software Engineering',
    abstract: '',
  });

  const [files, setFiles] = useState<Array<{ name: string; progress: number; complete: boolean }>>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const readSubmissions = (): SubmissionRecord[] => {
    try {
      const raw = localStorage.getItem('demo_project_submissions');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getCurrentLearnerProfile = (): DemoProfile | null => {
    const activeProfile = safeParse<DemoProfile>(localStorage.getItem('demo_active_profile'));
    if (activeProfile?.role === 'learner') return activeProfile;

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('demo_profile_')) continue;

      const profile = safeParse<DemoProfile>(localStorage.getItem(key));
      if (profile?.role === 'learner') return profile;
    }

    return null;
  };

  const handleSubmitProject = () => {
    try {
      console.log('handleSubmitProject fired');

      const activeProfileRaw = localStorage.getItem('demo_active_profile');
      const activeProfile = activeProfileRaw ? JSON.parse(activeProfileRaw) : null;

      const submission = {
        id: `sub_${Date.now()}`,
        learnerEmail: activeProfile?.email || 'unknown@example.com',
        learnerName:
          `${activeProfile?.firstName || ''} ${activeProfile?.lastName || ''}`.trim() || 'Learner',
        school: activeProfile?.school || formData.school || '',
        region: activeProfile?.province || formData.region || '',
        projectTitle: formData.projectTitle || 'Untitled Project',
        category: formData.category || '',
        abstract: formData.abstract || '',
        files: [...files],
        status: 'pending_admin_review',
        assignedJudgeEmail: null,
        assignedJudgeName: null,
        submittedAt: new Date().toISOString(),
      };

      const existingRaw = window.localStorage.getItem('demo_project_submissions');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const next = [submission, ...(Array.isArray(existing) ? existing : [])];

      window.localStorage.setItem('demo_project_submissions', JSON.stringify(next));
      window.dispatchEvent(new Event('demo-data-changed'));

      router.push('/learner/submissions');
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const simulateFileUpload = (fileName: string) => {
    const newFile = { name: fileName, progress: 0, complete: false };
    setFiles((prev) => [...prev, newFile]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => (f.name === fileName ? { ...f, progress: 100, complete: true } : f))
        );
      } else {
        setFiles((prev) => prev.map((f) => (f.name === fileName ? { ...f, progress } : f)));
      }
    }, 400);
  };

  const slideVariants: Variants = {
    hidden: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <FileText className="text-eskom-blue" size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
          <p className="text-sm text-slate-500">Confirm your details before submitting your project.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">First Name</label>
          <input
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Last Name</label>
          <input
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">School</label>
          <input
            value={formData.school}
            onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))
            }
            className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Region</label>
          <input
            value={formData.region}
            onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))
            }
            className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
          />
        </div>
      </div>
    </div>
  );

  const renderProjectInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Sparkles className="text-eskom-blue" size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project Information</h2>
          <p className="text-sm text-slate-500">Add your project title, category, and abstract.</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Project Title</label>
        <input
          value={formData.projectTitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, projectTitle: e.target.value }))
          }
          placeholder="Enter your project title"
          className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Category</label>
        <input
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Abstract</label>
        <textarea
          value={formData.abstract}
          onChange={(e) => setFormData((prev) => ({ ...prev, abstract: e.target.value }))
          }
          placeholder="Write a short project abstract"
          rows={7}
          className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 resize-none"
        />
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <UploadCloud className="text-eskom-blue" size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Supporting Documents</h2>
          <p className="text-sm text-slate-500">Upload files for your project submission.</p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = Array.from(e.dataTransfer.files).map((file) => file.name);
          dropped.forEach((name) => simulateFileUpload(name));
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          isDragging ? 'border-eskom-blue bg-blue-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <UploadCloud className="mx-auto text-slate-400 mb-3" size={36} />
        <p className="font-medium text-slate-700">Drag and drop files here</p>
        <p className="text-sm text-slate-500">or click to select files</p>

        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const selected = Array.from(e.target.files || []).map((file) => file.name);
            selected.forEach((name) => simulateFileUpload(name));
            e.currentTarget.value = '';
          }}
          id="submission-upload"
        />
        <label
          htmlFor="submission-upload"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-eskom-blue text-white text-sm font-semibold cursor-pointer"
        >
          Select Files
        </label>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.name} className="border border-slate-200">
            <CardContent className="p-4 flex items-center gap-4">
              <File className="text-slate-400" size={20} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800">{file.name}</span>
                  <span className="text-xs text-slate-500">{file.complete ? 'Complete' : `${file.progress}%`}</span>
                </div>
                <Progress value={file.progress} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}

        {files.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-6">No files uploaded yet.</div>
        )}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <AlertCircle className="text-eskom-blue" size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Submission</h2>
          <p className="text-sm text-slate-500">Check everything before final submission.</p>
        </div>
      </div>

      <Card className="border border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Learner</p>
            <p className="text-slate-800 font-medium">
              {formData.firstName} {formData.lastName}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Project Title</p>
            <p className="text-slate-800 font-medium">{formData.projectTitle || 'Untitled Project'}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Category</p>
            <p className="text-slate-800 font-medium">{formData.category}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Abstract</p>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">
              {formData.abstract || 'No abstract provided.'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold">Files</p>
            <p className="text-slate-700 text-sm">
              {files.length > 0 ? files.map((f) => f.name).join(', ') : 'No files uploaded.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSuccess = () => (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle size={42} className="text-green-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Submission Complete</h2>
        <p className="text-slate-600 max-w-md">
          Your project has been saved and sent to the admin review queue.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setCurrentStep(1);
          setFiles([]);
          setFormData({
            firstName: formData.firstName,
            lastName: formData.lastName,
            school: formData.school,
            region: formData.region,
            projectTitle: '',
            category: formData.category,
            abstract: '',
          });
        }}
        className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
      >
        Submit Another
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-eskom-background py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {currentStep < 5 && (
          <div className="mb-12">
            <div className="flex justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />
              <motion.div
                className="absolute top-1/2 left-0 h-1 bg-eskom-blue -z-10 -translate-y-1/2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />

              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-eskom-background px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                      currentStep > step.id
                        ? 'bg-eskom-blue text-white'
                        : currentStep === step.id
                        ? 'bg-white border-2 border-eskom-blue text-eskom-blue shadow-sm'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle size={18} /> : step.id}
                  </div>
                  <span className={`text-xs font-medium ${currentStep >= step.id ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden relative min-h-[500px] flex flex-col">
          <div className="flex-grow p-8 sm:p-12 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 p-8 sm:p-12 overflow-y-auto"
              >
                {currentStep === 1 && renderPersonalInfo()}
                {currentStep === 2 && renderProjectInfo()}
                {currentStep === 3 && renderDocuments()}
                {currentStep === 4 && renderReview()}
                {currentStep === 5 && renderSuccess()}
              </motion.div>
            </AnimatePresence>
          </div>

          {currentStep < 5 && (
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center z-10">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ChevronLeft size={18} /> Back
              </button>

              <button
                type="button"
                onClick={() => {
                  console.log('primary button clicked, step:', currentStep);
                  if (currentStep === 4) handleSubmitProject();
                  else handleNext();
                }}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-eskom-blue text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : currentStep === 4 ? 'Submit Project' : 'Continue'}
                {currentStep !== 4 && <ChevronRight size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}