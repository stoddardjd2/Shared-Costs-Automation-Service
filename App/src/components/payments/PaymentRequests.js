import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const PaymentRequests = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { participants, costs } = useData();
  
  const [requests, setRequests] = useState([
    {
      id: 1,
      userId: 2,
      amount: 5.33,
      status: 'pending',
      sentAt: '2025-01-15',
      dueDate: '2025-02-15'
    },
    {
      id: 2,
      userId: 3,
      amount: 5.33,
      status: 'paid',
      sentAt: '2025-01-15',
      paidAt: '2025-01-16'
    }
  ]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [requestAmount, setRequestAmount] = useState('');
  const [message, setMessage] = useState('');
  const [dueDate, setDueDate] = useState('');

  // If cost ID is provided, load cost details
  const cost = id ? costs.find(c => c.id === parseInt(id)) : null;

  const sendReminder = (requestId) => {
    alert('Reminder sent!');
  };

  const sendNewRequest = () => {
    if (selectedUsers.length === 0 || !requestAmount) {
      alert('Please select users and enter an amount');
      return;
    }

    const newRequests = selectedUsers.map(userId => ({
      id: Date.now() + userId,
      userId,
      amount: parseFloat(requestAmount),
      status: 'pending',
      sentAt: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      message: message
    }));

    setRequests(prev => [...prev, ...newRequests]);
    setSelectedUsers([]);
    setRequestAmount('');
    setMessage('');
    setDueDate('');
    alert('Payment requests sent!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

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
          Payment Requests
          {cost && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              for {cost.name}
            </span>
          )}
        </h1>
      </div>

      {cost && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{cost.name}</h3>
              <p className="text-blue-700 text-sm">
                ${cost.amount} • {cost.participants.length} participants
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Split Amount</p>
              <p className="text-lg font-bold text-blue-900">
                ${(cost.amount / cost.participants.length).toFixed(2)} per person
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Send New Request</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Recipients
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {participants.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedUsers(prev => 
                      prev.includes(user.id) 
                        ? prev.filter(id => id !== user.id)
                        : [...prev, user.id]
                    );
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {user.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount per person
              </label>
              <input
                type="number"
                step="0.01"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add a note about this payment request..."
            />
          </div>

          <button
            onClick={sendNewRequest}
            disabled={selectedUsers.length === 0 || !requestAmount}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Send Requests to {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Active Requests</h2>
          <p className="text-sm text-gray-600 mt-1">Manage payment requests and reminders</p>
        </div>
        <div className="divide-y">
          {requests.map(request => {
            const user = participants.find(u => u.id === request.userId);
            const isOverdue = request.dueDate && new Date(request.dueDate) < new Date() && request.status === 'pending';
            const actualStatus = isOverdue ? 'overdue' : request.status;
            
            return (
              <div key={request.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {user?.avatar}
                      </div>
                      <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(actualStatus)}`}>
                        {getStatusIcon(actualStatus)}
                        {actualStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      ${request.amount.toFixed(2)} • {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Sent {new Date(request.sentAt).toLocaleDateString()}
                      {request.dueDate && ` • Due ${new Date(request.dueDate).toLocaleDateString()}`}
                      {request.paidAt && ` • Paid ${new Date(request.paidAt).toLocaleDateString()}`}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => sendReminder(request.id)}
                          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          Send Reminder
                        </button>
                        <button
                          onClick={() => {
                            setRequests(prev => prev.map(r => 
                              r.id === request.id 
                                ? {...r, status: 'paid', paidAt: new Date().toISOString().split('T')[0]}
                                : r
                            ));
                          }}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Paid
                        </button>
                      </>
                    )}
                    {request.status === 'paid' && (
                      <span className="text-sm text-green-600 font-medium">✓ Completed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {requests.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No payment requests yet.</p>
              <p className="text-sm">Send your first request above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequests;