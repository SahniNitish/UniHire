export type Job = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  shareable_link: string;
}

export type Candidate = {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone?: string;
  resume_url: string;
  resume_text: string;
  created_at: string;
}

export type AnalysisResult = {
  candidate_id: string;
  score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  interview_tips: string[];
}

export type RankedCandidate = Candidate & {
  analysis: AnalysisResult;
}
