import { useLang } from '../../context/LanguageContext';
import AddressAutocomplete from './AddressAutocomplete';
import {
  LANGUAGE_PREFERENCES,
  PROVINCES,
  UNIT_LOCATIONS,
  LAST_CLEANING,
  RENOVATIONS,
  SPECIAL_REQUESTS,
  HOW_DID_YOU_HEAR,
} from '../../data/step3Options';

export interface Step3Data {
  fullName: string;
  email: string;
  phone: string;
  languagePreference: string;
  streetAddress: string;
  province: string;
  yearBuilt: string;
  unitLocation: string;
  unitLocationFee: number;
  lastCleaning: string;
  renovationsSince: string;
  specialRequest: string;
  howDidYouHear: string;
  specialNotes: string;
  agreementChecked: boolean;
}

export const EMPTY_STEP3: Step3Data = {
  fullName: '',
  email: '',
  phone: '',
  languagePreference: 'english',
  streetAddress: '',
  province: 'Québec',
  yearBuilt: '',
  unitLocation: 'standard',
  unitLocationFee: 0,
  lastCleaning: 'last-year',
  renovationsSince: 'no',
  specialRequest: 'none',
  howDidYouHear: '',
  specialNotes: '',
  agreementChecked: false,
};

interface Props {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
}

/* Reusable labelled field wrapper */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white';

const selectCls =
  'border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white appearance-none';

export default function Step3({ data, onChange }: Props) {
  const { lang } = useLang();

  const set = (key: keyof Step3Data, value: string | boolean | number) => {
    onChange({ ...data, [key]: value });
  };

  const handleUnitLocationChange = (value: string) => {
    const opt = UNIT_LOCATIONS.find((o) => o.value === value);
    onChange({ ...data, unitLocation: value, unitLocationFee: opt?.fee ?? 0 });
  };

  const handleAddressChange = (address: string, province?: string) => {
    onChange({
      ...data,
      streetAddress: address,
      ...(province ? { province } : {}),
    });
  };

  const t = (obj: Record<string, string>) => obj[lang] ?? obj['en'];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">
        {lang === 'en' ? '3. Your Details' : '3. Vos coordonnées'}
      </h2>

      {/* ── Contact Information ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">
          {lang === 'en' ? 'Contact Information' : 'Coordonnées'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={lang === 'en' ? 'Full Name' : 'Nom complet'}>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label={lang === 'en' ? 'Email' : 'Courriel'}>
            <input
              type="email"
              value={data.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label={lang === 'en' ? 'Cell Phone' : 'Téléphone cellulaire'}>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="514.555.1234"
              className={inputCls}
            />
          </Field>

          <Field label={lang === 'en' ? 'Language Preference' : 'Préférence de langue'}>
            <select
              value={data.languagePreference}
              onChange={(e) => set('languagePreference', e.target.value)}
              className={selectCls}
            >
              {LANGUAGE_PREFERENCES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ── Property Details ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">
          {lang === 'en' ? 'Property Details' : 'Détails de la propriété'}
        </h3>
        <div className="space-y-4">
          <Field label={lang === 'en' ? 'Street Address' : 'Adresse'}>
            <AddressAutocomplete
              value={data.streetAddress}
              onChange={handleAddressChange}
              placeholder={lang === 'en' ? 'Start typing your address...' : 'Commencez à taper votre adresse...'}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={lang === 'en' ? 'Province (For Taxes)' : 'Province (pour les taxes)'}>
              <select
                value={data.province}
                onChange={(e) => set('province', e.target.value)}
                className={selectCls}
              >
                {PROVINCES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={lang === 'en' ? 'Year Home Was Built' : 'Année de construction'}>
              <input
                type="number"
                value={data.yearBuilt}
                onChange={(e) => set('yearBuilt', e.target.value)}
                placeholder="e.g. 1985"
                min={1800}
                max={new Date().getFullYear()}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label={lang === 'en' ? 'Main Unit (Furnace or Air Exchanger) Location' : 'Emplacement de l\'unité principale'}>
            <select
              value={data.unitLocation}
              onChange={(e) => handleUnitLocationChange(e.target.value)}
              className={selectCls}
            >
              {UNIT_LOCATIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ── History & Requests ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-800 mb-5">
          {lang === 'en' ? 'History & Requests' : 'Historique et demandes'}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={lang === 'en' ? 'When Was the Last Cleaning?' : 'Dernier nettoyage?'}>
              <select
                value={data.lastCleaning}
                onChange={(e) => set('lastCleaning', e.target.value)}
                className={selectCls}
              >
                {LAST_CLEANING.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={lang === 'en' ? 'Any Renovations Since?' : 'Des rénovations depuis?'}>
              <select
                value={data.renovationsSince}
                onChange={(e) => set('renovationsSince', e.target.value)}
                className={selectCls}
              >
                {RENOVATIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={lang === 'en' ? 'Customer Special Request' : 'Demande spéciale'}>
            <select
              value={data.specialRequest}
              onChange={(e) => set('specialRequest', e.target.value)}
              className={selectCls}
            >
              {SPECIAL_REQUESTS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={lang === 'en' ? 'How Did You Hear About Us?' : 'Comment nous avez-vous connus?'}>
            <select
              value={data.howDidYouHear}
              onChange={(e) => set('howDidYouHear', e.target.value)}
              className={selectCls}
            >
              {HOW_DID_YOU_HEAR.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={lang === 'en' ? 'Special Notes (Optional)' : 'Notes spéciales (facultatif)'}>
            <textarea
              value={data.specialNotes}
              onChange={(e) => set('specialNotes', e.target.value)}
              placeholder={lang === 'en' ? 'Any specific instructions for our team?' : 'Des instructions spécifiques pour notre équipe?'}
              rows={4}
              className={`${inputCls} resize-y`}
            />
          </Field>
        </div>
      </div>

      {/* ── Service Agreement ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.agreementChecked}
            onChange={(e) => set('agreementChecked', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-700 shrink-0"
          />
          <span className="text-sm text-gray-700">
            {lang === 'en' ? 'I confirm I have read and understand the ' : 'Je confirme avoir lu et compris la '}
            <a href="#" className="text-blue-600 underline hover:text-blue-800">
              {lang === 'en' ? 'Service Agreement & Precautions' : 'Entente de service et précautions'}
            </a>
            .{' '}
            <span className="text-red-500 font-bold">*</span>
          </span>
        </label>
      </div>
    </div>
  );
}
