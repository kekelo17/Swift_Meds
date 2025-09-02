import React from 'react';
import * as icons from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, items }) => {
  return (
    <div className="sidebar h-full">
      <div className="sidebar-content p-4">
        <nav className="space-y-1">
          {items.map((item) => {
            const IconComponent = icons[item.icon];
            const isActive = activeSection === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-green-100 text-green-700 border-r-4 border-green-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className={`h-5 w-5 mr-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Optional sidebar footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
            <span className="text-xs text-gray-500">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;