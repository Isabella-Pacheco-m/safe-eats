export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  extractedText: string;
  analysis: string;
  isSafe: boolean;
  allergens: string[];
  allergenAnalysis: string;
  dateAdded: string;
}

export interface UserPreferences {
  allergies: string[];
  dietaryRestrictions: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    productId: string | null;
    name: string;
    amount: string;
  }[];
  instructions: string[];
  dateCreated: string;
  allergens: string[];
}

export interface AllergenData {
  name: string;
  isSelected: boolean;
}