import React from 'react';
import * as icons from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, items }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <nav className="space-y-2">
          {items.map((item) => {
            const IconComponent = icons[item.icon];
            return (
              <button
                key={item.name}
                onClick={() => setActiveSection(item.name)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.name
                    ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;