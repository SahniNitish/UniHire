import { createClient } from '@supabase/supabase-js';
import type { Job, Candidate, AnalysisResult } from '@/types';

// For hackathon demo - using localStorage as fallback if Supabase not configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// LocalStorage helpers for demo
const storage = {
  jobs: [] as Job[],
  candidates: [] as Candidate[],
  analyses: [] as AnalysisResult[],
};

// Load from localStorage
const loadStorage = () => {
  try {
    const jobs = localStorage.getItem('unihire_jobs');
    const candidates = localStorage.getItem('unihire_candidates');
    const analyses = localStorage.getItem('unihire_analyses');
    if (jobs) storage.jobs = JSON.parse(jobs);
    if (candidates) storage.candidates = JSON.parse(candidates);
    if (analyses) storage.analyses = JSON.parse(analyses);
  } catch (e) {
    console.error('Error loading storage:', e);
  }
};

const saveStorage = () => {
  try {
    localStorage.setItem('unihire_jobs', JSON.stringify(storage.jobs));
    localStorage.setItem('unihire_candidates', JSON.stringify(storage.candidates));
    localStorage.setItem('unihire_analyses', JSON.stringify(storage.analyses));
  } catch (e) {
    console.error('Error saving storage:', e);
  }
};

loadStorage();

// Encode job data for shareable link (so it works across browsers)
const encodeJobData = (job: { id: string; title: string; description: string }) => {
  const data = JSON.stringify({ id: job.id, title: job.title, description: job.description });
  return btoa(encodeURIComponent(data));
};

// Decode job data from URL parameter
export const decodeJobData = (encoded: string): { id: string; title: string; description: string } | null => {
  try {
    const data = decodeURIComponent(atob(encoded));
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const createJob = async (title: string, description: string): Promise<Job> => {
  const id = Math.random().toString(36).substring(2, 15);
  const jobData = { id, title, description };
  const encodedData = encodeJobData(jobData);

  const job: Job = {
    id,
    title,
    description,
    created_at: new Date().toISOString(),
    shareable_link: `${window.location.origin}/apply/${id}?data=${encodedData}`,
  };

  if (supabase) {
    const { data, error } = await supabase.from('jobs').insert(job).select().single();
    if (error) throw error;
    return data;
  } else {
    storage.jobs.push(job);
    saveStorage();
    return job;
  }
};

export const getJob = async (id: string): Promise<Job | null> => {
  if (supabase) {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  } else {
    return storage.jobs.find(j => j.id === id) || null;
  }
};

export const addCandidate = async (candidate: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate> => {
  const newCandidate: Candidate = {
    ...candidate,
    id: Math.random().toString(36).substring(2, 15),
    created_at: new Date().toISOString(),
  };
  
  if (supabase) {
    const { data, error } = await supabase.from('candidates').insert(newCandidate).select().single();
    if (error) throw error;
    return data;
  } else {
    storage.candidates.push(newCandidate);
    saveStorage();
    return newCandidate;
  }
};

export const getCandidatesByJob = async (jobId: string): Promise<Candidate[]> => {
  if (supabase) {
    const { data, error } = await supabase.from('candidates').select('*').eq('job_id', jobId);
    if (error) throw error;
    return data || [];
  } else {
    return storage.candidates.filter(c => c.job_id === jobId);
  }
};

export const saveAnalysis = async (analysis: AnalysisResult): Promise<AnalysisResult> => {
  if (supabase) {
    const { data, error } = await supabase.from('analyses').insert(analysis).select().single();
    if (error) throw error;
    return data;
  } else {
    // Remove existing analysis for this candidate
    storage.analyses = storage.analyses.filter(a => a.candidate_id !== analysis.candidate_id);
    storage.analyses.push(analysis);
    saveStorage();
    return analysis;
  }
};

export const getAnalysesByJob = async (jobId: string): Promise<AnalysisResult[]> => {
  const candidates = await getCandidatesByJob(jobId);
  const candidateIds = candidates.map(c => c.id);
  
  if (supabase) {
    const { data, error } = await supabase.from('analyses').select('*').in('candidate_id', candidateIds);
    if (error) throw error;
    return data || [];
  } else {
    return storage.analyses.filter(a => candidateIds.includes(a.candidate_id));
  }
};
