import { Check } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const STEPS = [
  { num: 1, label: { en: 'SERVICE',  fr: 'SERVICE'     } },
  { num: 2, label: { en: 'EXTRAS',   fr: 'EXTRAS'      } },
  { num: 3, label: { en: 'DETAILS',  fr: 'DÉTAILS'     } },
  { num: 4, label: { en: 'TIME',     fr: 'TEMPS'       } },
  { num: 5, label: { en: 'REVIEW',   fr: 'RÉVISION'    } },
];

interface Props {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto py-3 sm:py-4">
      {STEPS.map((step, idx) => {
        const isActive    = step.num === currentStep;
        const isCompleted = step.num < currentStep;

        return (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted
                  ? <Check className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={3} />
                  : step.num}
              </div>
              {/* Label — hidden on xs, visible sm+ */}
              <span
                className={`hidden sm:block mt-1 text-[9px] sm:text-[10px] font-semibold tracking-wider ${
                  isActive
                    ? 'text-blue-700'
                    : isCompleted
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {t(step.label)}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-0 sm:mb-4 ${
                  isCompleted ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
