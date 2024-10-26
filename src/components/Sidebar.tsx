import { ScanLine, Package, UtensilsCrossed, User, X, Plus, ShieldCheck } from 'lucide-react';

type Page = 'add-label' | 'products' | 'recipes' | 'create-recipe' | 'profile';

interface Props {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, onPageChange, isOpen, onClose }: Props) {
  const menuItems = [
    { id: 'add-label', label: 'Scan Label', icon: ScanLine },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'recipes', label: 'Recipes', icon: UtensilsCrossed },
    { id: 'create-recipe', label: 'Create Recipe', icon: Plus },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-gray-800">SafeEats</h1>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isDisabled = item.id === 'profile';
            
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && handlePageChange(item.id as Page)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Stay Safe with SafeEats
            </h3>
            <p className="text-xs text-blue-700">
              Scan products, create recipes, and manage your dietary restrictions with confidence.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}