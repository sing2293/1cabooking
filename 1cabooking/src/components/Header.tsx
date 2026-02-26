import { useLang } from '../context/LanguageContext';

export default function Header() {
  const { lang, setLang } = useLang();

  return (
    <header className="bg-white border-b-2 border-blue-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/1CleanAir_LogoBilingue.png"
            alt="1 Clean Air"
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Language Toggle */}
        <div className="flex items-center border border-gray-300 rounded overflow-hidden text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 transition-colors ${
              lang === 'en'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm">🇬🇧</span> EN
          </button>
          <div className="w-px h-5 sm:h-6 bg-gray-300" />
          <button
            onClick={() => setLang('fr')}
            className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 transition-colors ${
              lang === 'fr'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm">🇫🇷</span> FR
          </button>
        </div>
      </div>
    </header>
  );
}
