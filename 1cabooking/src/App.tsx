import { useState, useEffect } from 'react';
import { LanguageProvider, useLang } from './context/LanguageContext';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import ServiceSummary from './components/ServiceSummary';
import Step1, { type Step1Selection } from './components/step1/Step1';
import Step2 from './components/step2/Step2';
import Step3, { type Step3Data, EMPTY_STEP3 } from './components/step3/Step3';
import Step4, { type Step4Data, EMPTY_STEP4, type DayAvailability, type RawDay, mergeSlots, toISODate } from './components/step4/Step4';
import Step5 from './components/step5/Step5';
import { EXTRAS, EXTENDED_COVERAGE } from './data/extras';
import { PROVINCE_TAXES } from './data/step3Options';
import { Check, CalendarCheck } from 'lucide-react';

const BACKEND_URL = '';  // always use /api/* — Vite proxy in dev, Vercel functions in prod
const API_SECRET  = '1cleanAir_2026_dispatch_secure_X9d83jsk29DKL';

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
  const [dryerVentLocations, setDryerVentLocations] = useState<Record<string, number>>({});
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount] = useState(0);
  const [step3Data, setStep3Data] = useState<Step3Data>(EMPTY_STEP3);
  const [step4Data, setStep4Data] = useState<Step4Data>(EMPTY_STEP4);

  /* ── Availability prefetch (starts at Step 2) ── */
  const [availDays, setAvailDays]       = useState<DayAvailability[]>([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError]     = useState<string | null>(null);
  const [availFetched, setAvailFetched] = useState(false);

  useEffect(() => {
    if (currentStep < 2 || availFetched) return;
    setAvailFetched(true);
    setAvailLoading(true);

    const start = new Date();
    const end   = new Date();
    end.setMonth(end.getMonth() + 2);

    fetch(`${BACKEND_URL}/api/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-SECRET': API_SECRET },
      body: JSON.stringify({
        start:           toISODate(start),
        end:             toISODate(end),
        workStart:       '08:00',
        workEnd:         '16:00',
        slotStepMinutes: 60,
      }),
    })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json?.error || json?.message || `Error ${r.status}`);
        return json;
      })
      .then((json) => {
        const rawDays: RawDay[] = json.days || [];
        const mapped: DayAvailability[] = rawDays
          .map((d) => ({ date: d.date, slots: mergeSlots(d.slots || []) }))
          .filter((d) => d.slots.length > 0)
          .filter((d) => {
            const [y, m, day] = d.date.split('-').map(Number);
            return new Date(y, m - 1, day).getDay() !== 0; // block Sundays
          });
        setAvailDays(mapped);
      })
      .catch((e: Error) => setAvailError(e.message))
      .finally(() => setAvailLoading(false));
  }, [currentStep, availFetched]);

  /* ── Booking state ── */
  const [bookState, setBookState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [bookError, setBookError]   = useState('');
  const [eventLink, setEventLink]   = useState('');

  const handleDryerVentLocationChange = (id: string, qty: number) => {
    setDryerVentLocations((prev) => {
      const next = { ...prev };
      if (qty === 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };

  /* ── Total calculation ── */
  const dryerVentExtra = EXTRAS.find((e) => e.id === 'extra-dryer-vent');
  const dryerVentTotal = dryerVentExtra?.dryerLocations
    ? dryerVentExtra.dryerLocations.reduce((sum, loc) => sum + loc.price * (dryerVentLocations[loc.id] ?? 0), 0)
    : 0;

  const extrasTotal = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.bundlePrice * qty : 0);
  }, 0) + dryerVentTotal;

  const province       = currentStep >= 3 ? step3Data.province : 'Québec';
  const unitLocationFee = currentStep >= 3 ? step3Data.unitLocationFee : 0;
  const subtotal       = step1Data.subtotal + extrasTotal + unitLocationFee + EXTENDED_COVERAGE - couponDiscount;
  const taxInfo        = PROVINCE_TAXES[province] ?? PROVINCE_TAXES['Québec'];
  const totalTax       = taxInfo.lines.reduce((s, l) => s + subtotal * l.rate, 0);

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

  const step4Valid = step4Data.selectedDate !== null && step4Data.selectedSlot !== null;

  const canProceed =
    currentStep === 1 ? step1Data.isValid :
    currentStep === 2 ? true :
    currentStep === 3 ? step3Valid :
    currentStep === 4 ? step4Valid :
    true;

  /* ── Build calendar event notes ── */
  const buildNotes = () => {
    const pkgName = step1Data.packageName
      ? (step1Data.packageName as { en: string; fr: string }).en
      : 'Duct Cleaning';

    const lines: string[] = [];

    lines.push(`SERVICE: ${pkgName}`);
    lines.push('');

    // Step 1 breakdown
    step1Data.summaryLines.forEach((l) => {
      lines.push(`  • ${l.label}: ${fmt(l.amount)}`);
    });

    // Extras
    Object.entries(selectedExtras).forEach(([id, qty]) => {
      if (qty === 0) return;
      const extra = EXTRAS.find((e) => e.id === id);
      if (extra) lines.push(`  • ${extra.name.en}${qty > 1 ? ` ×${qty}` : ''}: ${fmt(extra.bundlePrice * qty)}`);
    });

    // Dryer vent locations
    if (dryerVentTotal > 0) {
      const dve = EXTRAS.find((e) => e.id === 'extra-dryer-vent');
      dve?.dryerLocations?.forEach((loc) => {
        const qty = dryerVentLocations[loc.id] ?? 0;
        if (qty > 0) lines.push(`  • ${loc.label.en} ×${qty}: ${fmt(loc.price * qty)}`);
      });
    }

    lines.push(`  • Extended Coverage: ${fmt(EXTENDED_COVERAGE)}`);
    if (unitLocationFee > 0) lines.push(`  • Unit Location Fee: ${fmt(unitLocationFee)}`);

    lines.push('');
    lines.push(`Subtotal: ${fmt(subtotal)}`);
    taxInfo.lines.forEach((l) => lines.push(`${l.label}: ${fmt(subtotal * l.rate)}`));
    lines.push(`TOTAL: ${fmt(displayTotal)}`);
    lines.push('');
    lines.push(`Province: ${step3Data.province}`);
    if (step3Data.specialNotes) lines.push(`Customer Notes: ${step3Data.specialNotes}`);

    return lines.join('\n');
  };

  /* ── Booking API call ── */
  const handleConfirmBooking = async () => {
    if (bookState === 'loading') return;
    setBookState('loading');
    setBookError('');

    try {
      const slot = step4Data.selectedSlot!;
      const res  = await fetch(`${BACKEND_URL}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-SECRET': API_SECRET,
        },
        body: JSON.stringify({
          start:   slot.start,
          end:     slot.end,
          name:    step3Data.fullName,
          phone:   step3Data.phone,
          email:   step3Data.email,
          address: step3Data.streetAddress,
          notes: buildNotes(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data?.error === 'slot_taken') {
        throw new Error(
          lang === 'en'
            ? 'That slot was just taken. Please go back and choose another time.'
            : 'Ce créneau vient d\'être pris. Veuillez revenir et choisir un autre.'
        );
      }
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Booking failed (${res.status})`);
      }

      setEventLink(data.htmlLink || '');
      setBookState('done');
    } catch (e: unknown) {
      setBookError((e as Error).message);
      setBookState('error');
    }
  };

  const handleNext = () => {
    if (currentStep === 5) { handleConfirmBooking(); return; }
    if (canProceed) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (bookState === 'error') { setBookState('idle'); setBookError(''); }
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  /* ── Booking confirmed screen ── */
  if (bookState === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {lang === 'en' ? 'Booking Confirmed!' : 'Réservation confirmée!'}
              </h2>
              <p className="text-sm text-gray-500">
                {lang === 'en'
                  ? `A confirmation email has been sent to ${step3Data.email}.`
                  : `Un e-mail de confirmation a été envoyé à ${step3Data.email}.`}
              </p>
            </div>
            {eventLink && (
              <a
                href={eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                <CalendarCheck className="w-4 h-4" />
                {lang === 'en' ? 'View Calendar Event' : 'Voir l\'événement'}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isConfirmStep = currentStep === 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4">
        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 sm:pb-32">
        {isConfirmStep ? (
          /* Step 5 is full-width — no sidebar */
          <Step5
            step1={step1Data}
            step3={step3Data}
            step4={step4Data}
            selectedExtras={selectedExtras}
            dryerVentLocations={dryerVentLocations}
            couponDiscount={couponDiscount}
            bookError={bookState === 'error' ? bookError : null}
          />
        ) : (
          /* Steps 1-4: main content + sidebar */
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              {currentStep === 1 && <Step1 onSelectionChange={setStep1Data} />}
              {currentStep === 2 && (
                <Step2
                  selectedExtras={selectedExtras}
                  onExtrasChange={setSelectedExtras}
                  dryerVentLocations={dryerVentLocations}
                  onDryerVentLocationChange={handleDryerVentLocationChange}
                />
              )}
              {currentStep === 3 && (
                <Step3 data={step3Data} onChange={setStep3Data} />
              )}
              {currentStep === 4 && (
                <Step4 data={step4Data} onChange={setStep4Data} days={availDays} loading={availLoading} error={availError} />
              )}
            </div>

            <div className="w-full lg:w-72 lg:shrink-0">
              <ServiceSummary
                step={currentStep}
                step1={step1Data}
                selectedExtras={selectedExtras}
                dryerVentLocations={dryerVentLocations}
                province={province}
                unitLocationFee={unitLocationFee}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                onCouponCodeChange={setCouponCode}
                onCouponApply={() => { /* coupon logic later */ }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom bar ── */}
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
              disabled={!canProceed || bookState === 'loading'}
              className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors ${
                !canProceed || bookState === 'loading'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isConfirmStep
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
            >
              {isConfirmStep ? (
                bookState === 'loading'
                  ? <span>{lang === 'en' ? 'Booking…' : 'Réservation…'}</span>
                  : <span>{lang === 'en' ? 'Confirm Booking' : 'Confirmer'}</span>
              ) : (
                <>
                  <span className="hidden sm:inline">{lang === 'en' ? 'Next Step' : 'Étape suivante'}</span>
                  <span className="sm:hidden">{lang === 'en' ? 'Next' : 'Suivant'}</span>
                  <span>→</span>
                </>
              )}
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
