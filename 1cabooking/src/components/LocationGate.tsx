import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/* ── Calendar ID lists ── */
const OTTAWA_IDS = [
  '674fb4f981c448b260e11a3a1ad1f286244a9bc9f880615d28fb79163f358c08@group.calendar.google.com',
  'a23847281ec543be0de640b513c7333d8593ed34eff3fd5ddd68ad7fd7fd3e33@group.calendar.google.com',
  'db649d98508b1605a70d20b3e68e2b63b77766244af6d705a05e03117e94fc7e@group.calendar.google.com',
  'bdaa518313edbb0742006563876dec290d7686d9891e407623d5bc7159751046@group.calendar.google.com',
  '3723a36307a932857157a91375969f577a5149d153739c63b0b9965bf959c85e@group.calendar.google.com',
].join(',');

const MONTREAL_IDS = [
  '05a3563ac311327bed5c0ba221a9746927de14ee7d90413cb5c3dd14fc36d78b@group.calendar.google.com',
  'd9ee222fab82252f263e68dfb71b10a08a555063fd6e3ee9edba81019dd433bc@group.calendar.google.com',
].join(',');

function cityToCalendarIds(city: string): string | null {
  const c = city.toLowerCase().trim();
  if (c.includes('ottawa') || c.includes('gatineau')) return OTTAWA_IDS;
  if (c.includes('montreal') || c.includes('montréal')) return MONTREAL_IDS;
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = Window & typeof globalThis & Record<string, any>;

interface Props {
  onConfirm: (calendarIds: string, city: string, address: string) => void;
}

export default function LocationGate({ onConfirm }: Props) {
  const { lang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const autoRef  = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [city, setCity]           = useState('');
  const [address, setAddress]     = useState('');
  const [calIds, setCalIds]       = useState<string | null>(null); // null = not checked yet, '' = not served
  const [inputVal, setInputVal]   = useState('');

  /* ── Load Google Maps script once ── */
  useEffect(() => {
    const apiKey = import.meta.env.VITE_PLACES_API_KEY as string | undefined;
    if (!apiKey) { setMapsReady(true); return; }
    if ((window as AnyWindow).google?.maps?.places) { setMapsReady(true); return; }

    const cb = '__gmapsLoaded';
    (window as AnyWindow)[cb] = () => setMapsReady(true);

    const s = document.createElement('script');
    s.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${cb}`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);

    return () => { delete (window as AnyWindow)[cb]; };
  }, []);

  /* ── Attach Autocomplete ── */
  useEffect(() => {
    if (!mapsReady || !inputRef.current || autoRef.current) return;

    autoRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ca' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    });

    autoRef.current.addListener('place_changed', () => {
      const place = autoRef.current!.getPlace();
      if (!place.address_components) return;

      const formatted = place.formatted_address ?? inputRef.current?.value ?? '';
      const get = (type: string) =>
        place.address_components!.find(
          (c: google.maps.GeocoderAddressComponent) => c.types.includes(type)
        )?.long_name ?? '';

      const detectedCity =
        get('locality') ||
        get('administrative_area_level_3') ||
        get('administrative_area_level_2') || '';

      const ids = cityToCalendarIds(detectedCity);
      setCity(detectedCity);
      setAddress(formatted);
      setCalIds(ids ?? '');   // '' means not served
      setInputVal(formatted);
    });
  }, [mapsReady]);

  const canConfirm = calIds !== null && calIds !== '';
  const notServed  = calIds === '';

  const handleConfirm = () => {
    if (canConfirm) onConfirm(calIds!, city, address);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-24">

        {/* Truck illustration */}
        <div className="mb-6">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg viewBox="0 0 80 60" className="w-20 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Truck body */}
              <rect x="2" y="20" width="46" height="26" rx="3" fill="#29B6F6"/>
              {/* Cab */}
              <path d="M48 28 L48 46 L70 46 L70 34 L62 28 Z" fill="#0288D1"/>
              {/* Cab window */}
              <path d="M52 30 L52 38 L66 38 L66 34 L60 30 Z" fill="#B3E5FC"/>
              {/* Wheels */}
              <circle cx="16" cy="47" r="6" fill="#37474F"/>
              <circle cx="16" cy="47" r="3" fill="#90A4AE"/>
              <circle cx="58" cy="47" r="6" fill="#37474F"/>
              <circle cx="58" cy="47" r="3" fill="#90A4AE"/>
              {/* Map pin */}
              <circle cx="55" cy="12" r="10" fill="#F44336"/>
              <path d="M55 5 C50.5 5 47 8.5 47 13 C47 18.5 55 24 55 24 C55 24 63 18.5 63 13 C63 8.5 59.5 5 55 5Z" fill="#E53935"/>
              <circle cx="55" cy="12" r="3" fill="white"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lang === 'en' ? 'Where are you?' : 'Où êtes-vous?'}
        </h1>
        <p className="text-sm text-orange-500 font-medium mb-6 max-w-xs leading-relaxed">
          {lang === 'en'
            ? 'Please enter your address to confirm service availability in your area.'
            : 'Veuillez entrer votre adresse pour confirmer la disponibilité du service.'}
        </p>

        {/* Input */}
        <div className="w-full max-w-sm">
          <label className="block text-left text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            {lang === 'en' ? 'Address *' : 'Adresse *'}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              // Reset result if user clears/edits
              if (calIds !== null) { setCalIds(null); setCity(''); setAddress(''); }
            }}
            placeholder={lang === 'en' ? 'Start typing your address…' : 'Commencez à saisir…'}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {/* Not served message */}
          {notServed && (
            <p className="mt-2 text-xs text-red-500 font-medium">
              {lang === 'en'
                ? `Sorry, we don't service ${city || 'that area'} yet. We serve Ottawa, Gatineau & Montreal.`
                : `Désolé, nous ne desservons pas encore ${city || 'cette région'}. Nous desservons Ottawa, Gatineau et Montréal.`}
            </p>
          )}

          {/* Served confirmation */}
          {canConfirm && (
            <p className="mt-2 text-xs text-green-600 font-semibold">
              {lang === 'en' ? `✓ We service ${city}!` : `✓ Nous desservons ${city}!`}
            </p>
          )}
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <a
            href="tel:6136124828"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {lang === 'en' ? 'Emergency' : 'Urgence'}
          </a>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-colors ${
              canConfirm
                ? 'bg-blue-700 hover:bg-blue-800 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {lang === 'en' ? 'Confirm' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
