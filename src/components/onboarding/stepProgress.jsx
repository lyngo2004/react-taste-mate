import React from "react";
import '../../pages/onboarding/onboarding.css'

const StepProgress = ({ total, current }) => {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="step-progress">
      <div className="step-line" />

      <div className="step-dots">
        {steps.map((step) => {
          let status = "upcoming";
          if (step < current) status = "completed";
          if (step === current) status = "active";

          return (
            <div key={step} className={`dot dot-${status}`} />
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;

