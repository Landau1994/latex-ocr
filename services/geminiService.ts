import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const convertImagesToLatex = async (
  base64Images: string[],
  preamble: string,
  translateToChinese: boolean,
  preservedTermsStr: string,
  modelName: string = 'gemini-3-pro-preview' // Default model
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    if (base64Images.length === 0) {
      throw new Error("No images provided.");
    }

    // Construct image parts for the API
    const imageParts = base64Images.map((base64) => {
      // Remove header from base64 string if present
      const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      return {
        inlineData: {
          mimeType: 'image/png', // Using PNG as generic container for the base64 data
          data: cleanBase64
        }
      };
    });

    // Format preserved terms for the prompt
    const formattedTerms = preservedTermsStr
      .split(/[,，]/) // Split by English or Chinese comma
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => `"${t}"`) // Quote them
      .join(', ');

    const translationInstruction = translateToChinese
      ? `
    7. **TRANSLATION REQUIRED**: The source text in the images is English. You MUST translate all explanatory text into formal Simplified Chinese (简体中文).
       - **Keep all mathematical formulas, variables, and symbols exactly as they are** (e.g., do not translate variable "x" to a Chinese character).
       - **PROPER NAMES**: Do NOT translate foreign people's names. Keep them in English (e.g., write "James Arthur" not "詹姆斯·亚瑟"; "Riemann" not "黎曼" unless it is a standard term like "Riemann Hypothesis").
       - **SPECIFIC TERMINOLOGY**: Do NOT translate specific mathematical terms that are listed here: **${formattedTerms || 'None provided'}**. Keep them in English.
       - Translate other standard mathematical terms accurately (e.g., "Let" -> "令", "Suppose" -> "假设", "Where" -> "其中").
       - **TITLES & HEADERS**: For any section titles, chapter titles, or named theorems, **KEEP the original English title and append it to the Chinese translation**.
         - Format: "Chinese Translation (Original English Text)"
         - Example: \\section{导论 (Introduction)}
         - Example: \\begin{theorem}[均值定理 (Mean Value Theorem)]
       - Ensure the LaTeX structure respects the user's preamble (e.g., use the defined theorem environments).
       - Do not translate the content inside \\cite{}, \\ref{}, or strict code blocks unless it's natural language.`
      : `
    7. **Transcription Only**: Transcribe the text exactly as it appears in the images. Do not translate it.`;

    const prompt = `
    Task: Convert the mathematical content and text in the attached ${base64Images.length} image(s) into a SINGLE LaTeX output.
    
    Context: The output must be strictly compatible with the following LaTeX preamble/template provided by the user. 
    You must use the specific environments (like 'theorem', 'identity'), macros, and packages defined in this preamble.
    
    User Preamble:
    \`\`\`latex
    ${preamble}
    \`\`\`
    
    Instructions:
    1. Process the images **strictly in the order they are provided**.
    2. Merge the content from all images into one continuous LaTeX body. Do NOT create separate sections unless the text implies it.
    3. Output ONLY the raw LaTeX body content.
    4. Do NOT include the preamble, \\begin{document}, or \\end{document} tags.
    5. Do NOT wrap the output in markdown code blocks.
    6. If an image contains a theorem or identity, use the \\begin{theorem} or \\begin{identity} environments as defined in the preamble.
    7. Ensure high accuracy for complex mathematical formulas.
    ${translationInstruction}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: prompt },
          ...imageParts
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return text.trim();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to convert images to LaTeX.");
  }
};