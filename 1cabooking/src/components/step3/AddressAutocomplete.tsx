import { useRef, useEffect } from 'react';
import { SHORT_TO_PROVINCE } from '../../data/step3Options';

/* Minimal Google Maps types — avoids a full @types/google.maps install */
declare global {
  interface Window {
    googleMapsReady?: boolean;
  }
}

interface Props {
  value: string;
  onChange: (address: string, province?: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({ value, onChange, placeholder, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      const g = (window as any).google;
      if (!inputRef.current || !g?.maps?.places) return;

      const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ca' },
        types: ['address'],
        fields: ['formatted_address', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place?.formatted_address) return;

        let province = '';
        (place.address_components ?? []).forEach((comp: any) => {
          if (comp.types.includes('administrative_area_level_1')) {
            province = SHORT_TO_PROVINCE[comp.short_name] ?? comp.long_name;
          }
        });

        onChange(place.formatted_address, province || undefined);
      });
    };

    if ((window as any).google?.maps?.places) {
      initAutocomplete();
    } else {
      window.addEventListener('googleMapsLoaded', initAutocomplete, { once: true });
    }

    return () => {
      window.removeEventListener('googleMapsLoaded', initAutocomplete);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}
