import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Edit, Send } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getPaymentStatusColor } from '../../utils/helpers';

const OneTimeCosts = ({ oneTimeCosts }) => {
  const navigate = useNavigate();
  const { participants } = useData();

  if (oneTimeCosts.length === 0) return null;

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'overdue': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">One-Time Shared Costs</h2>
        <p className="text-sm text-gray-600 mt-1">Recent expenses and their payment status</p>
      </div>
      <div className="divide-y">
        {oneTimeCosts.map(cost => {
          const paidCount = cost.participants.filter(p => p.status === 'paid').length;
          const pendingCount = cost.participants.filter(p => p.status === 'pending').length;
          const overdueCount = cost.participants.filter(p => p.status === 'overdue').length;
          
          return (
            <div key={cost.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{cost.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      One-time
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    ${cost.amount} • {cost.participants.length} participants • Created: {cost.createdAt}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-2">
                    {paidCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        {paidCount} paid
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-yellow-600">
                        <Clock className="w-3 h-3" />
                        {pendingCount} pending
                      </span>
                    )}
                    {overdueCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <XCircle className="w-3 h-3" />
                        {overdueCount} overdue
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {cost.participants.map(participant => {
                      const user = participants.find(u => u.id === participant.userId);
                      return (
                        <div key={participant.userId} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(participant.status)}`}>
                          {getPaymentStatusIcon(participant.status)}
                          <span>{user?.name}</span>
                          {participant.paidAt && (
                            <span className="text-xs opacity-75">({participant.paidAt})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/costs/edit/${cost.id}`)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/costs/requests/${cost.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Requests
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OneTimeCosts;