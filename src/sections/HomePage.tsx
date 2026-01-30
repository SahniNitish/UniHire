import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Upload,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

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
          <div className="flex items-center gap-3">
            <div className="retro-badge hidden sm:flex">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border-2 border-[#1A1A1A] rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#1A1A1A]">Live Demo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-full mb-6">
              <Brain className="w-4 h-4 text-[#1A1A1A]" />
              <span className="text-sm font-bold text-[#1A1A1A]">AI-Powered Resume Screening</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-black text-[#1A1A1A] mb-6 leading-tight">
              Hire Smarter,
              <br />
              <span className="relative inline-block">
                Not Harder
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 2 150 2 198 10" stroke="#F5C518" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-[#1A1A1A]/70 max-w-3xl mx-auto mb-10 leading-relaxed">
              Upload resumes. Get instant AI rankings with detailed explanations.
              Find the perfect candidate in seconds, not hours.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/create-job')}
                className="retro-btn px-8 py-4 text-lg flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start Screening Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-[#1A1A1A]/60">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">No signup required</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="retro-card p-6 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '85%', label: 'Time Saved', icon: '⚡' },
                { value: '95%', label: 'Accuracy Rate', icon: '🎯' },
                { value: '0%', label: 'Bias', icon: '⚖️' },
                { value: '<2s', label: 'Per Resume', icon: '🚀' },
              ].map((stat, i) => (
                <div key={i} className="p-4">
                  <span className="text-3xl mb-2 block">{stat.icon}</span>
                  <div className="text-3xl md:text-4xl font-black text-[#1A1A1A]">{stat.value}</div>
                  <div className="text-sm text-[#1A1A1A]/60 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#FFFDF7] border-y-3 border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#1A1A1A]/70">
              Three simple steps to find your ideal candidate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Briefcase,
                title: 'Post Your Job',
                description: 'Select department, skills, and experience level. We auto-generate the description.',
                color: '#F5C518'
              },
              {
                step: '2',
                icon: Upload,
                title: 'Upload Resumes',
                description: 'Drag & drop multiple CVs or share a link for candidates to apply directly.',
                color: '#F5C518'
              },
              {
                step: '3',
                icon: BarChart3,
                title: 'Get AI Rankings',
                description: 'Instant scores, strengths, weaknesses, and interview tips for each candidate.',
                color: '#F5C518'
              }
            ].map((item, i) => (
              <div key={i} className="retro-card p-6 relative">
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-black text-lg">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-[#1A1A1A]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-[#1A1A1A]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">
              Why UniHire?
            </h2>
            <p className="text-lg text-[#1A1A1A]/70">
              Built for recruiters who value speed, accuracy, and fairness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Analyze 100+ resumes in seconds',
                emoji: '⚡'
              },
              {
                icon: Target,
                title: 'Precise Matching',
                description: 'AI extracts skills and matches requirements',
                emoji: '🎯'
              },
              {
                icon: Shield,
                title: 'Bias-Free',
                description: 'Focuses only on skills and experience',
                emoji: '🛡️'
              },
              {
                icon: TrendingUp,
                title: 'Actionable Insights',
                description: 'Strengths, gaps, and interview questions',
                emoji: '📈'
              }
            ].map((feature, i) => (
              <div key={i} className="retro-card p-6 text-center hover:translate-y-[-4px] transition-transform">
                <span className="text-4xl mb-4 block">{feature.emoji}</span>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#1A1A1A]/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-16 bg-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-white/70">
              Real-time AI analysis with detailed explanations
            </p>
          </div>

          {/* Mock Dashboard */}
          <div className="retro-card overflow-hidden">
            <div className="bg-[#F5C518] border-b-3 border-[#1A1A1A] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Software Engineer - Full Stack</h3>
                  <p className="text-sm text-[#1A1A1A]/70">3 candidates analyzed</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-[#1A1A1A]">Live</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#FFFDF7]">
              <div className="space-y-4">
                {[
                  { rank: '🥇', name: 'Sarah Chen', score: 92, badge: 'Excellent Match', color: 'green' },
                  { rank: '🥈', name: 'Michael Roberts', score: 78, badge: 'Good Match', color: 'yellow' },
                  { rank: '🥉', name: 'Alex Thompson', score: 65, badge: 'Potential', color: 'orange' },
                ].map((candidate, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-[#F5F0E1] border-2 border-[#1A1A1A] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{candidate.rank}</span>
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{candidate.name}</p>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          candidate.color === 'green' ? 'bg-green-100 text-green-700 border border-green-300' :
                          candidate.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                          'bg-orange-100 text-orange-700 border border-orange-300'
                        }`}>
                          {candidate.badge}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#1A1A1A]">{candidate.score}%</p>
                        <p className="text-xs text-[#1A1A1A]/60">match score</p>
                      </div>
                      <div className="w-24 h-4 bg-[#E8E3D4] border border-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            candidate.score >= 80 ? 'bg-green-500' :
                            candidate.score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="retro-card-yellow p-8 md:p-12 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#1A1A1A] fill-[#1A1A1A]" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-4">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-lg text-[#1A1A1A]/70 mb-8 max-w-2xl mx-auto">
              Join recruiters who are saving hours every week with AI-powered screening.
            </p>
            <button
              onClick={() => navigate('/create-job')}
              className="retro-btn-outline px-8 py-4 text-lg inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-[#1A1A1A] bg-[#FFFDF7] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F5C518] border-2 border-[#1A1A1A] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <span className="font-black text-[#1A1A1A]">UniHire</span>
              <span className="text-[#1A1A1A]/40 mx-2">|</span>
              <span className="text-sm text-[#1A1A1A]/60">Built for CodeItUp Hackathon 2025</span>
            </div>
            <div className="text-sm text-[#1A1A1A]/60">
              Sponsored by AIDA & Launchbox
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
