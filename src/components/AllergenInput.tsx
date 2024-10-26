import React from 'react';
import { X } from 'lucide-react';
import type { UserPreferences } from '../types';

interface Props {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

export default function AllergenInput({ preferences, setPreferences }: Props) {
  const [allergyInput, setAllergyInput] = React.useState('');
  const [restrictionInput, setRestrictionInput] = React.useState('');

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (allergyInput.trim()) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleAddRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    if (restrictionInput.trim()) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, restrictionInput.trim()]
      }));
      setRestrictionInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const removeRestriction = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Allergies</h2>
        <form onSubmit={handleAddAllergy} className="flex gap-2 mb-2">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            placeholder="Add allergy..."
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
          {preferences.allergies.map((allergy, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full"
            >
              {allergy}
              <button
                onClick={() => removeAllergy(index)}
                className="hover:text-red-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Dietary Restrictions</h2>
        <form onSubmit={handleAddRestriction} className="flex gap-2 mb-2">
          <input
            type="text"
            value={restrictionInput}
            onChange={(e) => setRestrictionInput(e.target.value)}
            placeholder="Add restriction..."
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
          {preferences.dietaryRestrictions.map((restriction, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full"
            >
              {restriction}
              <button
                onClick={() => removeRestriction(index)}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}