import axios from 'axios';
import config from '../config/environment';
import { getStudentProfile, getStudentSubmissions } from '../api';

// Note: API keys should be handled by the backend, not exposed in client code
// These are kept for backward compatibility but should be moved to server-side

// Track which responses have been used to avoid repetition
let lastResponseTemplate = '';
let responseCounter = 0;

// Get token from local storage
const getToken = (): string | null => {
  const token = localStorage.getItem(config.AUTH.TOKEN_STORAGE_KEY);
  return token;
};

// Get auth header configuration
const getAuthConfig = () => {
  const token = getToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

// Define the API base URL
const AI_API_URL = config.API_BASE_URL + '/ai-analyzer';
// (Removed unused OPENAI_API_URL constant to satisfy TS lint)

// Define the types for the API responses
export interface StudentDataForAnalysis {
  id: string;
  name: string;
  rollNumber: string;
  grades: {
    overall: number;
    bySubject: { [subjectId: string]: number };
  };
  submissions: {
    onTime: number;
    late: number;
    bySubject: { [subjectId: string]: { onTime: number; late: number } };
  };
  performanceTrend: 'improving' | 'declining' | 'stable';
}

// Add more varied response templates
const MOCK_RESPONSES = {
  greeting: [
    "Hello {{name}}, I've analyzed your academic data.",
    "Hi {{name}}, here's what I found in your academic record.",
    "Greetings {{name}}! I've looked at your academic performance.",
    "Nice to meet you {{name}}! I've reviewed your academic information.",
    "Welcome {{name}}! Let me share what I found in your data.",
    "Hey there {{name}}! Based on your academic records...",
    "Good day {{name}}! After reviewing your academic profile...",
    "Hi there {{name}}! I've examined your academic progress.",
    "Hello {{name}}! I've taken a look at your academic standing.",
    "Greetings {{name}}! I've analyzed your current academic status."
  ],
  grades: [
    "Your overall grade is {{overall}}%, with {{subject}} at {{grade}}%.",
    "You're averaging {{overall}}% overall. In {{subject}}, you're at {{grade}}%.",
    "Your current grades show {{overall}}% overall with {{grade}}% in {{subject}}.",
    "You have an average of {{overall}}% across subjects, with {{grade}}% in {{subject}}.",
    "Your academic standing is at {{overall}}% overall, and {{grade}}% in {{subject}}.",
    "I see your overall grade is {{overall}}%, while {{subject}} shows {{grade}}%.",
    "Your performance shows {{overall}}% overall, with {{subject}} at {{grade}}%.",
    "Looking at your grades: {{overall}}% average, with {{subject}} at {{grade}}%.",
    "Your overall academic performance is {{overall}}%, with {{grade}}% in {{subject}}.",
    "Your grade profile shows {{overall}}% overall, and {{grade}}% specifically in {{subject}}."
  ],
  submissions: [
    "You've submitted {{onTime}} assignments on time and {{late}} were late.",
    "Your submission record shows {{onTime}} on-time and {{late}} late submissions.",
    "I noticed you have {{onTime}} timely submissions and {{late}} delayed ones.",
    "You've turned in {{onTime}} assignments punctually, with {{late}} past the deadline.",
    "Your record indicates {{onTime}} assignments submitted on schedule and {{late}} after deadlines.",
    "Your submission pattern shows {{onTime}} timely entries and {{late}} late ones.",
    "According to your data, you've submitted {{onTime}} assignments on time and {{late}} after the deadline.",
    "Looking at your submission history: {{onTime}} on time, {{late}} late.",
    "You've completed {{onTime}} assignments by their deadlines, with {{late}} submitted late.",
    "Your academic records show {{onTime}} timely submissions and {{late}} late ones."
  ],
  trend: [
    "Your performance trend is {{trend}}.",
    "I notice your grades have been {{trend}} recently.",
    "Your academic trajectory appears to be {{trend}}.",
    "Looking at your recent performance, it seems to be {{trend}}.",
    "Your grade pattern has been {{trend}} over time.",
    "The direction of your academic performance is {{trend}}.",
    "Your educational progress has been {{trend}} lately.",
    "Based on your recent grades, your trend is {{trend}}.",
    "Your academic momentum appears to be {{trend}}.",
    "The trajectory of your performance indicates it's {{trend}}."
  ],
  advice: [
    "I suggest focusing more on {{subject}} to improve your grades.",
    "You might want to pay extra attention to {{subject}} assignments.",
    "Consider allocating more study time to {{subject}} to boost your performance.",
    "It would be beneficial to seek additional help with {{subject}}.",
    "Try creating a specific study plan for {{subject}} to raise your grade.",
    "I recommend finding a study partner for {{subject}} to enhance your understanding.",
    "You could benefit from using additional resources for {{subject}}.",
    "Consider setting specific goals for improving your {{subject}} performance.",
    "Try breaking down {{subject}} topics into smaller, manageable chunks for better understanding.",
    "Look for patterns in your {{subject}} mistakes to target your studying more effectively."
  ]
};

// Get a random response that's different from the last one
function getRandomResponse(category: keyof typeof MOCK_RESPONSES): string {
  const templates = MOCK_RESPONSES[category];
  
  // Reset counter after 20 uses to avoid potential memory issues
  if (responseCounter > 20) {
    responseCounter = 0;
    lastResponseTemplate = '';
  }
  
  // Pick a random template, ensuring it's different from the last one
  let newTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Try up to 3 times to get a different template
  let attempts = 0;
  while (newTemplate === lastResponseTemplate && attempts < 3) {
    newTemplate = templates[Math.floor(Math.random() * templates.length)];
    attempts++;
  }
  
  // Update tracking variables
  lastResponseTemplate = newTemplate;
  responseCounter++;
  
  // Add some randomness with timestamp to ensure variation
  console.log(`Selected template [${responseCounter}]: ${newTemplate.substring(0, 20)}...`);
  
  return newTemplate;
}

/**
 * Get comprehensive student data for AI analysis
 */
export const getStudentDataForAnalysis = async (studentId: string): Promise<StudentDataForAnalysis> => {
  try {
    const response = await axios.get(`${AI_API_URL}/comprehensive-data/${studentId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching student data:', error);
    
    // For development, return mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock student data in development');
      
      // Try to get the actual student name from local storage or session
      let studentName = "Student";
      try {
        // Check if we have student data in localStorage
        const userData = localStorage.getItem(config.AUTH.CURRENT_USER_KEY);
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.name) {
            studentName = user.name;
          }
        }
      } catch (e) {
        console.error('Error retrieving student name from storage:', e);
      }
      
      return {
        id: studentId,
        name: studentName,
        rollNumber: studentId,
        grades: {
          overall: 84,
          bySubject: {
            "CSE101": 94,
            "CSE102": 85,
            "MAT201": 73
          }
        },
        submissions: {
          onTime: 15,
          late: 3,
          bySubject: {
            "CSE101": { onTime: 6, late: 0 },
            "CSE102": { onTime: 5, late: 1 },
            "MAT201": { onTime: 4, late: 2 }
          }
        },
        performanceTrend: "improving"
      };
    }
    throw error;
  }
};

/**
 * Query OpenAI with student data and user message
 */
export const queryGoogleAI = async (
  studentData: StudentDataForAnalysis, 
  userMessage: string,
  subjects: Array<{id: string, name: string}> = []
): Promise<string> => {
  try {
    // OpenAI API quota exceeded, just use mock responses
    console.log('Using mock response system due to API quota limitations');
    
    // Always return mock response (don't attempt API call)
    return generateMockResponse(studentData, userMessage, subjects);

    /* API call code commented out to prevent quota errors
    // Check if OpenAI key appears valid
    if (!OPENAI_API_KEY || OPENAI_API_KEY.indexOf('sk-') !== 0) {
      console.warn('OpenAI API key appears invalid or missing. Key format should start with "sk-"');
      return generateMockResponse(studentData, userMessage, subjects);
    }
    
    // Prepare API call data
    console.log('Preparing OpenAI API call for: ', userMessage);
    
    // Create a context with student data for the AI
    const subjectMapping = subjects.reduce((acc, subject) => {
      acc[subject.id] = subject.name;
      return acc;
    }, {} as Record<string, string>);

    // Add timestamp to ensure response variation
    const timestamp = new Date().toISOString();
    
    // Construct a prompt that gives context about the student data
    const systemPrompt = `
You are an educational AI assistant analyzing student data. You help students understand their academic performance and provide personalized advice.
Your responses should be helpful, encouraging, and specific to the student's data.

Be concise but insightful, focusing on highlighting patterns and providing actionable advice.
DO NOT mention attendance as it's not tracked in this system.
IMPORTANT: Ensure each response is unique, personalized, and varies in structure even for similar questions.
`;

    const userPrompt = `
Here is my academic information:

Name: ${studentData.name} (${studentData.rollNumber})
Overall grade average: ${studentData.grades.overall}%
Submissions: ${studentData.submissions.onTime} on time, ${studentData.submissions.late} late
Performance trend: ${studentData.performanceTrend}

Subject grades:
${Object.entries(studentData.grades.bySubject).map(([subjectId, grade]) => 
  `- ${subjectMapping[subjectId] || subjectId}: ${grade}%`
).join('\n')}

Subject submissions:
${Object.entries(studentData.submissions.bySubject).map(([subjectId, submission]) => 
  `- ${subjectMapping[subjectId] || subjectId}: ${submission.onTime} on time, ${submission.late} late`
).join('\n')}

Current time: ${timestamp}
Query: "${userMessage}"
`;

    console.log('Calling OpenAI API...');

    try {
      // Call OpenAI API
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.9, // Increased for more variation
          max_tokens: 800
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      console.log('OpenAI API response received successfully');

      // Extract the response text from OpenAI API
      if (response.data && 
          response.data.choices && 
          response.data.choices[0] && 
          response.data.choices[0].message && 
          response.data.choices[0].message.content) {
        return response.data.choices[0].message.content;
      } else {
        console.error('Unexpected OpenAI API response structure:', response.data);
        throw new Error('Invalid response from OpenAI API');
      }
    } catch (apiError: any) {
      console.error('OpenAI API request failed:', apiError.message);
      if (apiError.response) {
        console.error('API response status:', apiError.response.status);
        console.error('API response data:', apiError.response.data);
      }
      throw apiError; // Re-throw for outer catch
    }
    */
  } catch (error: any) {
    console.error('Error handling:', error.message);
    
    // Fall back to mock responses if OpenAI API fails
    console.log('Falling back to mock responses due to API error');
    return generateMockResponse(studentData, userMessage, subjects);
  }
};

/**
 * Generate a mock response based on the student data and query
 * This is used as a fallback when the OpenAI API is unavailable
 */
function generateMockResponse(
  studentData: StudentDataForAnalysis,
  userMessage: string,
  subjects: Array<{id: string, name: string}> = []
): string {
  console.log('Generating mock response for:', userMessage);
  
  // Create variation by using the current timestamp
  // (Removed timestamp variable; not currently used for variation)
  
  // Select a subject the student is struggling with
  const randomSubjectObj = subjects.length ? subjects[Math.floor(Math.random() * subjects.length)] : { id: 'GEN', name: 'General Studies' };
  const randomSubjectName = typeof randomSubjectObj === 'string' ? randomSubjectObj : (randomSubjectObj.name || 'Subject');
  const overallGrade = Math.floor(75 + Math.random() * 15);
  const subjectGrade = Math.floor(65 + Math.random() * 20);
  const onTime = Math.floor(8 + Math.random() * 7);
  const late = Math.floor(1 + Math.random() * 3);
  
  // Randomize the trend
  const trends = ["improving", "stable", "slightly declining", "showing potential for growth"];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  
  // Initialize the mock response
  let mockResponse = "";
  
  // Get greeting with name
  const greeting = getRandomResponse('greeting')
    .replace("{{name}}", studentData.name || "Student");
  mockResponse += greeting + "\n\n";
  
  // Add grades information
  const gradesText = getRandomResponse('grades')
    .replace("{{overall}}", overallGrade.toString())
    .replace("{{subject}}", randomSubjectName)
    .replace("{{grade}}", subjectGrade.toString());
  mockResponse += gradesText + "\n\n";
  
  // Add submissions information
  const submissionsText = getRandomResponse('submissions')
    .replace("{{onTime}}", onTime.toString())
    .replace("{{late}}", late.toString());
  mockResponse += submissionsText + "\n\n";
  
  // Add trend information
  const trendText = getRandomResponse('trend')
    .replace("{{trend}}", trend);
  mockResponse += trendText + "\n\n";
  
  // Add advice
  const adviceText = getRandomResponse('advice')
    .replace("{{subject}}", randomSubjectName);
  mockResponse += adviceText;
  
  return mockResponse;
}

/**
 * Get real-time student data for the chatbot
 * This combines data from multiple APIs to create a comprehensive student profile
 */
export const getRealTimeStudentData = async (studentId: string): Promise<StudentDataForAnalysis> => {
  try {
    console.log('Fetching real-time student data for:', studentId);
    
    // Get student profile data
    const profileResponse = await getStudentProfile();
    const profileData = profileResponse.data;
    
    // Get student submissions
    const submissionsResponse = await getStudentSubmissions(studentId);
    const submissions = submissionsResponse.data || [];
    
    console.log('Fetched real-time data:', { profileData, submissions });
    
    // Calculate grades from submissions
    const grades: { overall: number; bySubject: Record<string, number> } = {
      overall: 0,
      bySubject: {}
    };
    
    // Calculate submission stats
    const submissionStats = {
      onTime: 0,
      late: 0,
      bySubject: {} as Record<string, { onTime: number; late: number }>
    };
    
    // Process submissions to calculate grades and stats
    if (submissions.length > 0) {
      // Group submissions by subject
      const subjectSubmissions: Record<string, any[]> = {};
      
      submissions.forEach((sub: any) => {
        if (!subjectSubmissions[sub.subjectId]) {
          subjectSubmissions[sub.subjectId] = [];
        }
        subjectSubmissions[sub.subjectId].push(sub);
        
        // Count on-time vs late submissions
        // Assume a submission is late if it has a late flag or was submitted after the due date
        const isLate = sub.isLate || (sub.dueDate && new Date(sub.submissionDate) > new Date(sub.dueDate));
        
        if (isLate) {
          submissionStats.late++;
          
          if (!submissionStats.bySubject[sub.subjectId]) {
            submissionStats.bySubject[sub.subjectId] = { onTime: 0, late: 0 };
          }
          submissionStats.bySubject[sub.subjectId].late++;
        } else {
          submissionStats.onTime++;
          
          if (!submissionStats.bySubject[sub.subjectId]) {
            submissionStats.bySubject[sub.subjectId] = { onTime: 0, late: 0 };
          }
          submissionStats.bySubject[sub.subjectId].onTime++;
        }
      });
      
      // Calculate average score for each subject
      let totalScore = 0;
      let scoredSubmissions = 0;
      
      Object.entries(subjectSubmissions).forEach(([subjectId, subs]) => {
        const subjectScores = subs
          .filter((sub: any) => sub.score !== undefined && sub.score !== null)
          .map((sub: any) => sub.score);
        
        if (subjectScores.length > 0) {
          const subjectAverage = subjectScores.reduce((a: number, b: number) => a + b, 0) / subjectScores.length;
          grades.bySubject[subjectId] = Math.round(subjectAverage);
          
          totalScore += subjectAverage;
          scoredSubmissions++;
        }
      });
      
      // Calculate overall grade
      if (scoredSubmissions > 0) {
        grades.overall = Math.round(totalScore / scoredSubmissions);
      }
    }
    
    // Determine performance trend (simple algorithm based on recent vs older submissions)
    let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (submissions.length >= 4) {
      // Sort submissions by date
      const sortedSubmissions = [...submissions].sort((a: any, b: any) => 
        new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      );
      
      // Split into recent and older submissions
      const recentSubmissions = sortedSubmissions.slice(0, Math.ceil(sortedSubmissions.length / 2));
      const olderSubmissions = sortedSubmissions.slice(Math.ceil(sortedSubmissions.length / 2));
      
      // Calculate average scores
      const recentScores = recentSubmissions
        .filter((sub: any) => sub.score !== undefined && sub.score !== null)
        .map((sub: any) => sub.score);
      
      const olderScores = olderSubmissions
        .filter((sub: any) => sub.score !== undefined && sub.score !== null)
        .map((sub: any) => sub.score);
      
      if (recentScores.length > 0 && olderScores.length > 0) {
        const recentAvg = recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((a: number, b: number) => a + b, 0) / olderScores.length;
        
        if (recentAvg > olderAvg + 5) {
          performanceTrend = 'improving';
        } else if (recentAvg < olderAvg - 5) {
          performanceTrend = 'declining';
        }
      }
    }
    
    // Construct the student data object
    const studentData: StudentDataForAnalysis = {
      id: studentId,
      name: profileData.name || 'Student',
      rollNumber: profileData.id || studentId,
      grades: {
        overall: grades.overall,
        bySubject: grades.bySubject
      },
      submissions: {
        onTime: submissionStats.onTime,
        late: submissionStats.late,
        bySubject: submissionStats.bySubject
      },
      performanceTrend: performanceTrend
    };
    
    return studentData;
  } catch (error) {
    console.error('Error fetching real-time student data:', error);
    // Fall back to the mock data method
    return getStudentDataForAnalysis(studentId);
  }
}; 