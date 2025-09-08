import React, { useState } from 'react';
import * as icons from 'lucide-react';

const NotificationsDropdown = ({ notifications = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
        <icons.Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 dark:bg-red-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No new notifications</p>
            ) : (
              notifications.map((notif, index) => (
                <div key={index} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;