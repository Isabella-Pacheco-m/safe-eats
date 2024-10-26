import React from 'react';
import { X } from 'lucide-react';
import type { AllergenData } from '../types';

interface Props {
  allergens: AllergenData[];
  onAllergenToggle: (index: number) => void;
  onAllergenAdd: (allergen: string) => void;
}

export default function AllergenSelector({ allergens, onAllergenToggle, onAllergenAdd }: Props) {
  const [newAllergen, setNewAllergen] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergen.trim()) {
      onAllergenAdd(newAllergen.trim());
      setNewAllergen('');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Allergens & Restrictions</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newAllergen}
          onChange={(e) => setNewAllergen(e.target.value)}
          placeholder="Add new allergen..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {allergens.map((allergen, index) => (
          <button
            key={allergen.name}
            onClick={() => onAllergenToggle(index)}
            className={`px-3 py-1 rounded-full flex items-center gap-2 ${
              allergen.isSelected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {allergen.name}
            <X className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}