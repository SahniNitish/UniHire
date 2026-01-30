import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { getJob, addCandidate } from '@/lib/supabase';
import { extractTextFromFile } from '@/lib/utils';
import { analyzeResume } from '@/lib/ai';
import { saveAnalysis } from '@/lib/supabase';

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      try {
        const jobData = await getJob(jobId);
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setResumeFile(file);

    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      setError('');
    } catch (err) {
      setError('Error reading resume file. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !resumeFile || !jobId) {
      setError('Please fill in all required fields and upload your resume');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const jobData = await getJob(jobId);
      if (!jobData) throw new Error('Job not found');

      const candidate = await addCandidate({
        job_id: jobId,
        name,
        email,
        phone,
        resume_url: URL.createObjectURL(resumeFile),
        resume_text: resumeText,
      });

      const analysis = await analyzeResume(jobData.description, resumeText, name);
      analysis.candidate_id = candidate.id;

      await saveAnalysis(analysis);

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F5C518] border-3 border-[#1A1A1A] rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-[#1A1A1A]" />
          </div>
          <p className="text-[#1A1A1A] font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center p-4">
        <div className="retro-card max-w-md w-full overflow-hidden">
          <div className="bg-green-500 border-b-3 border-[#1A1A1A] p-2" />
          <div className="p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 border-3 border-[#1A1A1A] rounded-full flex items-center justify-center animate-bounce-subtle">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-[#1A1A1A] mb-3">
              Application Submitted!
            </h2>
            <p className="text-[#1A1A1A]/70 mb-8 leading-relaxed">
              Thank you for applying{job?.title ? ` for ${job.title}` : ''}. The hiring team will review your application and contact you if there's a match.
            </p>
            <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                Your resume has been analyzed by our AI system and added to the candidate pool.
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="retro-btn-outline w-full py-3"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center p-4">
        <div className="retro-card p-8 text-center max-w-md w-full">
          <FileText className="w-16 h-16 mx-auto text-[#1A1A1A]/30 mb-4" />
          <h2 className="text-xl font-black text-[#1A1A1A] mb-2">Job Not Found</h2>
          <p className="text-[#1A1A1A]/60">This job posting may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="border-b-3 border-[#1A1A1A] bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <span className="text-2xl font-black text-[#1A1A1A]">UniHire</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-[#1A1A1A]">Secure Application</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Info Card */}
        <div className="retro-card-yellow p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <span className="text-[#1A1A1A]/70 text-sm font-bold">You're applying for</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A1A] mb-2">{job.title}</h1>
          <p className="text-[#1A1A1A]/70 text-sm line-clamp-2">{job.description}</p>
        </div>

        {/* Application Form */}
        <div className="retro-card">
          <div className="p-6 border-b-2 border-[#1A1A1A] text-center">
            <h2 className="text-2xl font-black text-[#1A1A1A]">Submit Your Application</h2>
            <p className="text-[#1A1A1A]/60 mt-2">Fill out the form and upload your resume</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-[#1A1A1A] font-bold mb-2">
                <User className="w-4 h-4" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="retro-input w-full px-4 py-3"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-[#1A1A1A] font-bold mb-2">
                <Mail className="w-4 h-4" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="retro-input w-full px-4 py-3"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-[#1A1A1A] font-bold mb-2">
                <Phone className="w-4 h-4" />
                Phone Number <span className="text-[#1A1A1A]/40">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="retro-input w-full px-4 py-3"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="flex items-center gap-2 text-[#1A1A1A] font-bold mb-2">
                <FileText className="w-4 h-4" />
                Resume <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="resume-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-[#F5C518] bg-[#F5C518]/20'
                    : resumeFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-[#1A1A1A] hover:border-[#F5C518] hover:bg-[#F5F0E1]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {resumeFile ? (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 border-2 border-green-400 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-green-700">{resumeFile.name}</p>
                    <p className="text-xs text-[#1A1A1A]/60 mt-1">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#F5F0E1] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#1A1A1A]/40" />
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A]/70">
                      Drag & drop your resume here
                    </p>
                    <p className="text-xs text-[#1A1A1A]/40 mt-1">or click to browse (PDF, DOCX)</p>
                  </div>
                )}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="retro-btn w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="p-6 border-t-2 border-dashed border-[#1A1A1A]/20 text-center">
            <p className="text-xs text-[#1A1A1A]/50">
              Your information is secure and will only be shared with the hiring team.
              <br />By submitting, you agree to our privacy policy.
            </p>
          </div>
        </div>

        {/* Powered By */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#1A1A1A]/50 flex items-center justify-center gap-2">
            Powered by
            <span className="font-black text-[#1A1A1A]">UniHire AI</span>
          </p>
        </div>
      </main>
    </div>
  );
}
