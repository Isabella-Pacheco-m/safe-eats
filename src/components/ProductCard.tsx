import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '../types';

interface Props {
  product: Product;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const analysisLines = product.analysis.split('\n');
  const previewLines = analysisLines.slice(0, 2);
  const remainingLines = analysisLines.slice(2);
  const hasMoreContent = remainingLines.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.imageUrl} 
        alt={`${product.name} by ${product.brand}`}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">{product.brand}</p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {product.allergens.map((allergen, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
            >
              {allergen}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Analysis Summary:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            {previewLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            {isExpanded && remainingLines.map((line, index) => (
              <p key={`expanded-${index}`}>{line}</p>
            ))}
          </div>
          {hasMoreContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onDelete(product.id)}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}