import React, { useState } from 'react';

const ReservationForm = ({ 
  selectedItem, 
  onSubmit, 
  onCancel, 
  pharmacies = [],
  isAdmin = false 
}) => {
  const [formData, setFormData] = useState(
    selectedItem ? {
      name: selectedItem.patientName,
      medication: selectedItem.medication,
      quantity: selectedItem.quantity.toString(),
      pharmacy: selectedItem.pharmacy,
      status: selectedItem.status
    } : {
      name: '',
      medication: '',
      quantity: '',
      pharmacy: '',
      status: 'pending'
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity)
    });
  };

  return (
    <div className="form-card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {selectedItem ? 'Edit Reservation' : 'New Reservation'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medication
          </label>
          <input
            type="text"
            value={formData.medication}
            onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pharmacy
          </label>
          <select
            value={formData.pharmacy}
            onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          >
            <option value="">Select Pharmacy</option>
            {pharmacies.map(pharmacy => (
              <option key={pharmacy.id} value={pharmacy.name}>
                {pharmacy.name}
              </option>
            ))}
          </select>
        </div>
        
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {selectedItem ? 'Update' : 'Create'}
          </button>
          
          {selectedItem && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;