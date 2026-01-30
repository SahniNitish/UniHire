import type { AnalysisResult } from '@/types';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// Analyze resume using Claude AI
export const analyzeResume = async (
  jobDescription: string,
  resumeText: string,
  candidateName: string
): Promise<AnalysisResult> => {
  // If no API key, use fallback mock analysis
  if (!ANTHROPIC_API_KEY) {
    console.warn('No Anthropic API key found, using mock analysis');
    return mockAnalyzeResume(jobDescription, resumeText, candidateName);
  }

  console.log('Using Claude API for analysis...');
  console.log('Resume text length:', resumeText.length);
  console.log('Job description length:', jobDescription.length);

  const prompt = `You are an expert HR recruiter and resume analyst with 15+ years of experience. Analyze this resume against the job description with extreme detail and precision.

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE RESUME ===
${resumeText}

=== ANALYSIS INSTRUCTIONS ===
Perform a thorough analysis and provide your response in this EXACT JSON format (no other text):

{
  "score": <number 0-100>,
  "verdict": "<2 sentence executive summary - first sentence about overall fit, second about key differentiator or concern>",
  "strengths": [
    "<SKILL/QUALITY>: <Specific evidence from resume> → <Why this matters for the role>",
    "<SKILL/QUALITY>: <Specific evidence from resume> → <Why this matters for the role>",
    "<SKILL/QUALITY>: <Specific evidence from resume> → <Why this matters for the role>",
    "<SKILL/QUALITY>: <Specific evidence from resume> → <Why this matters for the role>"
  ],
  "weaknesses": [
    "<MISSING REQUIREMENT>: <What the job needs> vs <What resume shows or lacks> → <Impact on role performance> → <Mitigation: How this gap could be addressed>",
    "<MISSING REQUIREMENT>: <What the job needs> vs <What resume shows or lacks> → <Impact on role performance> → <Mitigation: How this gap could be addressed>",
    "<MISSING REQUIREMENT>: <What the job needs> vs <What resume shows or lacks> → <Impact on role performance> → <Mitigation: How this gap could be addressed>"
  ],
  "recommendation": "<3-4 sentence recommendation: 1) Clear hire/no-hire/maybe stance 2) Primary reason 3) Key risk or opportunity 4) Suggested next step>",
  "interview_tips": [
    "VERIFY: <Question to validate a specific claim from their resume>",
    "PROBE GAP: <Question about their biggest weakness area - how would they handle it>",
    "BEHAVIORAL: <Situational question relevant to job requirements>"
  ]
}

=== SCORING RUBRIC ===
- 90-100: Exceptional match, exceeds most requirements
- 75-89: Strong match, meets core requirements with minor gaps
- 60-74: Moderate match, meets some requirements but notable gaps
- 45-59: Weak match, significant gaps in key areas
- Below 45: Poor match, missing most core requirements

=== CRITICAL RULES ===
1. BIAS-FREE: Evaluate ONLY skills, experience, education, achievements. Ignore name, gender, age, ethnicity
2. EVIDENCE-BASED: Every strength must cite specific resume content (projects, metrics, years)
3. GAPS MUST BE SPECIFIC: Don't say "lacks experience" - say exactly what's missing and what impact it has
4. BE HONEST: Don't inflate scores to be nice. A 60% match is a 60% match
5. ACTIONABLE: Every weakness should include how it could be mitigated (training, mentorship, etc.)
6. QUANTIFY: Use numbers from resume (X years, Y projects, Z% improvement) whenever possible`;

  try {
    const response = await fetch('/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      candidate_id: '', // Will be set by caller
      score: Math.min(100, Math.max(0, analysis.score)),
      verdict: analysis.verdict,
      strengths: analysis.strengths.slice(0, 4),
      weaknesses: analysis.weaknesses.slice(0, 3),
      recommendation: analysis.recommendation,
      interview_tips: analysis.interview_tips.slice(0, 3),
    };
  } catch (error: any) {
    console.error('Claude API error:', error);
    console.error('Error message:', error?.message);
    console.error('Falling back to mock analysis');
    // Fallback to mock analysis if API fails
    return mockAnalyzeResume(jobDescription, resumeText, candidateName);
  }
};

// Fallback mock analysis when API is unavailable
const mockAnalyzeResume = async (
  jobDescription: string,
  resumeText: string,
  _candidateName: string
): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Extract keywords from job description for mock matching
  const jobKeywords = jobDescription.toLowerCase().match(/\b(python|machine learning|ml|research|phd|masters|java|react|javascript|typescript|sql|data science|ai|nlp|computer vision|statistics|mathematics|algorithms|programming|node|express|mongodb|postgresql|aws|docker|kubernetes|agile|scrum|leadership|management|communication)\b/g) || [];

  // Extract skills from resume
  const resumeLower = resumeText.toLowerCase();
  const hasPython = resumeLower.includes('python');
  const hasML = resumeLower.includes('machine learning') || resumeLower.includes('ml');
  const hasResearch = resumeLower.includes('research') || resumeLower.includes('published');
  const hasPhD = resumeLower.includes('phd') || resumeLower.includes('doctorate');
  const hasMasters = resumeLower.includes('master') || resumeLower.includes('m.s.') || resumeLower.includes('msc');
  const hasJavaScript = resumeLower.includes('javascript') || resumeLower.includes('js');
  const hasReact = resumeLower.includes('react');
  const hasSQL = resumeLower.includes('sql');
  const hasDataScience = resumeLower.includes('data science') || resumeLower.includes('data scientist');
  const hasNode = resumeLower.includes('node') || resumeLower.includes('express');
  const hasAWS = resumeLower.includes('aws') || resumeLower.includes('cloud');
  const hasDocker = resumeLower.includes('docker') || resumeLower.includes('kubernetes');

  // Calculate score based on matches
  let score = 45;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (hasPython) {
    score += 12;
    const years = resumeText.match(/(\d+)\+?\s*years?\s+(of\s+)?experience.*?python/i)?.[1] || '2+';
    strengths.push(`Python Programming - ${years} years of hands-on experience demonstrated`);
  }

  if (hasML) {
    score += 12;
    strengths.push('Machine Learning - Practical experience with ML frameworks and model development');
  }

  if (hasResearch) {
    score += 8;
    const papers = resumeText.match(/(\d+)\s+published/i)?.[1] || 'multiple';
    strengths.push(`Research Background - ${papers} published paper(s) indicating analytical capabilities`);
  }

  if (hasPhD) {
    score += 8;
    strengths.push('Advanced Education - PhD demonstrates deep expertise and research ability');
  } else if (hasMasters) {
    score += 5;
    strengths.push('Strong Education - Masters degree in relevant technical field');
  }

  if (hasJavaScript || hasReact) {
    score += 6;
    strengths.push('Frontend Development - Modern JavaScript/React experience');
  }

  if (hasSQL) {
    score += 5;
    strengths.push('Database Skills - SQL proficiency for data management');
  }

  if (hasDataScience) {
    score += 8;
    strengths.push('Data Science - Direct domain expertise applicable to role');
  }

  if (hasNode) {
    score += 5;
    strengths.push('Backend Development - Node.js/Express server-side experience');
  }

  if (hasAWS) {
    score += 5;
    strengths.push('Cloud Infrastructure - AWS/Cloud deployment experience');
  }

  if (hasDocker) {
    score += 4;
    strengths.push('DevOps Skills - Container and orchestration knowledge');
  }

  // Generate weaknesses based on job requirements
  const uniqueJobKeywords = [...new Set(jobKeywords)];

  if (!hasPython && uniqueJobKeywords.includes('python')) {
    score -= 8;
    weaknesses.push('Python Programming - Core requirement not evident in resume');
  }

  if (!hasML && (uniqueJobKeywords.includes('machine learning') || uniqueJobKeywords.includes('ml'))) {
    score -= 8;
    weaknesses.push('Machine Learning - No ML project experience mentioned');
  }

  if (!hasSQL && uniqueJobKeywords.includes('sql')) {
    weaknesses.push('Database Skills - SQL experience not demonstrated');
  }

  if (!hasAWS && uniqueJobKeywords.includes('aws')) {
    weaknesses.push('Cloud Experience - No AWS or cloud platform experience listed');
  }

  if (weaknesses.length === 0) {
    weaknesses.push('Limited leadership experience - Could benefit from team lead opportunities');
  }

  // Cap score
  score = Math.max(25, Math.min(95, score));

  // Generate verdict
  let verdict = '';
  if (score >= 80) {
    verdict = 'Excellent candidate with strong alignment to job requirements and demonstrated expertise';
  } else if (score >= 65) {
    verdict = 'Good candidate with solid qualifications, minor gaps can be addressed through onboarding';
  } else if (score >= 50) {
    verdict = 'Moderate fit - meets some requirements but has notable skill gaps to consider';
  } else {
    verdict = 'Below requirements - significant gaps in core competencies for this role';
  }

  // Generate recommendation
  let recommendation = '';
  if (score >= 75) {
    recommendation = `Strong recommendation for interview. This candidate demonstrates ${strengths.length > 0 ? strengths[0].split(' - ')[0].toLowerCase() : 'relevant skills'} which directly aligns with role requirements. ${weaknesses.length > 0 ? 'Address ' + weaknesses[0].split(' - ')[0].toLowerCase() + ' during interview.' : 'Well-rounded profile.'}`;
  } else if (score >= 55) {
    recommendation = `Consider for interview if top candidates unavailable. Shows promise in ${strengths.length > 0 ? strengths[0].split(' - ')[0].toLowerCase() : 'some areas'}, but gaps in ${weaknesses.length > 0 ? weaknesses[0].split(' - ')[0].toLowerCase() : 'key skills'} may require additional training investment.`;
  } else {
    recommendation = `Not recommended for this specific role. Consider for alternative positions that better match their ${strengths.length > 0 ? strengths[0].split(' - ')[0].toLowerCase() : 'current'} skillset.`;
  }

  // Generate interview tips
  const interviewTips: string[] = [];
  if (hasML) {
    interviewTips.push('Walk me through a specific ML project - what problem did you solve and what was the impact?');
  }
  if (hasPython) {
    interviewTips.push('Describe your approach to writing maintainable Python code. Can you share a code review experience?');
  }
  if (hasResearch) {
    interviewTips.push('How do you translate research findings into practical applications?');
  }
  if (weaknesses.length > 0) {
    interviewTips.push(`How would you approach learning ${weaknesses[0].split(' - ')[0].toLowerCase()} if required for this role?`);
  }
  if (interviewTips.length < 3) {
    interviewTips.push('Tell me about a challenging project and how you overcame obstacles.');
    interviewTips.push('How do you stay current with new technologies in your field?');
  }

  return {
    candidate_id: '',
    score,
    verdict,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    recommendation,
    interview_tips: interviewTips.slice(0, 3),
  };
};
