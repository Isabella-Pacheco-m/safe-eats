import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../ProductCard';
import type { Product } from '../../types';

const ALLERGEN_FILTERS = [
  { id: 'dairy-free', label: 'Dairy-free', allergen: ['milk', 'dairy'] },
  { id: 'nut-free', label: 'Nut-free', allergen: ['tree nuts', 'peanuts'] },
  { id: 'soy-free', label: 'Soy-free', allergen: ['soy'] },
  { id: 'gluten-free', label: 'Gluten-free', allergen: ['wheat', 'gluten'] },
  { id: 'egg-free', label: 'Egg-free', allergen: ['eggs'] }
] as const;

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);

  React.useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(storedProducts);
  }, []);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    
    if (selectedFilters.length === 0) return true;

    return selectedFilters.every(filter => {
      const allergenFilter = ALLERGEN_FILTERS.find(af => af.id === filter);
      if (!allergenFilter) return true;
      
      // Check if any of the product's allergens match any of the filter's allergens
      return !product.allergens.some(productAllergen => 
        allergenFilter.allergen.some(filterAllergen => 
          productAllergen.toLowerCase().includes(filterAllergen)
        )
      );
    });
  });

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Products</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
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
            {ALLERGEN_FILTERS.map(allergen => (
              <button
                key={allergen.id}
                onClick={() => toggleFilter(allergen.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFilters.includes(allergen.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {allergen.label}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {products.length === 0
                ? 'No products added yet.'
                : 'No products match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}