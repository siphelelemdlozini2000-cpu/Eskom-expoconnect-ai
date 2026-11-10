// app/learner/dashboard/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  FileText, UploadCloud, Clock, Save,
  CheckCircle2, AlertCircle, Award, User, School, MapPin, Loader2, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export default function LearnerDashboardPage() {
  const [activeTab, setActiveTab] = useState('status');
  const [workflowStep, setWorkflowStep] = useState('');
  const [displayName, setDisplayName] = useState('Learner');
  const [profileKey, setProfileKey] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projAbstract, setProjAbstract] = useState('');

  const [finalScore, setFinalScore] = useState('--');
  const [finalFeedback, setFinalFeedback] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const activeProfileRaw = localStorage.getItem('demo_active_profile');

    if (!activeProfileRaw) return;

    const activeProfile: DemoProfile = JSON.parse(activeProfileRaw);

    if (activeProfile.role !== 'learner') return;

    const emailKey = activeProfile.email.toLowerCase();
    const fullName = `${activeProfile.firstName} ${activeProfile.lastName}`.trim();

    setDisplayName(fullName || 'Learner');
    setProfileKey(emailKey);

    setContactEmail(
      localStorage.getItem(`demo_contact_email_${emailKey}`) || activeProfile.email || ''
    );
    setSchoolName(
      localStorage.getItem(`demo_school_${emailKey}`) || activeProfile.school || ''
    );

    setRegion(
      localStorage.getItem(`demo_province_${emailKey}`) ||
      activeProfile.province ||
      ''
    );
  }, []);

  useEffect(() => {
    if (!profileKey) return;

    const rawSubmissions = localStorage.getItem('demo_project_submissions');
    if (rawSubmissions) {
      try {
        const submissions = JSON.parse(rawSubmissions);
        const mySub = submissions.find((s: any) => (s.learnerEmail || '').toLowerCase() === profileKey);

        if (mySub) {
          let mappedStep = '';
          if (mySub.status === 'pending_admin_review') mappedStep = '1_submitted';
          if (mySub.status === 'matched_to_judge' || mySub.status === 'judging') mappedStep = '2_assigned';
          if (mySub.status === 'completed') mappedStep = '3_evaluated';
          if (mySub.status === 'published') mappedStep = '4_published';

          setWorkflowStep(mappedStep);
          setProjTitle(mySub.projectTitle || '');
          setProjCategory(mySub.category || '');
          setProjAbstract(mySub.abstract || '');

          if (mappedStep === '4_published') {
            setFinalScore(mySub.judgeScore || '--');
            setFinalFeedback(mySub.judgeFeedback || 'No comments.');
          } else {
            setFinalScore('--');
            setFinalFeedback('');
          }

          setContactEmail((prev) => localStorage.getItem(`demo_contact_email_${profileKey}`) || prev);
          setSchoolName((prev) => localStorage.getItem(`demo_school_${profileKey}`) || prev);
          setProvince((prev) => localStorage.getItem(`demo_province_${profileKey}`) || prev);
          setRegion((prev) => localStorage.getItem(`demo_region_${profileKey}`) || prev);

          return; 
        }
      } catch (e) {
        console.error("Error parsing submissions", e);
      }
    }

    setWorkflowStep(localStorage.getItem(`demo_workflow_step_${profileKey}`) || '');
    setProjTitle(localStorage.getItem(`demo_proj_title_${profileKey}`) || '');
    setProjCategory(localStorage.getItem(`demo_proj_category_${profileKey}`) || '');
    setProjAbstract(localStorage.getItem(`demo_proj_abstract_${profileKey}`) || '');

    setContactEmail((prev) => localStorage.getItem(`demo_contact_email_${profileKey}`) || prev);
    setSchoolName((prev) => localStorage.getItem(`demo_school_${profileKey}`) || prev);
    setProvince((prev) => localStorage.getItem(`demo_province_${profileKey}`) || prev);
    setRegion((prev) => localStorage.getItem(`demo_region_${profileKey}`) || prev);

    const step = localStorage.getItem(`demo_workflow_step_${profileKey}`) || '';
    if (step === '4_published') {
      setFinalScore(localStorage.getItem(`demo_judge_score_${profileKey}`) || '--');
      setFinalFeedback(localStorage.getItem(`demo_judge_feedback_${profileKey}`) || 'No comments.');
    } else {
      setFinalScore('--');
      setFinalFeedback('');
    }
  }, [profileKey]);

  const handleSaveProfileInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profileKey) return;

    localStorage.setItem(`demo_contact_email_${profileKey}`, contactEmail);
    localStorage.setItem(`demo_school_${profileKey}`, schoolName);
    localStorage.setItem(`demo_province_${profileKey}`, region);

    const activeProfileRaw = localStorage.getItem('demo_active_profile');
    if (!activeProfileRaw) return;

    const activeProfile: DemoProfile = JSON.parse(activeProfileRaw);
    const updatedProfile: DemoProfile = {
      ...activeProfile,
      email: contactEmail || activeProfile.email,
      school: schoolName,
      province: region,
    };

    localStorage.setItem('demo_active_profile', JSON.stringify(updatedProfile));
    localStorage.setItem(`demo_profile_${profileKey}`, JSON.stringify(updatedProfile));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        alert("For this prototype, please upload a file smaller than 2MB.");
        return;
      }
      
      setSelectedFile(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Project draft saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const activeProfileRaw = localStorage.getItem('demo_active_profile');
      const activeProfile: DemoProfile | null = activeProfileRaw ? JSON.parse(activeProfileRaw) : null;
      const learnerEmail = activeProfile?.email || contactEmail || '';

      const submission = {
        id: `sub_${Date.now()}`,
        learnerEmail: learnerEmail,
        learnerName:
          `${activeProfile?.firstName || displayName.split(' ')[0] || ''} ${
            activeProfile?.lastName || ''
          }`.trim() || displayName || 'Learner',
        school: schoolName || activeProfile?.school || '',
        region: region || activeProfile?.province || '',
        projectTitle: projTitle || 'Untitled Project',
        category: projCategory || 'Uncategorized',
        abstract: projAbstract || 'No abstract.',
        files: selectedFile && fileDataUrl ? [{ name: selectedFile, data: fileDataUrl, progress: 100, complete: true }] : [],
        status: 'pending_admin_review',
        assignedJudgeEmail: null,
        assignedJudgeName: null,
        submittedAt: new Date().toISOString(),
      };

      const raw = localStorage.getItem('demo_project_submissions');
      const existing = raw ? JSON.parse(raw) : [];
      const filteredExisting = (Array.isArray(existing) ? existing : []).filter(
        (sub: any) => sub.learnerEmail !== submission.learnerEmail
      );
      
      const next = [submission, ...filteredExisting];

      // 1. Save the Project
      localStorage.setItem('demo_project_submissions', JSON.stringify(next));
      
      // 2. CREATE THE NOTIFICATION
      const notifKey = `demo_notifications_${learnerEmail.toLowerCase()}`;
      const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        title: "Project Submitted Successfully",
        message: `"${projTitle || 'Untitled'}" has been securely uploaded and is pending Admin review.`,
        date: new Date().toISOString(),
        read: false,
      };
      localStorage.setItem(notifKey, JSON.stringify([newNotification, ...existingNotifs]));

      // 3. Fire the events to instantly update the UI globally
      window.dispatchEvent(new Event('demo-data-changed'));
      window.dispatchEvent(new Event('demo-notifications-updated'));

      setWorkflowStep('1_submitted');
      setActiveTab('status');
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <div className="p-8 pb-20">
      <motion.div 
        className="max-w-5xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <header className="border-b border-slate-200 pb-6">
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 mb-2">Learner Workspace</Badge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {displayName.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Manage your school profile, draft your submission, upload files, and track your evaluation status.</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-200/50 p-1 rounded-xl mb-8">
            <TabsTrigger value="status" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Tracking & Status</TabsTrigger>
            <TabsTrigger value="submission" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Project Submission</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">School & Profile</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Results & Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="m-0 space-y-6">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-slate-800">Submission Progress</CardTitle>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                      workflowStep === '4_published' ? 'bg-green-50 text-green-700 border-green-200' : workflowStep ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Clock size={14} /> {workflowStep === '4_published' ? 'Evaluated' : workflowStep ? 'Under Review' : 'Draft phase'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-8">
                  <div className="relative pt-6 max-w-3xl mx-auto">
                    <div className="absolute left-0 top-[2.75rem] w-full h-1 bg-slate-100 rounded-full z-0"></div>
                    <div 
                      className="absolute left-0 top-[2.75rem] h-1 bg-blue-500 rounded-full z-0 transition-all duration-1000 ease-out"
                      style={{ width: workflowStep === '4_published' ? '100%' : workflowStep ? '50%' : '0%' }}
                    ></div>
                    
                    <div className="relative z-10 flex justify-between">
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${workflowStep ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="text-center">
                          <span className={`text-sm font-bold block ${workflowStep ? 'text-slate-800' : 'text-slate-400'}`}>Submitted</span>
                          <span className="text-xs text-slate-500">{workflowStep ? 'Completed' : 'Pending'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${['2_assigned', '3_evaluated', '4_published'].includes(workflowStep) ? 'bg-blue-500 text-white shadow-md ring-4 ring-blue-50' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                          <Clock size={20} />
                        </div>
                        <div className="text-center">
                          <span className={`text-sm font-bold block ${['2_assigned', '3_evaluated', '4_published'].includes(workflowStep) ? 'text-blue-600' : 'text-slate-400'}`}>AI Judge Match</span>
                          <span className="text-xs text-slate-500">{['2_assigned', '3_evaluated', '4_published'].includes(workflowStep) ? 'In Progress' : 'Pending'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${workflowStep === '4_published' ? 'bg-green-500 text-white shadow-md ring-4 ring-green-50' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                          <Award size={20} />
                        </div>
                        <div className="text-center">
                          <span className={`text-sm font-bold block ${workflowStep === '4_published' ? 'text-slate-800' : 'text-slate-400'}`}>Results Released</span>
                          <span className="text-xs text-slate-500">{workflowStep === '4_published' ? 'Released' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="submission" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg text-slate-800">Project Details</CardTitle>
                  <CardDescription>Enter your project information, explain your objectives, and upload your supporting files.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmitProject} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Project Title</label>
                        <input required value={projTitle} onChange={(e)=>setProjTitle(e.target.value)} type="text" placeholder="e.g. Solar-Powered Smart Irrigation System" className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Scientific Category</label>
                        <select required value={projCategory} onChange={(e)=>setProjCategory(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700">
                          <option value="">Select a category...</option>
                          <option value="Computer Sciences & Software">Computer Sciences & Software</option>
                          <option value="Engineering & Technology">Engineering & Technology</option>
                          <option value="Environmental Sciences">Environmental Sciences</option>
                          <option value="Chemistry & Biochemistry">Chemistry & Biochemistry</option>
                          <option value="Physics, Astronomy & Space Sciences">Physics, Astronomy & Space Sciences</option>
                          <option value="Mathematics & Data Science">Mathematics & Data Science</option>
                          <option value="Energy & Power Systems">Energy & Power Systems</option>
                          <option value="Social & Behavioral Sciences">Social & Behavioral Sciences</option>
                          <option value="Plant Sciences & Agriculture">Plant Sciences & Agriculture</option>
                          <option value="Biomedical & Medical Sciences">Biomedical & Medical Sciences</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Submission Type</label>
                        <select required className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white text-slate-700">
                          <option value="">Select submission type...</option>
                          <option value="individual">Individual Project</option>
                          <option value="group">Group Project</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Project Abstract</label>
                        <textarea required value={projAbstract} onChange={(e)=>setProjAbstract(e.target.value)} rows={4} placeholder="Provide a brief summary of your project, the problem it solves, and your methodology..." className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none" />
                      </div>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4" />
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-8 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <FileCheck className="mx-auto text-green-500 mb-3" size={32} />
                          <p className="text-sm font-bold text-green-800">File Attached Successfully</p>
                          <p className="text-xs text-green-600 mt-1">{selectedFile}</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mx-auto text-blue-500 mb-3" size={32} />
                          <p className="text-sm font-semibold text-slate-800">Upload Documents, Images, or Presentations</p>
                          <p className="text-xs text-slate-500 mt-1 mb-4">Drag and drop files here, or click to browse. Max size 50MB.</p>
                          <button type="button" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                            Select Files
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-green-600">{saveMessage}</span>
                      <div className="flex gap-3">
                        <button type="button" onClick={handleSaveDraft} disabled={isSaving || isSubmitting} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 shadow-sm">
                          <Save size={16} /> Save Draft
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm flex items-center gap-2">
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                          {isSubmitting ? 'Submitting...' : 'Submit Project'}
                        </button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg text-slate-800">Personal & School Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><User size={14}/> Full Name</label>
                      <input type="text" value={displayName} className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" readOnly />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><School size={14}/> Institution / School</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin size={14}/> Expo Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                      >
                        <option value="">Select your region...</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="North West">North West</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProfileInfo}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm"
                  >
                    Save Profile Info
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="feedback" className="m-0">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
                {workflowStep !== '4_published' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                      <AlertCircle className="text-blue-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Results Pending</h3>
                    <p className="text-slate-600 max-w-md">Your final score and actionable feedback will appear here once released by the judging panel.</p>
                  </div>
                )}

                <CardHeader className="border-b border-slate-100 pb-4"><CardTitle className="text-lg text-slate-800">Official Evaluation Report</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-slate-100 p-4 rounded-xl flex-1 text-center">
                      <p className="text-sm text-slate-500 mb-1">Final Score</p>
                      <p className="text-3xl font-bold text-slate-900">{finalScore}</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-xl flex-1 text-center">
                      <p className="text-sm text-slate-500 mb-1">Medal Status</p>
                      <p className="text-3xl font-bold text-slate-900">{finalScore !== '--' && parseInt(finalScore) >= 80 ? 'Gold' : finalScore !== '--' && parseInt(finalScore) >= 70 ? 'Silver' : 'Bronze'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Judge's Comments:</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">{finalFeedback}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
}