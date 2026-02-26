import { useState } from 'react';
import { LanguageProvider, useLang } from './context/LanguageContext';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import ServiceSummary from './components/ServiceSummary';
import Step1, { type Step1Selection } from './components/step1/Step1';
import Step2 from './components/step2/Step2';
import Step3, { type Step3Data, EMPTY_STEP3 } from './components/step3/Step3';
import { EXTRAS, EXTENDED_COVERAGE } from './data/extras';
import { PROVINCE_TAXES } from './data/step3Options';

const EMPTY_STEP1: Step1Selection = {
  isValid: false,
  packageName: null,
  packageId: null,
  categoryId: null,
  basePrice: 0,
  includes: [],
  ventMode: 'arrival',
  ventCount: 0,
  subtotal: 0,
  summaryLines: [],
};

function BookingApp() {
  const { lang } = useLang();
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Selection>(EMPTY_STEP1);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount] = useState(0);
  const [step3Data, setStep3Data] = useState<Step3Data>(EMPTY_STEP3);

  /* ── Total calculation ── */
  const extrasTotal = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.bundlePrice * qty : 0);
  }, 0);

  const province = currentStep >= 3 ? step3Data.province : 'Québec';
  const unitLocationFee = currentStep >= 3 ? step3Data.unitLocationFee : 0;
  const subtotal = step1Data.subtotal + extrasTotal + unitLocationFee + EXTENDED_COVERAGE - couponDiscount;
  const taxInfo = PROVINCE_TAXES[province] ?? PROVINCE_TAXES['Québec'];
  const totalTax = taxInfo.lines.reduce((s, l) => s + subtotal * l.rate, 0);

  const displayTotal = currentStep === 1 ? step1Data.subtotal : subtotal + totalTax;

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Step validation ── */
  const step3Valid =
    step3Data.fullName.trim() !== '' &&
    step3Data.email.trim() !== '' &&
    step3Data.phone.trim() !== '' &&
    step3Data.streetAddress.trim() !== '' &&
    step3Data.province !== '' &&
    step3Data.agreementChecked;

  const canProceed =
    currentStep === 1 ? step1Data.isValid :
    currentStep === 2 ? true :
    currentStep === 3 ? step3Valid :
    true;

  const handleNext = () => { if (canProceed) setCurrentStep((s) => s + 1); };
  const handleBack = () => { setCurrentStep((s) => Math.max(1, s - 1)); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4">
        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 sm:pb-32">
        {/* Responsive layout: stacks on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 w-full">
            {currentStep === 1 && <Step1 onSelectionChange={setStep1Data} />}
            {currentStep === 2 && (
              <Step2 selectedExtras={selectedExtras} onExtrasChange={setSelectedExtras} />
            )}
            {currentStep === 3 && (
              <Step3 data={step3Data} onChange={setStep3Data} />
            )}
          </div>

          {/* Sidebar — below content on mobile/tablet, right column on desktop */}
          <div className="w-full lg:w-72 lg:shrink-0">
            <ServiceSummary
              step={currentStep}
              step1={step1Data}
              selectedExtras={selectedExtras}
              province={province}
              unitLocationFee={unitLocationFee}
              couponCode={couponCode}
              couponDiscount={couponDiscount}
              onCouponCodeChange={setCouponCode}
              onCouponApply={() => { /* coupon logic later */ }}
            />
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'en' ? 'Total' : 'Total'}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{fmt(displayTotal)}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {lang === 'en' ? 'Back' : 'Retour'}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors ${
                canProceed
                  ? 'bg-blue-700 hover:bg-blue-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">{lang === 'en' ? 'Next Step' : 'Étape suivante'}</span>
              <span className="sm:hidden">{lang === 'en' ? 'Next' : 'Suivant'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BookingApp />
    </LanguageProvider>
  );
}
