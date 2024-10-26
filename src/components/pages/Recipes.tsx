import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import type { Recipe } from '../../types';

const ALLERGEN_FILTERS = [
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'nut-free', label: 'Nut-free' },
  { id: 'soy-free', label: 'Soy-free' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'egg-free', label: 'Egg-free' }
] as const;

export default function Recipes() {
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  React.useEffect(() => {
    const storedRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    setRecipes(storedRecipes);
  }, []);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleDelete = (id: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    
    if (selectedFilters.length === 0) return true;

    return selectedFilters.every(filter => {
      const allergen = filter.replace('-free', '').toLowerCase();
      return !recipe.allergens.some(a => a.toLowerCase().includes(allergen));
    });
  });

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Recipes</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center mr-2">
              Filter by:
            </span>
            {ALLERGEN_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFilters.includes(filter.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {recipes.length === 0
                ? 'No recipes added yet.'
                : 'No recipes match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{recipe.name}</h3>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">{recipe.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.amount} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recipe.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}