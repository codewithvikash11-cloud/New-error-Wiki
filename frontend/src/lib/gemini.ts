import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateSolution(errorText: string, context?: string) {
    const prompt = `
You are an expert technical writer for Synta.
I am providing an error title and its context. 
Your task is to write a professional, 100% unique, and SEO-friendly article for this error.

Error Title: "${errorText}"
Context/Description: "${context || 'No additional context provided.'}"

Article Requirements:
- A clear heading: 'How to fix ${errorText}'
- A 'What is it?' section explaining the cause.
- A 'Step-by-step Solution' section using bullet points.
- The tone must be authoritative and helpful for developers. Do not include conversational filler text.

Respond ONLY with a raw JSON object and nothing else. The JSON must have exactly this structure:
{
  "errorCode": "Extract or infer an alphanumeric error code from the title/context (e.g. 404, HY000). Use 'N/A' if none can be found.",
  "explanation": "A concise explanation of the cause of the error",
  "solution": "The fully formatted article content adhering to the required structure."
}
`;

    const response = await model.generateContent(prompt);
    let responseText = response.response.text();
    
    // Clean up potentially wrapped markdown blocks from AI response
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
        return JSON.parse(responseText);
    } catch (err) {
        console.warn('⚠️ Failed to parse AI JSON response. Returning raw text as fallback.');
        return {
            errorCode: 'N/A',
            explanation: 'N/A',
            solution: responseText
        };
    }
}
