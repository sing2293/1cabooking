import { User, ClipboardList, Info } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import type { Step1Selection } from '../step1/Step1';
import type { Step3Data } from '../step3/Step3';
import type { Step4Data } from '../step4/Step4';
import { EXTRAS, EXTENDED_COVERAGE } from '../../data/extras';
import { PROVINCE_TAXES } from '../../data/step3Options';

interface Props {
  step1: Step1Selection;
  step3: Step3Data;
  step4: Step4Data;
  selectedExtras: Record<string, number>;
  dryerVentLocations: Record<string, number>;
  couponDiscount: number;
  bookError?: string | null;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatBookingDate(dateStr: string, lang: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const result = date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', {
    timeZone: 'America/Montreal',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
}

export default function Step5({ step1, step3, step4, selectedExtras, dryerVentLocations, couponDiscount, bookError }: Props) {
  const { lang, t } = useLang();

  /* ── Price calculation (mirrors App.tsx) ── */
  const dryerVentExtra = EXTRAS.find((e) => e.id === 'extra-dryer-vent');
  const dryerVentTotal = dryerVentExtra?.dryerLocations
    ? dryerVentExtra.dryerLocations.reduce((sum, loc) => sum + loc.price * (dryerVentLocations[loc.id] ?? 0), 0)
    : 0;

  const extrasTotal = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.bundlePrice * qty : 0);
  }, 0) + dryerVentTotal;

  const subtotal = step1.subtotal + extrasTotal + step3.unitLocationFee + EXTENDED_COVERAGE - couponDiscount;
  const taxInfo = PROVINCE_TAXES[step3.province] ?? PROVINCE_TAXES['Québec'];
  const taxLines = taxInfo.lines.map((l) => ({ label: l.label, amount: subtotal * l.rate }));
  const total = subtotal + taxLines.reduce((s, l) => s + l.amount, 0);

  const slot = step4.selectedSlot!;
  const bookingDate  = formatBookingDate(step4.selectedDate!, lang);
  const arrivalStart = formatSlotTime(slot.start);
  const arrivalEnd   = formatSlotTime(slot.end);

  const selectedExtraEntries = Object.entries(selectedExtras).filter(([, qty]) => qty > 0);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {lang === 'en' ? 'Review & Confirm' : 'Réviser et confirmer'}
      </h2>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        {/* ── Blue appointment header ── */}
        <div className="bg-blue-700 text-white px-6 py-5 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">
              {lang === 'en' ? 'Appointment Date' : 'Date du rendez-vous'}
            </p>
            <p className="text-lg sm:text-xl font-bold">{bookingDate}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">
              {lang === 'en' ? 'Arrival Window' : "Fenêtre d'arrivée"}
            </p>
            <p className="text-lg sm:text-xl font-bold">{arrivalStart} – {arrivalEnd}</p>
          </div>
        </div>

        {/* ── Customer Details ── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-blue-700">
              {lang === 'en' ? 'Customer Details' : 'Coordonnées'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
                {lang === 'en' ? 'Full Name' : 'Nom complet'}
              </p>
              <p className="text-sm font-semibold text-gray-800">{step3.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
                {lang === 'en' ? 'Contact' : 'Contact'}
              </p>
              <p className="text-sm text-gray-700">{step3.email}</p>
              <p className="text-sm text-gray-700">{step3.phone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">
                {lang === 'en' ? 'Service Location' : 'Adresse du service'}
              </p>
              <p className="text-sm font-semibold text-gray-800">{step3.streetAddress}</p>
            </div>
          </div>
        </div>

        {/* ── Service Summary ── */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-blue-700">
              {lang === 'en' ? 'Service Summary' : 'Résumé du service'}
            </h3>
          </div>

          <div className="space-y-2">
            {/* Base package */}
            {step1.packageName && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  {lang === 'en' ? 'Base Package' : 'Forfait de base'}
                </span>
                <span className="text-sm font-semibold text-gray-900">{fmt(step1.basePrice)}</span>
              </div>
            )}

            {/* Vents */}
            <div className="flex justify-between items-baseline pl-2">
              <span className="text-xs text-gray-500">• {lang === 'en' ? 'Vents' : 'Bouches'}</span>
              {step1.ventMode === 'arrival' ? (
                <span className="text-xs text-blue-600 font-semibold">
                  {lang === 'en' ? 'Plus Vents (TBD)' : 'Plus bouches (À déterminer)'}
                </span>
              ) : (
                <span className="text-xs text-gray-600">{step1.ventCount} × $5.00</span>
              )}
            </div>

            {/* Extras */}
            {selectedExtraEntries.map(([id, qty]) => {
              const extra = EXTRAS.find((e) => e.id === id);
              if (!extra) return null;
              return (
                <div key={id} className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-amber-600">
                    {t(extra.name)}{qty > 1 ? ` × ${qty}` : ''}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{fmt(extra.bundlePrice * qty)}</span>
                </div>
              );
            })}

            {/* Dryer vent */}
            {dryerVentTotal > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-amber-600">
                  {lang === 'en' ? 'Dryer Vent Cleaning' : 'Nettoyage sèche-linge'}
                </span>
                <span className="text-sm font-semibold text-gray-900">{fmt(dryerVentTotal)}</span>
              </div>
            )}

            {/* Unit location fee */}
            {step3.unitLocationFee > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-amber-600">
                  {lang === 'en' ? 'Unit Location Fee' : "Frais d'emplacement"}
                </span>
                <span className="text-sm font-semibold text-gray-900">{fmt(step3.unitLocationFee)}</span>
              </div>
            )}

            {/* Extended coverage */}
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-amber-600">
                {lang === 'en' ? 'Extended Coverage' : 'Couverture étendue'}
              </span>
              <span className="text-sm font-semibold text-gray-900">{fmt(EXTENDED_COVERAGE)}</span>
            </div>

            {/* Subtotal + taxes */}
            <div className="border-t border-gray-200 pt-3 mt-2 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{lang === 'en' ? 'Subtotal' : 'Sous-total'}</span>
                <span className="font-medium text-gray-700">{fmt(subtotal)}</span>
              </div>
              {taxLines.map((tl) => (
                <div key={tl.label} className="flex justify-between text-sm text-gray-500">
                  <span>{tl.label}</span>
                  <span>{fmt(tl.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total bar */}
          <div className="mt-4 bg-gray-900 text-white rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* ── Confirmation notice ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-1">
            {lang === 'en' ? 'Confirmation Required' : 'Confirmation requise'}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            {lang === 'en'
              ? 'Please review all details above carefully before confirming. A confirmation email will be sent immediately after you complete your booking. Final Price Verification: The total shown is an estimate based on the information you provided. The exact price will be verified on-site, and we can confirm it with you before any work begins if you prefer.'
              : "Veuillez vérifier tous les détails ci-dessus avant de confirmer. Un e-mail de confirmation vous sera envoyé immédiatement. Le total affiché est une estimation; le prix exact sera vérifié sur place avant le début des travaux."}
          </p>
        </div>
      </div>

      {/* ── Booking error ── */}
      {bookError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 font-medium">
          {bookError}
        </div>
      )}
    </div>
  );
}
