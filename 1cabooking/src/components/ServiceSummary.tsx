import { useLang } from '../context/LanguageContext';
import { CheckCircle2 } from 'lucide-react';
import type { Step1Selection } from './step1/Step1';
import { EXTRAS, EXTENDED_COVERAGE } from '../data/extras';
import { PROVINCE_TAXES } from '../data/step3Options';

interface Props {
  step: number;
  step1: Step1Selection;
  selectedExtras?: Record<string, number>;
  dryerVentLocations?: Record<string, number>;
  province?: string;
  unitLocationFee?: number;
  couponCode?: string;
  couponDiscount?: number;
  onCouponCodeChange?: (v: string) => void;
  onCouponApply?: () => void;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ServiceSummary({
  step,
  step1,
  selectedExtras = {},
  dryerVentLocations = {},
  province = 'Québec',
  unitLocationFee = 0,
  couponCode = '',
  couponDiscount = 0,
  onCouponCodeChange,
  onCouponApply,
}: Props) {
  const { t, lang } = useLang();

  /* ── Step 1 sidebar ── */
  if (step === 1) {
    const total = step1.subtotal;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-5 lg:sticky lg:top-4">
        <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">
          {lang === 'en' ? 'Service Summary' : 'Résumé du service'}
        </h3>
        <div className="space-y-2 mb-4">
          {step1.summaryLines.length === 0 ? (
            <div className="flex justify-between text-sm text-gray-500">
              <span>{lang === 'en' ? 'Subtotal' : 'Sous-total'}</span>
              <span>{fmt(0)}</span>
            </div>
          ) : (
            step1.summaryLines.map((l, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-700">
                <span className="pr-2">{l.label}</span>
                <span className="font-medium">{fmt(l.amount)}</span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="font-bold text-blue-700 text-base">{lang === 'en' ? 'Total' : 'Total'}</span>
          <span className="font-bold text-blue-700 text-xl">{fmt(total)}</span>
        </div>
      </div>
    );
  }

  /* ── Step 2+ sidebar ── */
  const dryerVentExtra = EXTRAS.find((e) => e.id === 'extra-dryer-vent');
  const dryerVentTotal = dryerVentExtra?.dryerLocations
    ? dryerVentExtra.dryerLocations.reduce((sum, loc) => sum + loc.price * (dryerVentLocations[loc.id] ?? 0), 0)
    : 0;

  const extrasTotal = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.bundlePrice * qty : 0);
  }, 0) + dryerVentTotal;

  const subtotal = step1.subtotal + extrasTotal + unitLocationFee + EXTENDED_COVERAGE - couponDiscount;
  const taxInfo = PROVINCE_TAXES[province] ?? PROVINCE_TAXES['Québec'];
  const taxLines = taxInfo.lines.map((l) => ({ label: l.label, amount: subtotal * l.rate }));
  const totalTax = taxLines.reduce((s, l) => s + l.amount, 0);
  const total = subtotal + totalTax;

  const selectedExtraEntries = Object.entries(selectedExtras).filter(([, qty]) => qty > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
      <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-3 mb-4">
        {lang === 'en' ? 'Service Summary' : 'Résumé du service'}
      </h3>

      {/* Base package section */}
      {step1.packageName && (
        <div className="mb-3">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              {lang === 'en' ? 'Base Package' : 'Forfait de base'}
            </span>
            <span className="text-sm font-semibold text-gray-900">{fmt(step1.basePrice)}</span>
          </div>
          <div className="space-y-0.5 mb-2">
            {step1.includes.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-gray-500 leading-snug">{t(item)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[11px] text-gray-500">• {lang === 'en' ? 'Vents' : 'Bouches'}</span>
            {step1.ventMode === 'arrival' ? (
              <span className="text-[11px] text-blue-600 font-semibold">
                {lang === 'en' ? 'Plus Vents (TBD)' : 'Plus bouches (À déterminer)'}
              </span>
            ) : (
              <span className="text-[11px] text-gray-600">{step1.ventCount} × $5.00</span>
            )}
          </div>
        </div>
      )}

      {/* Selected extras */}
      {selectedExtraEntries.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3 space-y-1.5">
          {selectedExtraEntries.map(([id, qty]) => {
            const extra = EXTRAS.find((e) => e.id === id);
            if (!extra) return null;
            return (
              <div key={id} className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide leading-snug">
                  {t(extra.name)}{qty > 1 ? ` × ${qty}` : ''}
                </span>
                <span className="text-sm font-semibold text-gray-900 shrink-0">
                  {fmt(extra.bundlePrice * qty)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Dryer vent locations breakdown */}
      {dryerVentTotal > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide leading-snug">
              {lang === 'en' ? 'Dryer Vent Cleaning' : 'Nettoyage sèche-linge'}
            </span>
            <span className="text-sm font-semibold text-gray-900 shrink-0">{fmt(dryerVentTotal)}</span>
          </div>
          {dryerVentExtra?.dryerLocations?.map((loc) => {
            const qty = dryerVentLocations[loc.id] ?? 0;
            if (qty === 0) return null;
            return (
              <div key={loc.id} className="flex justify-between text-[10px] text-gray-500 pl-2">
                <span>{t(loc.label)} × {qty}</span>
                <span>{fmt(loc.price * qty)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Extended Coverage */}
      <div className="flex justify-between items-baseline border-t border-gray-100 pt-3 mb-3">
        <span className="text-xs font-semibold text-amber-600">
          {lang === 'en' ? 'Extended Coverage' : 'Couverture étendue'}
        </span>
        <span className="text-sm font-semibold text-gray-900">{fmt(EXTENDED_COVERAGE)}</span>
      </div>

      {/* Unit location fee (if any) */}
      {unitLocationFee > 0 && (
        <div className="flex justify-between items-baseline border-t border-gray-100 pt-3 mb-3">
          <span className="text-xs font-semibold text-amber-600">
            {lang === 'en' ? 'Unit Location Fee' : 'Frais d\'emplacement'}
          </span>
          <span className="text-sm font-semibold text-gray-900">{fmt(unitLocationFee)}</span>
        </div>
      )}

      {/* Subtotal + taxes */}
      <div className="border-t border-gray-200 pt-3 space-y-1.5 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{lang === 'en' ? 'Subtotal' : 'Sous-total'}</span>
          <span className="font-medium">{fmt(subtotal)}</span>
        </div>
        {taxLines.map((tl) => (
          <div key={tl.label} className="flex justify-between text-sm text-gray-500">
            <span>{tl.label}</span>
            <span>{fmt(tl.amount)}</span>
          </div>
        ))}
      </div>

      {/* Coupon Code */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-700 block mb-1.5">
          {lang === 'en' ? 'Coupon Code' : 'Code promo'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange?.(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
          />
          <button
            onClick={onCouponApply}
            className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded transition-colors shrink-0"
          >
            {lang === 'en' ? 'Apply' : 'Appliquer'}
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
        <span className="font-bold text-blue-700 text-base">{lang === 'en' ? 'Total' : 'Total'}</span>
        <span className="font-bold text-blue-700 text-xl">{fmt(total)}</span>
      </div>
    </div>
  );
}
