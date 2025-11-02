import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateHealthAlert(
  disease: string,
  caseCount: number,
  region: string,
  symptoms: string[]
): Promise<{
  message: string;
  preventiveMeasures: string[];
  severity: string;
}> {
  try {
    const prompt = `You are a public health expert. Generate a health alert for the following disease outbreak:
    
Disease: ${disease}
Case Count: ${caseCount}
Region: ${region}
Common Symptoms: ${symptoms.join(", ")}

Please provide:
1. A clear, concise alert message (2-3 sentences) in simple language suitable for rural populations
2. A list of 4-5 preventive measures
3. Severity assessment (low, medium, high, or critical)

Respond in JSON format with this structure:
{
  "message": "string",
  "preventiveMeasures": ["string"],
  "severity": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a public health expert who communicates in clear, simple language accessible to rural populations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || `${disease} outbreak detected in ${region}. ${caseCount} cases reported.`,
      preventiveMeasures: result.preventiveMeasures || [
        "Maintain good personal hygiene",
        "Drink clean, boiled water",
        "Seek medical attention if symptoms appear",
        "Avoid contact with infected individuals"
      ],
      severity: result.severity || "medium",
    };
  } catch (error) {
    console.error("Error generating health alert:", error);
    // Fallback response
    return {
      message: `Health Alert: ${disease} outbreak detected in ${region}. ${caseCount} cases have been reported. Please take necessary precautions.`,
      preventiveMeasures: [
        "Maintain good personal hygiene",
        "Drink clean, boiled water",
        "Seek medical attention if symptoms appear",
        "Avoid contact with infected individuals"
      ],
      severity: caseCount > 50 ? "high" : caseCount > 20 ? "medium" : "low",
    };
  }
}

export async function generateQuizQuestions(
  disease: string,
  description: string,
  symptoms: string[],
  preventiveMeasures: string[]
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  points: number;
}>> {
  try {
    const prompt = `You are a health education expert. Create 5 quiz questions about ${disease}.

Disease Information:
- Description: ${description}
- Symptoms: ${symptoms.join(", ")}
- Preventive Measures: ${preventiveMeasures.join(", ")}

Create 5 multiple-choice questions:
- 2 easy questions (10 points each)
- 2 medium questions (20 points each)
- 1 hard question (30 points)

Each question should have 4 options with only one correct answer.
Include an explanation for the correct answer.

Respond in JSON format with this structure:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number (0-3),
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "points": number
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a health education expert who creates clear, educational quiz questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
}
