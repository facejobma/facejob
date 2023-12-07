// NextStepCandidat.tsx
import { useState } from 'react';

const NextStepSignupCandidat = ({ handleNextStep, onSkip }: any) => {
  const [additionalInfo, setAdditionalInfo] = useState('');

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4">
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
        Additional Information (Optional)
      </h2>
      <textarea
        placeholder="Tell us more about yourself..."
        value={additionalInfo}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        className="px-4 py-2 rounded border border-gray w-96 h-32"
      />
      <div className="flex space-x-2 my-4">
        <button
          onClick={() => handleNextStep(additionalInfo)}
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-primary"
        >
          Next
        </button>
        <button
          onClick={() => onSkip()}
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-gray-400"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default NextStepSignupCandidat;
