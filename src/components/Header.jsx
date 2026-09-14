import { useLanguage } from '../LanguageContext';

const LANGS = ['en', 'nl'];

export default function Header() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="container site-header">
      <a className="brand" href="#top">
        <span className="brand-icon" aria-hidden="true">
          💾
        </span>
        Datadads
      </a>

      <nav className="nav" aria-label={t('mainNav')}>
        <a href="#services">{t('services')}</a>
        <a href="#about">{t('about')}</a>
        <a href="#contact">{t('contact')}</a>
      </nav>

      <div className="lang-switch" role="group" aria-label={t('language')}>
        {LANGS.map((code) => (
          <button
            key={code}
            type="button"
            className="lang-btn"
            aria-pressed={language === code}
            onClick={() => setLanguage(code)}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
