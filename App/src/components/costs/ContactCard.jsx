import React from 'react';
import { Check } from 'lucide-react';

const ContactCard = ({ person, isSelected, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(person)}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'shadow-md border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${person.color} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
          {person.avatar}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{person.name}</h3>
          <p className="text-gray-600">{person.phone}</p>
        </div>
        {isSelected && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
            <Check className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
