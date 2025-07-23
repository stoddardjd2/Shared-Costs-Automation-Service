import React from 'react';
import { getStepNumber } from '../../utils/stepUtils';

const StepIndicator = ({ current }) => {
  const totalSteps = 4;
  const currentStepNumber = getStepNumber(current);
  
  return (
    <div className="hidden md:flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all
              ${index + 1 <= currentStepNumber
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'}
            `}>
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${
                index + 1 < currentStepNumber ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;