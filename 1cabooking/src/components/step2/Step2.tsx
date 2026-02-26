import { EXTRAS } from '../../data/extras';
import { useLang } from '../../context/LanguageContext';
import ExtraCard from './ExtraCard';

interface Props {
  selectedExtras: Record<string, number>;
  onExtrasChange: (extras: Record<string, number>) => void;
}

export default function Step2({ selectedExtras, onExtrasChange }: Props) {
  const { lang } = useLang();

  const handleAdd = (id: string, hasQty: boolean) => {
    onExtrasChange({ ...selectedExtras, [id]: hasQty ? 1 : 1 });
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (qty === 0) {
      const next = { ...selectedExtras };
      delete next[id];
      onExtrasChange(next);
    } else {
      onExtrasChange({ ...selectedExtras, [id]: qty });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {lang === 'en' ? '2. Select Extra Services (Optional)' : '2. Sélectionner des services supplémentaires (facultatif)'}
      </h2>

      {/* Bundle value pricing banner */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
        <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold">+</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">
            {lang === 'en' ? 'BUNDLE VALUE PRICING' : 'PRIX FORFAIT GROUPÉ'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {lang === 'en'
              ? 'Rates shown are locked for this specific primary service.'
              : 'Les tarifs affichés sont fixés pour ce service principal spécifique.'}
          </p>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXTRAS.map((extra) => (
          <ExtraCard
            key={extra.id}
            extra={extra}
            quantity={selectedExtras[extra.id] ?? 0}
            onAdd={() => handleAdd(extra.id, extra.hasQuantity)}
            onQuantityChange={(qty) => handleQtyChange(extra.id, qty)}
          />
        ))}
      </div>
    </div>
  );
}
