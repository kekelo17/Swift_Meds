import React from 'react';
import * as icons from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, items, darkMode }) => {
  return (
    <div className="sidebar h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const IconComponent = icons[item.icon];
            const isActive = activeSection === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-r-4 border-green-600 dark:border-green-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className={`h-5 w-5 mr-3 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-3 py-2">
            <div className={`h-2 w-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-600'} mr-2`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;