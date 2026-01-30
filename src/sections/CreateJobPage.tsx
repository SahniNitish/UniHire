import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createJob } from '@/lib/supabase';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Briefcase,
  Clock,
  MapPin,
  GraduationCap,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';

// Job Categories
const JOB_CATEGORIES = [
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'data', label: 'Data & Analytics', icon: '📊' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'hr', label: 'Human Resources', icon: '👥' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
  { id: 'research', label: 'Research', icon: '🔬' },
];

// Job Types
const JOB_TYPES = [
  { id: 'full-time', label: 'Full-Time', icon: '🕐' },
  { id: 'part-time', label: 'Part-Time', icon: '⏰' },
  { id: 'contract', label: 'Contract', icon: '📝' },
  { id: 'internship', label: 'Internship', icon: '🎓' },
];

// Experience Levels
const EXPERIENCE_LEVELS = [
  { id: 'entry', label: 'Entry Level', years: '0-2 years', icon: '🌱' },
  { id: 'mid', label: 'Mid Level', years: '2-5 years', icon: '🌿' },
  { id: 'senior', label: 'Senior Level', years: '5-8 years', icon: '🌳' },
  { id: 'lead', label: 'Lead/Manager', years: '8+ years', icon: '🏆' },
];

// Work Location
const WORK_LOCATIONS = [
  { id: 'remote', label: 'Remote', icon: '🏠' },
  { id: 'onsite', label: 'On-Site', icon: '🏢' },
  { id: 'hybrid', label: 'Hybrid', icon: '🔄' },
];

// Skills by Category
const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  tech: ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++', 'Go', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL'],
  data: ['Python', 'SQL', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Visualization', 'Tableau', 'Power BI', 'Statistics', 'ETL', 'Spark', 'Pandas', 'NumPy'],
  design: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'HTML/CSS', 'Wireframing', 'User Testing'],
  marketing: ['SEO', 'SEM', 'Google Analytics', 'Social Media', 'Content Marketing', 'Email Marketing', 'Copywriting', 'Brand Strategy', 'Marketing Automation', 'HubSpot', 'Salesforce'],
  finance: ['Financial Analysis', 'Excel', 'Financial Modeling', 'Accounting', 'Budgeting', 'Forecasting', 'SAP', 'QuickBooks', 'Risk Management', 'Investment Analysis', 'SQL'],
  hr: ['Recruiting', 'HRIS', 'Employee Relations', 'Performance Management', 'Onboarding', 'Compensation', 'Benefits Administration', 'Labor Law', 'Training', 'Workday'],
  operations: ['Project Management', 'Process Improvement', 'Supply Chain', 'Logistics', 'Lean Six Sigma', 'Vendor Management', 'Quality Assurance', 'ERP Systems', 'Agile', 'Scrum'],
  research: ['Research Methods', 'Data Analysis', 'Academic Writing', 'Literature Review', 'Statistical Analysis', 'Lab Techniques', 'Grant Writing', 'Peer Review', 'Publication'],
};

// Common job titles by category
const JOB_TITLES: Record<string, string[]> = {
  tech: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Mobile Developer', 'QA Engineer'],
  data: ['Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Data Engineer', 'Business Intelligence Analyst', 'AI Researcher'],
  design: ['UI/UX Designer', 'Product Designer', 'Visual Designer', 'UX Researcher', 'Design Lead', 'Graphic Designer'],
  marketing: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Manager', 'SEO Specialist', 'Brand Manager', 'Growth Marketer'],
  finance: ['Financial Analyst', 'Accountant', 'Controller', 'Finance Manager', 'Investment Analyst', 'Auditor'],
  hr: ['HR Manager', 'Recruiter', 'HR Generalist', 'Talent Acquisition Specialist', 'HR Business Partner', 'Compensation Analyst'],
  operations: ['Operations Manager', 'Project Manager', 'Supply Chain Manager', 'Process Analyst', 'Business Analyst', 'Product Manager'],
  research: ['Research Scientist', 'Research Assistant', 'Lab Manager', 'Postdoctoral Researcher', 'Research Analyst', 'Clinical Researcher'],
};

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [category, setCategory] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Available skills based on category
  const availableSkills = category ? SKILLS_BY_CATEGORY[category] || [] : [];
  const availableTitles = category ? JOB_TITLES[category] || [] : [];

  // Reset dependent fields when category changes
  useEffect(() => {
    setJobTitle('');
    setCustomTitle('');
    setSelectedSkills([]);
  }, [category]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const generateDescription = () => {
    const title = customTitle || jobTitle;
    const categoryInfo = JOB_CATEGORIES.find(c => c.id === category);
    const typeInfo = JOB_TYPES.find(t => t.id === jobType);
    const expInfo = EXPERIENCE_LEVELS.find(e => e.id === experienceLevel);
    const locInfo = WORK_LOCATIONS.find(l => l.id === workLocation);

    let desc = `We are looking for a ${title} to join our ${categoryInfo?.label || ''} team.\n\n`;

    desc += `Position Type: ${typeInfo?.label || 'Not specified'}\n`;
    desc += `Experience Required: ${expInfo?.label || 'Not specified'} (${expInfo?.years || ''})\n`;
    desc += `Work Location: ${locInfo?.label || 'Not specified'}\n\n`;

    if (selectedSkills.length > 0) {
      desc += `Required Skills:\n`;
      selectedSkills.forEach(skill => {
        desc += `- ${skill}\n`;
      });
      desc += '\n';
    }

    desc += `Responsibilities:\n`;
    desc += `- Collaborate with cross-functional teams\n`;
    desc += `- Deliver high-quality work within deadlines\n`;
    desc += `- Contribute to team goals and company objectives\n`;
    desc += `- Stay updated with industry trends and best practices\n\n`;

    if (additionalInfo) {
      desc += `Additional Information:\n${additionalInfo}\n`;
    }

    return desc;
  };

  const handleSubmit = async () => {
    const title = customTitle || jobTitle;

    if (!category || !title || !jobType || !experienceLevel) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const description = generateDescription();
      const job = await createJob(title, description);
      navigate(`/dashboard/${job.id}`);
    } catch (err) {
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = category && (customTitle || jobTitle) && jobType && experienceLevel && workLocation;

  return (
    <div className="min-h-screen bg-[#F5F0E1]">
      {/* Header */}
      <header className="border-b-3 border-[#1A1A1A] bg-[#FFFDF7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#1A1A1A] font-bold hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <span className="text-2xl font-black text-[#1A1A1A]">UniHire</span>
            </div>
          </div>
          <div className="retro-badge">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            Create Job Posting
          </h1>
          <p className="text-lg text-[#1A1A1A]/70">
            Answer a few questions and we'll generate the perfect job description
          </p>
        </div>

        {/* Step 1: Category */}
        <div className="retro-card p-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-black">
              1
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">What department is this role for?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {JOB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-4 rounded-lg border-2 border-[#1A1A1A] text-left transition-all ${
                  category === cat.id
                    ? 'bg-[#F5C518] shadow-[4px_4px_0px_#1A1A1A]'
                    : 'bg-[#FFFDF7] hover:bg-[#F5F0E1]'
                }`}
              >
                <span className="text-2xl mb-2 block">{cat.icon}</span>
                <span className="font-bold text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Job Title */}
        {category && (
          <div className="retro-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-black">
                2
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                <Briefcase className="w-5 h-5 inline mr-2" />
                Job Title
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {availableTitles.map((title) => (
                <button
                  key={title}
                  onClick={() => { setJobTitle(title); setCustomTitle(''); }}
                  className={`p-3 rounded-lg border-2 border-[#1A1A1A] text-left transition-all ${
                    jobTitle === title && !customTitle
                      ? 'bg-[#F5C518] shadow-[4px_4px_0px_#1A1A1A]'
                      : 'bg-[#FFFDF7] hover:bg-[#F5F0E1]'
                  }`}
                >
                  <span className="font-semibold text-sm">{title}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Or type a custom title..."
                value={customTitle}
                onChange={(e) => { setCustomTitle(e.target.value); setJobTitle(''); }}
                className="retro-input w-full px-4 py-3 text-lg"
              />
            </div>
          </div>
        )}

        {/* Step 3: Job Type & Experience */}
        {(jobTitle || customTitle) && (
          <div className="retro-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-black">
                3
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                <Clock className="w-5 h-5 inline mr-2" />
                Employment Details
              </h2>
            </div>

            {/* Job Type */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Job Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setJobType(type.id)}
                    className={`p-3 rounded-lg border-2 border-[#1A1A1A] text-center transition-all ${
                      jobType === type.id
                        ? 'bg-[#F5C518] shadow-[4px_4px_0px_#1A1A1A]'
                        : 'bg-[#FFFDF7] hover:bg-[#F5F0E1]'
                    }`}
                  >
                    <span className="text-xl block mb-1">{type.icon}</span>
                    <span className="font-semibold text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Experience Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setExperienceLevel(exp.id)}
                    className={`p-3 rounded-lg border-2 border-[#1A1A1A] text-center transition-all ${
                      experienceLevel === exp.id
                        ? 'bg-[#F5C518] shadow-[4px_4px_0px_#1A1A1A]'
                        : 'bg-[#FFFDF7] hover:bg-[#F5F0E1]'
                    }`}
                  >
                    <span className="text-xl block mb-1">{exp.icon}</span>
                    <span className="font-semibold text-sm block">{exp.label}</span>
                    <span className="text-xs text-[#1A1A1A]/60">{exp.years}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Work Location */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-3">
                <MapPin className="w-4 h-4 inline mr-1" />
                Work Location
              </label>
              <div className="grid grid-cols-3 gap-3">
                {WORK_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setWorkLocation(loc.id)}
                    className={`p-3 rounded-lg border-2 border-[#1A1A1A] text-center transition-all ${
                      workLocation === loc.id
                        ? 'bg-[#F5C518] shadow-[4px_4px_0px_#1A1A1A]'
                        : 'bg-[#FFFDF7] hover:bg-[#F5F0E1]'
                    }`}
                  >
                    <span className="text-xl block mb-1">{loc.icon}</span>
                    <span className="font-semibold text-sm">{loc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Skills */}
        {jobType && experienceLevel && workLocation && (
          <div className="retro-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-black">
                4
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                <Zap className="w-5 h-5 inline mr-2" />
                Required Skills
              </h2>
              <span className="retro-badge ml-auto">
                {selectedSkills.length} selected
              </span>
            </div>
            <p className="text-sm text-[#1A1A1A]/70 mb-4">Click to select the skills required for this role</p>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`retro-tag ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                >
                  {selectedSkills.includes(skill) && <Check className="w-4 h-4 mr-1" />}
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Additional Info */}
        {selectedSkills.length > 0 && (
          <div className="retro-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-black">
                5
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                Additional Information (Optional)
              </h2>
            </div>
            <textarea
              placeholder="Add any specific requirements, benefits, or company info..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="retro-input w-full px-4 py-3 min-h-[100px] resize-none"
            />
          </div>
        )}

        {/* Preview & Submit */}
        {isComplete && (
          <div className="retro-card-yellow p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                ✨ Ready to Create!
              </h2>
            </div>
            <div className="bg-[#FFFDF7] border-2 border-[#1A1A1A] rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-2">{customTitle || jobTitle}</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 bg-[#F5F0E1] border border-[#1A1A1A] rounded">
                  {JOB_TYPES.find(t => t.id === jobType)?.icon} {JOB_TYPES.find(t => t.id === jobType)?.label}
                </span>
                <span className="px-2 py-1 bg-[#F5F0E1] border border-[#1A1A1A] rounded">
                  {EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.icon} {EXPERIENCE_LEVELS.find(e => e.id === experienceLevel)?.label}
                </span>
                <span className="px-2 py-1 bg-[#F5F0E1] border border-[#1A1A1A] rounded">
                  {WORK_LOCATIONS.find(l => l.id === workLocation)?.icon} {WORK_LOCATIONS.find(l => l.id === workLocation)?.label}
                </span>
              </div>
              {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedSkills.slice(0, 5).map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-[#F5C518] border border-[#1A1A1A] rounded">
                      {skill}
                    </span>
                  ))}
                  {selectedSkills.length > 5 && (
                    <span className="text-xs px-2 py-1 bg-[#1A1A1A] text-white rounded">
                      +{selectedSkills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="retro-btn w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Job & Start Screening
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t-2 border-dashed border-[#1A1A1A]/20">
          <p className="text-sm text-[#1A1A1A]/60">
            Built for CodeItUp Hackathon 2025 • Sponsored by AIDA & Launchbox
          </p>
        </div>
      </main>
    </div>
  );
}
