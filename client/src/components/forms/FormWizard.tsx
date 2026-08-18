import { forwardRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface FormWizardStep {
  id: string;
  title: string;
  description?: string;
  fields: ReactNode;
  validate?: (values: Record<string, unknown>) => boolean | Record<string, string>;
}

interface FormWizardProps {
  steps: FormWizardStep[];
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  initialValues?: Record<string, unknown>;
  className?: string;
}

export function FormWizard({ steps, onSubmit, initialValues = {}, className }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = steps[currentStep];

  const handleNext = async () => {
    if (currentStepData.validate) {
      const validationResult = currentStepData.validate(values);
      if (validationResult !== true) {
        setErrors(validationResult as Record<string, string>);
        return;
      }
    }
    setErrors({});
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (currentStepData.validate) {
      const validationResult = currentStepData.validate(values);
      if (validationResult !== true) {
        setErrors(validationResult as Record<string, string>);
        return;
      }
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateValue = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step Progress */}
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                  index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : index === currentStep
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                )}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="hidden sm:block ml-2">
                <p className={cn('text-sm font-medium', index <= currentStep ? 'text-white' : 'text-gray-500')}>
                  {step.title}
                </p>
                {step.description && (
                  <p className={cn('text-xs', index <= currentStep ? 'text-gray-400' : 'text-gray-600')}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 rounded-full',
                  index < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="card p-6 animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">{currentStepData.title}</h2>
          {currentStepData.description && (
            <p className="text-sm text-gray-400 mt-1">{currentStepData.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {currentStepData.fields}
        </div>

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <ul className="space-y-1">
              {Object.entries(errors).map(([_, message]) => (
                <li key={message} className="text-sm text-red-300 flex items-center gap-2">
                  <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-800">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for form field registration
export function useFormField(key: string, values: Record<string, unknown>, onChange: (key: string, value: unknown) => void) {
  return {
    value: values[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange(key, e.target.value);
    },
    onBlur: () => {}, // For validation trigger if needed
  };
}