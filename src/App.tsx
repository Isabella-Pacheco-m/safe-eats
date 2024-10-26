import React from 'react';
import Sidebar from './components/Sidebar';
import AddLabel from './components/pages/AddLabel';
import Products from './components/pages/Products';
import Recipes from './components/pages/Recipes';
import CreateRecipe from './components/pages/CreateRecipe';
import { ShieldCheck } from 'lucide-react';

type Page = 'add-label' | 'products' | 'recipes' | 'create-recipe' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('add-label');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'add-label':
        return <AddLabel />;
      case 'products':
        return <Products />;
      case 'recipes':
        return <Recipes />;
      case 'create-recipe':
        return <CreateRecipe />;
      case 'profile':
        return <div className="p-8">Coming soon...</div>;
      default:
        return <AddLabel />;
    }
  };

  const renderPageBanner = () => {
    const banners = {
      'add-label': {
        title: 'Scan & Analyze',
        description: 'Upload product labels to check for allergens and dietary restrictions',
        gradient: 'from-blue-600 to-blue-800'
      },
      'products': {
        title: 'Your Products',
        description: 'View and manage your scanned products',
        gradient: 'from-purple-600 to-purple-800'
      },
      'recipes': {
        title: 'Recipe Collection',
        description: 'Browse your allergen-safe recipes',
        gradient: 'from-green-600 to-green-800'
      },
      'create-recipe': {
        title: 'Create Recipe',
        description: 'Design new recipes with allergen awareness',
        gradient: 'from-orange-600 to-orange-800'
      },
      'profile': {
        title: 'Profile',
        description: 'Manage your preferences',
        gradient: 'from-gray-600 to-gray-800'
      }
    };

    const banner = banners[currentPage];

    return (
      <div className={`bg-gradient-to-r ${banner.gradient} text-white py-8 px-6 md:px-8`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{banner.title}</h1>
          <p className="text-white/80">{banner.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 overflow-auto">
        {renderPageBanner()}
        <div className="max-w-6xl mx-auto">
          {renderPage()}
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-4 right-4 z-20 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </main>
    </div>
  );
}

export default App;