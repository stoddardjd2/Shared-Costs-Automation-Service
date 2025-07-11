import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, XCircle, UserPlus, Users, Calculator } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const NewCost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { participants, addCost, addParticipant, costs, updateCost } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    isRecurring: false,
    frequency: 'monthly',
    plaidMatch: '',
    splitType: 'equal',
    customSplits: {}
  });
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });

  // Load existing cost for editing
  useEffect(() => {
    if (id) {
      const cost = costs.find(c => c.id === parseInt(id));
      if (cost) {
        setFormData({
          name: cost.name,
          amount: cost.amount.toString(),
          isRecurring: cost.isRecurring,
          frequency: cost.frequency || 'monthly',
          plaidMatch: cost.plaidMatch || '',
          splitType: cost.splitType || 'equal',
          customSplits: cost.customSplits || {}
        });
        setSelectedUsers(cost.participants.map(p => p.userId));
      }
    }
  }, [id, costs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const costParticipants = selectedUsers.map(userId => ({
      userId,
      status: 'pending'
    }));

    const costData = {
      ...formData,
      amount: parseFloat(formData.amount),
      participants: costParticipants,
      nextDue: formData.isRecurring ? (() => {
        const nextDue = new Date();
        switch (formData.frequency) {
          case 'weekly':
            nextDue.setDate(nextDue.getDate() + 7);
            break;
          case 'monthly':
            nextDue.setMonth(nextDue.getMonth() + 1);
            break;
          case 'quarterly':
            nextDue.setMonth(nextDue.getMonth() + 3);
            break;
          case 'yearly':
            nextDue.setFullYear(nextDue.getFullYear() + 1);
            break;
        }
        return nextDue.toISOString().split('T')[0];
      })() : undefined
    };

    if (id) {
      updateCost(parseInt(id), costData);
    } else {
      addCost(costData);
    }
    
    navigate('/dashboard');
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (newParticipant.name && newParticipant.email) {
      const participant = addParticipant(newParticipant);
      setSelectedUsers(prev => [...prev, participant.id]);
      setNewParticipant({ name: '', email: '' });
      setShowAddParticipant(false);
      setSearchTerm('');
    }
  };

  const calculateSplit = () => {
    if (formData.splitType === 'equal' && selectedUsers.length > 0) {
      const perPerson = parseFloat(formData.amount) / selectedUsers.length;
      return perPerson.toFixed(2);
    }
    return '0.00';
  };

  const calculateCustomTotal = () => {
    return Object.values(formData.customSplits).reduce((sum, amount) => sum + (amount || 0), 0).toFixed(2);
  };

  const filteredParticipants = participants.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleParticipants = searchTerm ? filteredParticipants : participants.slice(0, 5);

  const isEditing = !!id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Cost' : 'Add New Cost'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Netflix Subscription"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plaid Match Pattern
            </label>
            <input
              type="text"
              value={formData.plaidMatch}
              onChange={(e) => setFormData({...formData, plaidMatch: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Netflix, Spotify, Electric Company"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pattern to match in bank statements for automatic detection
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Recurring cost
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Participants *
            </label>

            {participants.length > 0 && (
              <div>
                <input
                  type="text"
                  placeholder="Search participants by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {participants.length > 5 && !searchTerm && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing first 5 of {participants.length} participants. Use search to find others.
                  </p>
                )}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected ({selectedUsers.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const user = participants.find(u => u.id === userId);
                    return (
                      <div
                        key={userId}
                        className="flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-lg px-3 py-2"
                      >
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {user?.avatar}
                        </div>
                        <span className="text-sm font-medium text-blue-900">{user?.name}</span>
                        <button
                          type="button"
                          onClick={() => handleUserToggle(userId)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {participants.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Available Participants
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {visibleParticipants
                    .filter(user => !selectedUsers.includes(user.id))
                    .map(user => (
                      <div
                        key={user.id}
                        className="p-3 border border-gray-300 rounded-lg cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {user.avatar}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
                
                {searchTerm && filteredParticipants.filter(u => !selectedUsers.includes(u.id)).length === 0 && (
                  <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mt-3">
                    <p className="mb-2">No participants found matching "{searchTerm}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewParticipant({ name: searchTerm, email: '' });
                        setShowAddParticipant(true);
                        setSearchTerm('');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add "{searchTerm}" as new participant
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Participant</h4>
              
              {!showAddParticipant ? (
                <button
                  type="button"
                  onClick={() => setShowAddParticipant(true)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add New Participant
                </button>
              ) : (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddParticipant(false);
                          setNewParticipant({ name: '', email: '' });
                        }}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddParticipant}
                        disabled={!newParticipant.name || !newParticipant.email}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add & Select
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No participants available.</p>
                <p className="text-sm">Use "Add New Participant" below to get started.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Split Type
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="equal"
                  name="splitType"
                  value="equal"
                  checked={formData.splitType === 'equal'}
                  onChange={(e) => setFormData({...formData, splitType: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="equal" className="text-sm font-medium text-gray-700">
                  Equal split
                </label>
                {formData.splitType === 'equal' && selectedUsers.length > 0 && (
                  <span className="text-sm text-gray-600">
                    (${calculateSplit()} per person)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="custom"
                  name="splitType"
                  value="custom"
                  checked={formData.splitType === 'custom'}
                  onChange={(e) => setFormData({...formData, splitType: e.target.value})}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="custom" className="text-sm font-medium text-gray-700">
                  Custom amounts
                </label>
              </div>
            </div>
          </div>

          {formData.splitType === 'custom' && selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Custom Amounts
              </label>
              <div className="space-y-2">
                {selectedUsers.map(userId => {
                  const user = participants.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {user?.avatar}
                      </div>
                      <span className="w-32 text-sm text-gray-700">{user?.name}</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.customSplits[userId] || ''}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const customSplits = { ...formData.customSplits };
                          customSplits[userId] = parseFloat(e.target.value) || 0;
                          setFormData({...formData, customSplits});
                        }}
                      />
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total custom splits:</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    parseFloat(calculateCustomTotal()) === parseFloat(formData.amount) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ${calculateCustomTotal()} / ${formData.amount || '0.00'}
                  </span>
                </div>
                {parseFloat(calculateCustomTotal()) !== parseFloat(formData.amount) && formData.amount && (
                  <p className="text-xs text-red-600 mt-1">
                    Custom splits must equal the total amount
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.name || 
                !formData.amount || 
                selectedUsers.length === 0 ||
                (formData.splitType === 'custom' && parseFloat(calculateCustomTotal()) !== parseFloat(formData.amount))
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'Update' : 'Create'} Cost ({selectedUsers.length} participant{selectedUsers.length !== 1 ? 's' : ''})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCost;
