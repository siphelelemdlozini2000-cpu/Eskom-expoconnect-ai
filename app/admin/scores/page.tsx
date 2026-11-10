// app/admin/scores/page.tsx
'use client';

import React from 'react';
import { Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockLeaderboard = [
  { rank: 1, title: 'Zero-Knowledge Proof Frameworks for Decentralized Inclusion', learner: 'Kutlwano Modise', category: 'Computer Sciences', score: '94.5', medal: 'Gold' },
  { rank: 2, title: 'Bioplastic Synthesis from Avocado Seed Starch', learner: 'Chloe Adams', category: 'Chemistry', score: '91.2', medal: 'Gold' },
  { rank: 3, title: 'Solar-Powered Smart Irrigation System', learner: 'Sipho Ndlovu', category: 'Engineering', score: '88.0', medal: 'Silver' },
  { rank: 4, title: 'AI-Driven Diagnostic Tool for Malaria', learner: 'Naledi Molefe', category: 'Medical Sciences', score: '85.4', medal: 'Silver' },
];

export default function AdminScoresPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 mb-2">Evaluation Results</Badge>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Scores & National Leaderboard</h1>
          <p className="text-slate-500 mt-1">Review finalized evaluation scores, category rankings, and medal allocations.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Evaluated Projects</p>
              <h3 className="text-3xl font-bold text-slate-900">892 <span className="text-xs font-normal text-green-600">/ 1,248</span></h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">National Average Score</p>
              <h3 className="text-3xl font-bold text-slate-900">76.4 <span className="text-xs font-normal text-blue-600">Pts</span></h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-1">Judging Completion Rate</p>
              <h3 className="text-3xl font-bold text-green-600">71.5%</h3>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm overflow-hidden bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Top Performing Projects</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Learner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Final Score</th>
                  <th className="p-4">Medal Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {mockLeaderboard.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-600">#{item.rank}</td>
                    <td className="p-4 font-semibold text-slate-900">{item.title}</td>
                    <td className="p-4 text-slate-700">{item.learner}</td>
                    <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{item.category}</span></td>
                    <td className="p-4 font-mono font-bold text-blue-600">{item.score}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.medal === 'Gold' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <Award size={12} /> {item.medal} Medal
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