import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Upload,
  Link2,
  Loader2,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  Users,
  Award,
  Brain,
  Zap,
  BarChart3,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { getJob, getCandidatesByJob, getAnalysesByJob, addCandidate, saveAnalysis } from '@/lib/supabase';
import { extractTextFromFile, extractContactInfo, fileToDataURL } from '@/lib/utils';
import { analyzeResume } from '@/lib/ai';
import type { Job, Candidate, RankedCandidate, AnalysisResult } from '@/types';

// Resume Modal Component
const ResumeModal = ({
  isOpen,
  onClose,
  candidate,
  viewMode = 'pdf'
}: {
  isOpen: boolean;
  onClose: () => void;
  candidate: RankedCandidate | null;
  viewMode?: 'pdf' | 'text';
}) => {
  const [mode, setMode] = useState<'pdf' | 'text'>(viewMode);

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#FFFDF7] border-3 border-[#1A1A1A] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#F5C518] border-b-3 border-[#1A1A1A] p-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-[#1A1A1A] text-lg">{candidate.name}'s Resume</h3>
            <div className="flex items-center gap-3 text-[#1A1A1A]/70 text-sm">
              {candidate.email && <span>{candidate.email}</span>}
              {candidate.phone && <span>• {candidate.phone}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-lg overflow-hidden">
              <button
                onClick={() => setMode('pdf')}
                className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                  mode === 'pdf' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F5F0E1]'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-3 py-1.5 text-sm font-bold transition-colors ${
                  mode === 'text' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-[#F5F0E1]'
                }`}
              >
                Text View
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center font-black hover:bg-red-100"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === 'pdf' ? (
            <iframe
              src={candidate.resume_url}
              className="w-full h-full min-h-[70vh]"
              title={`${candidate.name}'s Resume`}
            />
          ) : (
            <div className="p-6 overflow-y-auto h-full max-h-[70vh]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-[#1A1A1A] bg-[#F5F0E1] border-2 border-[#1A1A1A] rounded-xl p-4">
                {candidate.resume_text || 'Resume text not available'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Circular Score Component
const ScoreCircle = ({ score, size = 80 }: { score: number; size?: number }) => {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#F5C518';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size}>
        <circle
          className="score-ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="score-ring-progress"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-black text-[#1A1A1A]">{score}%</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [resumeModalCandidate, setResumeModalCandidate] = useState<RankedCandidate | null>(null);

  const fetchData = useCallback(async () => {
    if (!jobId) return;

    try {
      const [jobData, candidatesData, analysesData] = await Promise.all([
        getJob(jobId),
        getCandidatesByJob(jobId),
        getAnalysesByJob(jobId),
      ]);

      setJob(jobData);
      setCandidates(candidatesData);
      setAnalyses(analysesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyLink = () => {
    if (job?.shareable_link) {
      navigator.clipboard.writeText(job.shareable_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !jobId || !job) return;

    setUploading(true);
    setAnalyzing(true);

    try {
      for (const file of Array.from(files)) {
        // Extract text and convert file to data URL in parallel
        const [resumeText, resumeDataUrl] = await Promise.all([
          extractTextFromFile(file),
          fileToDataURL(file)
        ]);

        // Extract contact info from resume
        const contactInfo = extractContactInfo(resumeText);
        console.log('Extracted contact info:', contactInfo);

        const candidate = await addCandidate({
          job_id: jobId,
          name: contactInfo.name || file.name.replace(/\.[^/.]+$/, ''),
          email: contactInfo.email || 'not-found@unihire.com',
          phone: contactInfo.phone || '',
          resume_url: resumeDataUrl,
          resume_text: resumeText,
        });

        const analysis = await analyzeResume(job.description, resumeText, candidate.name);
        analysis.candidate_id = candidate.id;

        await saveAnalysis(analysis);
      }

      await fetchData();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const rankedCandidates: RankedCandidate[] = candidates
    .map(candidate => ({
      ...candidate,
      analysis: analyses.find(a => a.candidate_id === candidate.id) || {
        candidate_id: candidate.id,
        score: 0,
        verdict: 'Analysis pending...',
        strengths: [],
        weaknesses: [],
        recommendation: '',
        interview_tips: [],
      },
    }))
    .sort((a, b) => b.analysis.score - a.analysis.score);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent Match', className: 'bg-green-100 text-green-700 border-green-400' };
    if (score >= 60) return { text: 'Good Match', className: 'bg-yellow-100 text-yellow-700 border-yellow-400' };
    if (score >= 40) return { text: 'Potential', className: 'bg-orange-100 text-orange-700 border-orange-400' };
    return { text: 'Low Match', className: 'bg-red-100 text-red-700 border-red-400' };
  };

  const getRankDisplay = (index: number) => {
    if (index === 0) return { icon: '🥇', bg: 'bg-[#F5C518]' };
    if (index === 1) return { icon: '🥈', bg: 'bg-gray-200' };
    if (index === 2) return { icon: '🥉', bg: 'bg-orange-200' };
    return { icon: `#${index + 1}`, bg: 'bg-[#F5F0E1]' };
  };

  // Stats
  const avgScore = rankedCandidates.length > 0
    ? Math.round(rankedCandidates.reduce((acc, c) => acc + c.analysis.score, 0) / rankedCandidates.length)
    : 0;
  const topCandidates = rankedCandidates.filter(c => c.analysis.score >= 70).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F5C518] border-3 border-[#1A1A1A] rounded-2xl flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-[#1A1A1A]" />
          </div>
          <p className="text-[#1A1A1A] font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="retro-card p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-[#1A1A1A]/30 mb-4" />
          <p className="text-[#1A1A1A] mb-4 font-bold">Job not found</p>
          <button onClick={() => navigate('/')} className="retro-btn px-6 py-2">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="border-b-3 border-[#1A1A1A] bg-[#FFFDF7] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#1A1A1A] font-bold hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <span className="text-xl font-black text-[#1A1A1A]">UniHire</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-[#1A1A1A]">Live Analysis</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header Card */}
        <div className="retro-card-yellow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-[#1A1A1A]" />
                <span className="text-[#1A1A1A]/70 text-sm font-bold">Job Position</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-2">{job.title}</h1>
              <p className="text-[#1A1A1A]/70 line-clamp-2 max-w-2xl">{job.description}</p>
            </div>
            <div className="flex items-center gap-6 bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-black text-[#1A1A1A]">{rankedCandidates.length}</div>
                <div className="text-[#1A1A1A]/60 text-sm font-medium">Candidates</div>
              </div>
              <div className="w-px h-12 bg-[#1A1A1A]/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-[#1A1A1A]">{avgScore}%</div>
                <div className="text-[#1A1A1A]/60 text-sm font-medium">Avg Score</div>
              </div>
              <div className="w-px h-12 bg-[#1A1A1A]/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-[#1A1A1A]">{topCandidates}</div>
                <div className="text-[#1A1A1A]/60 text-sm font-medium">Top Matches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Share Link */}
          <div className="retro-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Share Application Link</h3>
                <p className="text-sm text-[#1A1A1A]/60">Send to candidates to apply</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={job.shareable_link}
                readOnly
                className="retro-input flex-1 px-4 py-3 text-sm font-mono"
              />
              <button
                onClick={copyLink}
                className={`retro-btn px-4 py-3 flex items-center gap-2 ${copied ? 'bg-green-400' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Upload */}
          <div className="retro-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Upload Resumes</h3>
                <p className="text-sm text-[#1A1A1A]/60">Drag & drop or click to upload</p>
              </div>
            </div>
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-[#F5C518] bg-[#F5C518]/20'
                  : 'border-[#1A1A1A] hover:border-[#F5C518] hover:bg-[#F5F0E1]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {uploading || analyzing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-[#1A1A1A] animate-spin mb-2" />
                  <span className="text-sm font-bold text-[#1A1A1A]">
                    {analyzing ? 'AI analyzing...' : 'Uploading...'}
                  </span>
                </div>
              ) : (
                <>
                  <Zap className="w-8 h-8 text-[#1A1A1A]/40 mb-2" />
                  <span className="text-sm font-medium text-[#1A1A1A]/60">Drop PDF/DOCX files here</span>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Rankings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A]">AI Rankings</h2>
                <p className="text-[#1A1A1A]/60 text-sm">Candidates ranked by match score</p>
              </div>
            </div>
            <div className="retro-badge flex items-center gap-2">
              <Users className="w-4 h-4" />
              {rankedCandidates.length} Total
            </div>
          </div>

          {rankedCandidates.length === 0 ? (
            <div className="retro-card p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#F5F0E1] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-[#1A1A1A]/30" />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] mb-3">No Applicants Yet</h3>
              <p className="text-[#1A1A1A]/60 max-w-md mx-auto mb-6">
                Share the application link or upload resumes to see AI-powered rankings.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={copyLink} className="retro-btn-outline px-6 py-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rankedCandidates.map((candidate, index) => {
                const rankDisplay = getRankDisplay(index);
                const scoreBadge = getScoreBadge(candidate.analysis.score);
                const isExpanded = expandedCandidate === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    className={`retro-card overflow-hidden ${index === 0 ? 'ring-4 ring-[#F5C518]' : ''}`}
                  >
                    <div
                      className="p-6 cursor-pointer hover:bg-[#F5F0E1] transition-colors"
                      onClick={() => setExpandedCandidate(isExpanded ? null : candidate.id)}
                    >
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className={`w-14 h-14 ${rankDisplay.bg} border-2 border-[#1A1A1A] rounded-2xl flex items-center justify-center shrink-0`}>
                          <span className="text-2xl font-black">{rankDisplay.icon}</span>
                        </div>

                        {/* Score Circle */}
                        <ScoreCircle score={candidate.analysis.score} size={70} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-[#1A1A1A] truncate">
                              {candidate.name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded font-bold border ${scoreBadge.className}`}>
                              {scoreBadge.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            {candidate.email && candidate.email !== 'not-found@unihire.com' && (
                              <div className="flex items-center gap-1 text-[#1A1A1A]/60 text-sm">
                                <Mail className="w-3 h-3" />
                                <span>{candidate.email}</span>
                              </div>
                            )}
                            {candidate.phone && (
                              <div className="flex items-center gap-1 text-[#1A1A1A]/60 text-sm">
                                <Phone className="w-3 h-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[#1A1A1A]/70 text-sm line-clamp-1">
                            {candidate.analysis.verdict}
                          </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden lg:flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="font-black">{candidate.analysis.strengths.length}</span>
                            </div>
                            <span className="text-xs text-[#1A1A1A]/60">Strengths</span>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-orange-500">
                              <XCircle className="w-4 h-4" />
                              <span className="font-black">{candidate.analysis.weaknesses.length}</span>
                            </div>
                            <span className="text-xs text-[#1A1A1A]/60">Gaps</span>
                          </div>
                        </div>

                        {/* View Resume Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeModalCandidate(candidate);
                          }}
                          className="flex items-center gap-1 px-3 py-2 bg-[#F5F0E1] border-2 border-[#1A1A1A] rounded-lg text-sm font-bold hover:bg-[#F5C518] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Resume
                        </button>

                        {/* Expand */}
                        <button className="p-2 hover:bg-[#F5C518] rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#1A1A1A]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#1A1A1A]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-[#1A1A1A] p-6 bg-[#F5F0E1]">
                        <div className="grid lg:grid-cols-2 gap-6">
                          {/* Strengths */}
                          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-green-100 border-2 border-green-400 rounded-lg flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <h4 className="font-black text-[#1A1A1A]">Key Strengths</h4>
                            </div>
                            <ul className="space-y-3">
                              {candidate.analysis.strengths.map((strength, i) => {
                                // Parse the structured strength format (SKILL: Evidence → Why it matters)
                                const parts = strength.split('→').map(s => s.trim());
                                const mainStrength = parts[0] || strength;
                                const relevance = parts[1];

                                return (
                                  <li key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                      <div>
                                        <span className="text-[#1A1A1A] text-sm font-medium">{mainStrength}</span>
                                        {relevance && (
                                          <p className="text-[#1A1A1A]/60 text-xs mt-1">
                                            <span className="text-green-600 font-bold">Why it matters:</span> {relevance}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                              {candidate.analysis.strengths.length === 0 && (
                                <li className="text-sm text-[#1A1A1A]/40 italic">No significant strengths identified</li>
                              )}
                            </ul>
                          </div>

                          {/* Weaknesses / Gaps */}
                          <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-orange-100 border-2 border-orange-400 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-orange-500" />
                              </div>
                              <h4 className="font-black text-[#1A1A1A]">Skill Gaps & Concerns</h4>
                            </div>
                            <ul className="space-y-4">
                              {candidate.analysis.weaknesses.map((weakness, i) => {
                                // Parse the structured weakness format
                                const parts = weakness.split('→').map(s => s.trim());
                                const mainGap = parts[0] || weakness;
                                const impact = parts[1];
                                const mitigation = parts[2];

                                return (
                                  <li key={i} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2 mb-2">
                                      <div className="w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-white text-xs font-black">{i + 1}</span>
                                      </div>
                                      <span className="text-[#1A1A1A] text-sm font-bold">{mainGap}</span>
                                    </div>
                                    {impact && (
                                      <div className="ml-7 mb-1">
                                        <span className="text-xs font-bold text-orange-600">Impact: </span>
                                        <span className="text-[#1A1A1A]/70 text-xs">{impact}</span>
                                      </div>
                                    )}
                                    {mitigation && (
                                      <div className="ml-7">
                                        <span className="text-xs font-bold text-green-600">Mitigation: </span>
                                        <span className="text-[#1A1A1A]/70 text-xs">{mitigation}</span>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                              {candidate.analysis.weaknesses.length === 0 && (
                                <li className="text-sm text-[#1A1A1A]/40 italic">No significant gaps found</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="mt-6 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
                              <Lightbulb className="w-5 h-5 text-[#1A1A1A]" />
                            </div>
                            <h4 className="font-black text-[#1A1A1A]">AI Recommendation</h4>
                          </div>
                          <p className="text-[#1A1A1A]/80 text-sm leading-relaxed">
                            {candidate.analysis.recommendation}
                          </p>
                        </div>

                        {/* Interview Tips */}
                        <div className="mt-4 bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
                              <Target className="w-5 h-5 text-[#1A1A1A]" />
                            </div>
                            <h4 className="font-black text-[#1A1A1A]">Suggested Interview Questions</h4>
                          </div>
                          <div className="space-y-3">
                            {candidate.analysis.interview_tips.map((tip, i) => {
                              // Parse tip type (VERIFY:, PROBE GAP:, BEHAVIORAL:)
                              let tipType = 'QUESTION';
                              let tipContent = tip;
                              let bgColor = 'bg-gray-100';
                              let borderColor = 'border-gray-300';
                              let textColor = 'text-gray-600';

                              if (tip.startsWith('VERIFY:')) {
                                tipType = 'VERIFY';
                                tipContent = tip.replace('VERIFY:', '').trim();
                                bgColor = 'bg-blue-50';
                                borderColor = 'border-blue-300';
                                textColor = 'text-blue-600';
                              } else if (tip.startsWith('PROBE GAP:') || tip.startsWith('PROBE:')) {
                                tipType = 'PROBE GAP';
                                tipContent = tip.replace('PROBE GAP:', '').replace('PROBE:', '').trim();
                                bgColor = 'bg-orange-50';
                                borderColor = 'border-orange-300';
                                textColor = 'text-orange-600';
                              } else if (tip.startsWith('BEHAVIORAL:')) {
                                tipType = 'BEHAVIORAL';
                                tipContent = tip.replace('BEHAVIORAL:', '').trim();
                                bgColor = 'bg-purple-50';
                                borderColor = 'border-purple-300';
                                textColor = 'text-purple-600';
                              }

                              return (
                                <div key={i} className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
                                  <div className="flex items-start gap-2">
                                    <span className={`text-xs font-black px-2 py-0.5 ${bgColor} border ${borderColor} rounded ${textColor}`}>
                                      {tipType}
                                    </span>
                                    <span className="text-[#1A1A1A]/80 text-sm flex-1">{tipContent}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={resumeModalCandidate !== null}
        onClose={() => setResumeModalCandidate(null)}
        candidate={resumeModalCandidate}
      />
    </div>
  );
}
