// app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, GraduationCap, User, Shield, ChevronLeft, Info, Award, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Role = 'learner' | 'judge' | 'admin';

type DemoProfile = {
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school: string;
  province: string;
  qualification?: string;
  scientificDisciplines?: string;
  createdAt: string;
};

type RegisterRole = 'learner' | 'judge';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [role, setRole] = useState<Role>('learner');
  const [registerRole, setRegisterRole] = useState<RegisterRole>('learner');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [school, setSchool] = useState('');
  const [province, setProvince] = useState('');

  // Judge-specific state
  const [qualification, setQualification] = useState('');
  const [scientificDisciplines, setScientificDisciplines] = useState('');

  const handleRoleChange = (selectedRole: Role) => {
    setRole(selectedRole);

    if (selectedRole === 'admin') {
      setEmail('admin@eskomexpo.co.za');
      setPassword('admin2026');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const getDashboardPath = (selectedRole: Role) => {
    if (selectedRole === 'learner') return '/learner/dashboard';
    if (selectedRole === 'judge') return '/judge/dashboard';
    return '/admin/analytics';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const key = `demo_profile_${email.toLowerCase()}`;
    const stored = localStorage.getItem(key);

    if (role === 'admin') {
      setTimeout(() => {
        setIsLoading(false);
        router.push('/admin/analytics');
      }, 800);
      return;
    }

    if (!stored) {
      setIsLoading(false);
      return;
    }

    const profile: DemoProfile = JSON.parse(stored);

    if (profile.password !== password || profile.role !== role) {
      setIsLoading(false);
      return;
    }

    localStorage.setItem('demo_active_profile', JSON.stringify(profile));

    setTimeout(() => {
      setIsLoading(false);
      router.push(getDashboardPath(profile.role));
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const profile: DemoProfile = {
      role: registerRole,
      firstName,
      lastName,
      email: registerEmail,
      password: registerPassword,
      school,
      province,
      ...(registerRole === 'judge' && {
        qualification,
        scientificDisciplines,
      }),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`demo_profile_${registerEmail.toLowerCase()}`, JSON.stringify(profile));
    localStorage.setItem('demo_active_profile', JSON.stringify(profile));

    window.dispatchEvent(new Event('demo-data-changed'));

    setTimeout(() => {
      setIsLoading(false);
      router.push(registerRole === 'learner' ? '/learner/dashboard' : '/judge/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-600 opacity-20 blur-[100px]" />

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm bg-white/60 px-4 py-2.5 rounded-full backdrop-blur-md border border-slate-200 shadow-sm"
      >
        <ChevronLeft size={16} /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="relative w-44 h-14 bg-white/95 backdrop-blur-md rounded-xl p-2 border border-slate-200 shadow-sm flex items-center justify-center">
            <Image src="/EskomExpo.jpg" alt="Eskom Expo" fill className="object-contain p-1" priority />
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white/95 backdrop-blur-xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-900">ExpoConnect AI</CardTitle>
              <CardDescription className="text-slate-500 mt-1 mb-4">Official Portal Sign In</CardDescription>
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* LOGIN TAB */}
              <TabsContent value="login" className="m-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Account Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoleChange('learner')}
                        className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          role === 'learner'
                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap size={18} /> <span className="text-xs font-medium">Learner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('judge')}
                        className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          role === 'judge'
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <User size={18} /> <span className="text-xs font-medium">Judge</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleChange('admin')}
                        className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${
                          role === 'admin'
                            ? 'border-green-600 bg-green-50 text-green-600'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Shield size={18} /> <span className="text-xs font-medium">Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  {role === 'admin' && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                      <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-900 leading-relaxed">Demo credentials loaded.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm flex justify-center mt-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Secure Login'}
                  </button>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register" className="m-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Register As</label>
                    <select
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value as RegisterRole)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
                    >
                      <option value="learner">Learner (Project Submissions)</option>
                      <option value="judge">Judge (Evaluations)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">First Name</label>
                      <input
                        required
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Last Name</label>
                      <input
                        required
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input
                      required
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input
                      required
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      {registerRole === 'judge' ? 'Institution / Organization' : 'School / Institution'}
                    </label>
                    <input
                      required
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                      placeholder={registerRole === 'judge' ? 'e.g. CSIR, NMU, Eskom' : 'Enter your school name'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Province / Region</label>
                    <select
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
                    >
                      <option value="">Select your province...</option>
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

                  {/* JUDGE-ONLY EXTRA FIELDS */}
                  {registerRole === 'judge' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pt-2 border-t border-slate-100"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <Award size={16} className="text-blue-600" /> Academic / Professional Qualification
                        </label>
                        <input
                          required={registerRole === 'judge'}
                          type="text"
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                          placeholder="e.g. PhD in Computer Science, MEng Electrical"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                          <BrainCircuit size={16} className="text-indigo-600" /> Scientific Discipline / Expertise
                        </label>
                        <select
                          required={registerRole === 'judge'}
                          value={scientificDisciplines}
                          onChange={(e) => setScientificDisciplines(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
                        >
                          <option value="">Select primary field of expertise...</option>
                          <option value="Computer Sciences & Software">Computer Sciences & Software</option>
                          <option value="Engineering & Technology">Engineering & Technology</option>
                          <option value="Environmental Sciences">Environmental Sciences</option>
                          <option value="Chemistry & Biochemistry">Chemistry & Biochemistry</option>
                          <option value="Physics, Astronomy & Space Sciences">Physics, Astronomy & Space Sciences</option>
                          <option value="Mathematics & Data Science">Mathematics & Data Science</option>
                          <option value="Energy & Power Systems">Energy & Power Systems</option>
                          <option value="Social & Behavioral Sciences">Social & Behavioral Sciences</option>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm flex justify-center mt-2"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                  </button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}