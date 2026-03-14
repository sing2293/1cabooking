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
import { EXTRAS } from './data/extras';
import { PROVINCE_TAXES, UNIT_LOCATIONS, LAST_CLEANING, RENOVATIONS, SPECIAL_REQUESTS, HOW_DID_YOU_HEAR } from './data/step3Options';
import { Check } from 'lucide-react';
import LocationGate from './components/LocationGate';
import { captureTrackingData, generateEventId } from './utils/tracking';

const BACKEND_URL = '';  // always use /api/* — Vite proxy in dev, Vercel functions in prod
const API_SECRET  = '1cleanAir_2026_dispatch_secure_X9d83jsk29DKL';
const N8N_WEBHOOK: string = 'https://anuj1cleanair.app.n8n.cloud/webhook/1c861c48-42c0-40ce-af78-b4b0b274cc24';

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

  /* ── Location gate ── */
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [region, setRegion]                       = useState<'ottawa' | 'montreal' | ''>('');

  /* Carpet service uses its own truck pool regardless of geo-region */
  const effectiveRegion = step1Data.categoryId === 'carpet' ? 'carpet' : region;

  /* ── Tracking (UTM + FB cookies) — captured once on mount ── */
  const [tracking] = useState(() => captureTrackingData());

  /* ── Availability prefetch (starts at Step 2) ── */
  const [availDays, setAvailDays]       = useState<DayAvailability[]>([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError]     = useState<string | null>(null);
  const [availFetched, setAvailFetched] = useState(false);

  /* Reset availability when service type switches (e.g. carpet ↔ duct) */
  useEffect(() => {
    setAvailFetched(false);
    setAvailDays([]);
    setAvailError(null);
  }, [step1Data.categoryId]);

  useEffect(() => {
    if (currentStep < 2 || availFetched) return;

    /* Compute inside the effect so the closure always has the fresh value */
    const blocksNeeded = (step1Data.categoryId === 'dryer-vent' || step1Data.categoryId === 'carpet') ? 1 : 2;

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
        region:          effectiveRegion,
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
          .map((d) => ({ date: d.date, slots: mergeSlots(d.slots || [], blocksNeeded) }))
          .filter((d) => d.slots.length > 0)
          .filter((d) => {
            const [y, m, day] = d.date.split('-').map(Number);
            const dow = new Date(y, m - 1, day).getDay();
            return dow !== 0 && dow !== 6; // block Sundays (0) and Saturdays (6)
          });
        setAvailDays(mapped);
      })
      .catch((e: Error) => setAvailError(e.message))
      .finally(() => setAvailLoading(false));
  }, [currentStep, availFetched, effectiveRegion, step1Data.categoryId]);

  /* ── Booking state ── */
  const [bookState, setBookState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [bookError, setBookError]   = useState('');

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

  const province       = step3Data.province;
  const unitLocationFee = currentStep >= 3 ? step3Data.unitLocationFee : 0;
  const subtotal       = step1Data.subtotal + extrasTotal + unitLocationFee - couponDiscount;
  const taxInfo        = PROVINCE_TAXES[province] ?? PROVINCE_TAXES['Québec'];
  const totalTax       = taxInfo.lines.reduce((s, l) => s + subtotal * l.rate, 0);

  const displayTotal = currentStep === 1 ? step1Data.subtotal : subtotal + totalTax;

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Step validation ── */
  const step3Valid =
    step3Data.fullName.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step3Data.email.trim()) &&
    step3Data.phone.replace(/\D/g, '').length === 10 &&
    step3Data.streetAddress.trim() !== '' &&
    step3Data.province !== '' &&
    step3Data.agreementChecked;

  const step4Valid = step4Data.selectedDate !== null && step4Data.selectedSlot !== null;

  const step2Valid =
    step1Data.categoryId === 'carpet'
      ? Object.values(selectedExtras).some((qty) => qty > 0)
      : true;

  const canProceed =
    currentStep === 1 ? step1Data.isValid :
    currentStep === 2 ? step2Valid :
    currentStep === 3 ? step3Valid :
    currentStep === 4 ? step4Valid :
    true;

  /* ── Build calendar event notes ── */
  /* Helper: resolve option value → English label */
  const optLabel = (opts: { value: string; label: { en: string } }[], val: string) =>
    opts.find((o) => o.value === val)?.label.en ?? val;

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
      dryerVentExtra?.dryerLocations?.forEach((loc) => {
        const qty = dryerVentLocations[loc.id] ?? 0;
        if (qty > 0) lines.push(`  • ${loc.label.en} ×${qty}: ${fmt(loc.price * qty)}`);
      });
    }

    if (unitLocationFee > 0) lines.push(`  • Unit Location Fee: ${fmt(unitLocationFee)}`);

    lines.push('');
    lines.push(`Subtotal: ${fmt(subtotal)}`);
    taxInfo.lines.forEach((l) => lines.push(`${l.label}: ${fmt(subtotal * l.rate)}`));
    lines.push(`TOTAL: ${fmt(displayTotal)}`);

    // Property & History
    lines.push('');
    lines.push(`Province: ${step3Data.province}`);
    if (step3Data.yearBuilt) lines.push(`Year Built: ${step3Data.yearBuilt}`);
    lines.push(`Unit Location: ${optLabel(UNIT_LOCATIONS, step3Data.unitLocation)}`);
    lines.push(`Last Cleaning: ${optLabel(LAST_CLEANING, step3Data.lastCleaning)}`);
    lines.push(`Renovations: ${optLabel(RENOVATIONS, step3Data.renovationsSince)}`);
    lines.push(`Special Request: ${optLabel(SPECIAL_REQUESTS, step3Data.specialRequest)}`);
    if (step3Data.howDidYouHear) lines.push(`How Did You Hear: ${optLabel(HOW_DID_YOU_HEAR, step3Data.howDidYouHear)}`);
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
          start:        slot.start,
          end:          slot.end,
          name:         step3Data.fullName,
          phone:        step3Data.phone,
          email:        step3Data.email,
          address:      step3Data.streetAddress,
          notes:        buildNotes(),
          region:       effectiveRegion,
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

      setBookState('done');

      // ── Meta Pixel Lead event ──
      const leadEventId = generateEventId();
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: (step1Data.packageName as Record<string, string> | null)?.en ?? 'Booking',
          value: subtotal + totalTax,
          currency: 'CAD',
        }, { eventID: leadEventId });
      }

      // ── n8n lead webhook (fire-and-forget) ──
      if (N8N_WEBHOOK && N8N_WEBHOOK !== 'YOUR_N8N_WEBHOOK_URL') {
        const slot = step4Data.selectedSlot!;
        fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Customer
            name:     step3Data.fullName,
            email:    step3Data.email,
            phone:    step3Data.phone,
            address:  step3Data.streetAddress,
            province: step3Data.province,
            language: step3Data.languagePreference,
            // Appointment
            date:       step4Data.selectedDate,
            time_start: slot.start,
            time_end:   slot.end,
            time_label: slot.label,
            // Service
            service_category: step1Data.categoryId,
            service_package:  (step1Data.packageName as Record<string, string> | null)?.en ?? '',
            vent_count:       step1Data.ventCount,
            vent_mode:        step1Data.ventMode,
            // Extras
            extras: Object.fromEntries(Object.entries(selectedExtras).filter(([, qty]) => qty > 0)),
            dryer_vent_locations: Object.fromEntries(Object.entries(dryerVentLocations).filter(([, qty]) => qty > 0)),
            // Property & History
            year_built:       step3Data.yearBuilt,
            unit_location:    optLabel(UNIT_LOCATIONS, step3Data.unitLocation),
            last_cleaning:    optLabel(LAST_CLEANING, step3Data.lastCleaning),
            renovations:      optLabel(RENOVATIONS, step3Data.renovationsSince),
            special_request:  optLabel(SPECIAL_REQUESTS, step3Data.specialRequest),
            how_did_you_hear: optLabel(HOW_DID_YOU_HEAR, step3Data.howDidYouHear),
            special_notes:    step3Data.specialNotes,
            // Pricing
            subtotal:       subtotal,
            tax:            totalTax,
            total:          subtotal + totalTax,
            coupon_discount: couponDiscount,
            // Notes
            notes: buildNotes(),
            // Meta
            region:    effectiveRegion,
            booked_at: new Date().toISOString(),
            // FB / UTM tracking
            event_id:         leadEventId,
            event_source_url: tracking.event_source_url,
            fbp:              tracking.fbp,
            fbc:              tracking.fbc,
            utm_source:       tracking.utm_source,
            utm_campaign:     tracking.utm_campaign,
            utm_medium:       tracking.utm_medium,
            utm_content:      tracking.utm_content,
            utm_term:         tracking.utm_term,
            utm_id:           tracking.utm_id,
          }),
        }).catch(() => {}); // never block the confirmation
      }
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

  /* ── Location gate (before booking flow) ── */
  /* Gatineau-area cities use Ottawa trucks but are in Québec for taxes */
  const GATINEAU_QC = ['gatineau', 'hull', 'aylmer', 'buckingham', 'chelsea', 'wakefield', 'cantley', 'pontiac', 'la peche'];
  const normalizeCity = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (!locationConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <LocationGate onConfirm={(r, city, address) => {
          setRegion(r);
          const isGatineau = GATINEAU_QC.some(c => normalizeCity(city).includes(c));
          const province = (r === 'montreal' || isGatineau) ? 'Québec' : 'Ontario';
          setStep3Data((prev) => ({
            ...prev,
            streetAddress: address,
            province,
          }));
          setLocationConfirmed(true);
        }} />
      </div>
    );
  }

  /* ── Booking confirmed screen ── */
  if (bookState === 'done') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6 border border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-100">
              <Check className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {lang === 'en' ? 'Booking Confirmed!' : 'Réservation confirmée!'}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {lang === 'en'
                  ? 'An associate will be in touch with you regarding this booking.'
                  : 'Un associé vous contactera concernant cette réservation.'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl px-6 py-4">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
                {lang === 'en' ? 'Urgent question? Call us' : 'Question urgente? Appelez-nous'}
              </p>
              <a
                href="tel:6136124828"
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                (613)-612-4828
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmStep = currentStep === 5;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-28 sm:pb-32">
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
              {currentStep === 1 && <Step1 onSelectionChange={setStep1Data} region={region} />}
              {currentStep === 2 && (
                <Step2
                  selectedExtras={selectedExtras}
                  onExtrasChange={setSelectedExtras}
                  dryerVentLocations={dryerVentLocations}
                  onDryerVentLocationChange={handleDryerVentLocationChange}
                  categoryId={step1Data.categoryId}
                  packageId={step1Data.packageId}
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
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 shadow-2xl z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Total' : 'Total'}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-white">{fmt(displayTotal)}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {lang === 'en' ? 'Back' : 'Retour'}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || bookState === 'loading'}
              className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors ${
                !canProceed || bookState === 'loading'
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : isConfirmStep
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
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
