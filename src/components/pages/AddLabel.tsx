import React from 'react';
import AllergenInput from '../AllergenInput';
import ImageUploader from '../ImageUploader';
import { UserPreferences, Product } from '../../types';
import { analyzeIngredients, analyzeCommonAllergens } from '../../utils/gemini';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AddLabel() {
  const [preferences, setPreferences] = React.useState<UserPreferences>({
    allergies: [],
    dietaryRestrictions: []
  });
  const [currentImage, setCurrentImage] = React.useState<{ url: string; text: string } | null>(null);
  const [showProductForm, setShowProductForm] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({ name: '', brand: '' });
  const [analysis, setAnalysis] = React.useState<{ text: string; isSafe: boolean } | null>(null);
  const [allergenAnalysis, setAllergenAnalysis] = React.useState<{ allergens: string[]; analysis: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleTextExtracted = async (text: string, imageUrl: string) => {
    setCurrentImage({ url: imageUrl, text });
    setIsAnalyzing(true);
    
    try {
      const [analysisResult, allergenResult] = await Promise.all([
        analyzeIngredients(text, preferences.allergies, preferences.dietaryRestrictions),
        analyzeCommonAllergens(text)
      ]);
      
      setAnalysis(analysisResult);
      setAllergenAnalysis(allergenResult);
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Failed to analyze ingredients. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setShowProductForm(true);
    }
  };

  const handleProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentImage || !newProduct.name || !newProduct.brand || !analysis || !allergenAnalysis) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      brand: newProduct.brand,
      imageUrl: currentImage.url,
      extractedText: currentImage.text,
      analysis: analysis.text,
      isSafe: analysis.isSafe,
      allergens: allergenAnalysis.allergens,
      allergenAnalysis: allergenAnalysis.analysis,
      dateAdded: new Date().toISOString()
    };

    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    localStorage.setItem('products', JSON.stringify([product, ...existingProducts]));

    setCurrentImage(null);
    setShowProductForm(false);
    setNewProduct({ name: '', brand: '' });
    setAnalysis(null);
    setAllergenAnalysis(null);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Your Preferences</h2>
        <AllergenInput
          preferences={preferences}
          setPreferences={setPreferences}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-6">Upload Product Label</h3>
        <ImageUploader onTextExtracted={handleTextExtracted} />
      </div>

      {isAnalyzing && (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">Analyzing ingredients...</span>
        </div>
      )}

      {analysis && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            {analysis.isSafe ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <h3 className="text-xl font-semibold">Safety Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none">
            {analysis.text.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {allergenAnalysis && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Common Allergens Found</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {allergenAnalysis.allergens.map((allergen, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {allergen}
              </span>
            ))}
          </div>
          <div className="prose prose-sm max-w-none">
            {allergenAnalysis.analysis.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {showProductForm && currentImage && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Save Product</h3>
          <form onSubmit={handleProductSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={e => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setCurrentImage(null);
                  setNewProduct({ name: '', brand: '' });
                  setAnalysis(null);
                  setAllergenAnalysis(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}