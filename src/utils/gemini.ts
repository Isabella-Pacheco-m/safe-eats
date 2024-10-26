import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const COMMON_ALLERGENS = [
  'milk', 'dairy', 'eggs', 'tree nuts', 'peanuts', 'soy', 
  'wheat', 'gluten', 'fish', 'shellfish', 'sesame', 'sulfites'
] as const;

export type CommonAllergen = typeof COMMON_ALLERGENS[number];

export interface AnalysisResult {
  text: string;
  isSafe: boolean;
}

export interface CommonAllergensResult {
  allergens: CommonAllergen[];
  analysis: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  instructions: string[];
  cookingTime: string;
  servings: number;
}

export async function analyzeIngredients(
  ingredients: string,
  allergies: string[],
  restrictions: string[]
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
Perform a thorough analysis of the provided ingredients to determine product safety based STRICTLY on the specified allergies and dietary restrictions. 

ANALYSIS REQUIREMENTS:
1. Check each ingredient for:
   - Direct presence of restricted substances
   - Common derivatives of restricted substances
   - Industry-standard ingredients that typically contain restricted substances
   - Hidden sources in processed ingredients

2. Consider specific cases such as:
   - Unspecified flour types (assume wheat-based unless explicitly stated as alternative)
   - Compound ingredients (e.g., complex ingredients like chocolate may contain restricted ingredients)
   - Modified ingredients (e.g., modified food starch source)
   - Standard industry formulations

3. Focus ONLY on actual violations of specified restrictions:
   - Analyze ingredients solely against provided allergies/restrictions
   - Ignore potential issues unrelated to user's specifications
   - Do not flag ingredients for restrictions that weren't specified
   - Do not include cross-contamination warnings unless specifically requested

### Input Parameters
Ingredients List:
${ingredients}

User Allergies:
${allergies.join(", ")}

Dietary Restrictions:
${restrictions.join(", ")}

REQUIRED OUTPUT FORMAT:
PRODUCT SAFETY: [SAFE/UNSAFE]
[If UNSAFE, provide only:]
- Brief list of problematic ingredients and short explanation why it violates user's restrictions
- Specific violation of user's restrictions
[Maximum 7 lines total]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const isSafe = text.toLowerCase().includes("safe") && !text.toLowerCase().includes("unsafe");
    return { text, isSafe };
  } catch (error) {
    console.error("Error analyzing ingredients:", error);
    throw new Error("Failed to analyze ingredients");
  }
}

export async function analyzeCommonAllergens(ingredients: string): Promise<CommonAllergensResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze these ingredients and return ONLY the following allergen names if found (exactly as written, comma-separated):
milk, dairy, eggs, tree nuts, peanuts, soy, wheat, gluten, fish, shellfish, sesame, sulfites

First line must contain ONLY the allergen names, nothing else.
Second line onwards: Brief explanation of which ingredients contain these allergens.

Consideration: assume unspecified flour types wheat-based unless explicitly stated as alternative

Ingredients to analyze: ${ingredients}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const lines = text.split('\n');
    const allergenLine = lines[0].toLowerCase();
    
    const allergens = allergenLine
      .split(',')
      .map(a => a.trim())
      .filter((a): a is CommonAllergen => COMMON_ALLERGENS.includes(a as CommonAllergen));

    return {
      allergens,
      analysis: lines.slice(1).join('\n').trim()
    };
  } catch (error) {
    console.error("Error analyzing common allergens:", error);
    throw new Error("Failed to analyze common allergens");
  }
}

export async function analyzeManualIngredient(ingredient: string): Promise<CommonAllergen[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this ingredient and return ONLY the following allergen names if found (exactly as written, comma-separated):
milk, dairy, eggs, tree nuts, peanuts, soy, wheat, gluten, fish, shellfish, sesame, sulfites

Return ONLY the allergen names, nothing else. If no allergens found, return empty.

Ingredient to analyze: ${ingredient}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase();
    
    return text
      .split(',')
      .map(a => a.trim())
      .filter((a): a is CommonAllergen => COMMON_ALLERGENS.includes(a as CommonAllergen));
  } catch (error) {
    console.error("Error analyzing manual ingredient:", error);
    return [];
  }
}

export async function generateRecipe(ingredients: string[]): Promise<GeneratedRecipe> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Create a recipe using some or all of these ingredients:
${ingredients.join('\n')}

Return the recipe in this exact format:
TITLE: [recipe name]
DESCRIPTION: [brief description]
COOKING TIME: [total time]
SERVINGS: [number]
INSTRUCTIONS:
1. [step]
2. [step]
...

Make the recipe practical, delicious, and easy to follow. Use common cooking techniques and temperatures.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const lines = text.split('\n');
    const title = lines.find(l => l.startsWith('TITLE:'))?.replace('TITLE:', '').trim() || '';
    const description = lines.find(l => l.startsWith('DESCRIPTION:'))?.replace('DESCRIPTION:', '').trim() || '';
    const cookingTime = lines.find(l => l.startsWith('COOKING TIME:'))?.replace('COOKING TIME:', '').trim() || '';
    const servings = parseInt(lines.find(l => l.startsWith('SERVINGS:'))?.replace('SERVINGS:', '').trim() || '0');
    
    const instructionsStart = lines.findIndex(l => l.startsWith('INSTRUCTIONS:'));
    const instructions = lines
      .slice(instructionsStart + 1)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);

    return {
      title,
      description,
      cookingTime,
      servings,
      instructions
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe");
  }
}