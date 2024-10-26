import React from 'react';
import { Plus, X, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Recipe, Product } from '../../types';
import { analyzeManualIngredient, generateRecipe, type GeneratedRecipe } from '../../utils/gemini';

export default function CreateRecipe() {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [ingredients, setIngredients] = React.useState<Recipe['ingredients']>([]);
  const [showProductSearch, setShowProductSearch] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [products] = React.useState<Product[]>(() => 
    JSON.parse(localStorage.getItem('products') || '[]')
  );
  const [generatedRecipe, setGeneratedRecipe] = React.useState<GeneratedRecipe | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = (product?: Product) => {
    if (product) {
      setIngredients(prev => [...prev, {
        productId: product.id,
        name: `${product.brand} ${product.name}`,
        amount: ''
      }]);
    } else {
      setIngredients(prev => [...prev, { productId: null, name: '', amount: '' }]);
    }
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const calculateRecipeAllergens = async (): Promise<string[]> => {
    const allAllergens = new Set<string>();
    
    // Analyze product ingredients
    ingredients.forEach(ingredient => {
      if (ingredient.productId) {
        const product = products.find(p => p.id === ingredient.productId);
        if (product) {
          product.allergens.forEach(allergen => allAllergens.add(allergen));
        }
      }
    });

    // Analyze manual ingredients
    const manualIngredientAnalyses = await Promise.all(
      ingredients
        .filter(ingredient => !ingredient.productId && ingredient.name.trim())
        .map(ingredient => analyzeManualIngredient(ingredient.name))
    );

    manualIngredientAnalyses.forEach(allergens => {
      allergens.forEach(allergen => allAllergens.add(allergen));
    });

    return Array.from(allAllergens);
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return;

    setIsGenerating(true);
    try {
      const ingredientList = ingredients.map(i => `${i.amount} ${i.name}`);
      const recipe = await generateRecipe(ingredientList);
      setGeneratedRecipe(recipe);
      
      // Auto-fill form with generated recipe
      setName(recipe.title);
      setDescription(recipe.description);
      setShowInstructions(true);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || ingredients.length === 0) return;

    const allergens = await calculateRecipeAllergens();

    const recipe: Recipe = {
      id: Date.now().toString(),
      name,
      description,
      ingredients,
      dateCreated: new Date().toISOString(),
      allergens,
      instructions: generatedRecipe?.instructions || []
    };

    const existingRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    localStorage.setItem('recipes', JSON.stringify([recipe, ...existingRecipes]));

    // Reset form
    setName('');
    setDescription('');
    setIngredients([]);
    setGeneratedRecipe(null);
    setShowInstructions(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Recipe</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => handleAddIngredient()}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Add Manual
              </button>
              <button
                type="button"
                onClick={() => setShowProductSearch(true)}
                className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>

          {showProductSearch && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <div className="relative mb-4">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddIngredient(product)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div>
                      {product.brand} {product.name}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                {!ingredient.productId && (
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].name = e.target.value;
                      setIngredients(newIngredients);
                    }}
                    placeholder="Ingredient name"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {ingredient.productId && (
                  <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">
                    {ingredient.name}
                  </div>
                )}
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index].amount = e.target.value;
                    setIngredients(newIngredients);
                  }}
                  placeholder="Amount"
                  className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {ingredients.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Generate Recipe from Ingredients
                  </>
                )}
              </button>
            </div>
          )}

          {generatedRecipe && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Generated Recipe</h3>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {showInstructions ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Cooking Time:</strong> {generatedRecipe.cookingTime}</p>
                <p><strong>Servings:</strong> {generatedRecipe.servings}</p>
                {showInstructions && (
                  <div className="mt-2">
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      {generatedRecipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Recipe
          </button>
        </div>
      </form>
    </div>
  );
}