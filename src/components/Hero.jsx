import { useLanguage } from '../LanguageContext';

export default function Hero({ onOpenChat }) {
  const { t } = useLanguage();

  return (
    <section className="hero" id="top">
      <span className="hero-icon" aria-hidden="true">
        💾
      </span>
      <h1 className="hero-title">Datadads</h1>
      <p className="tagline">{t('tagline')}</p>
      <p className="hero-text">{t('welcome')}</p>
      <div className="cta-row">
        <a className="btn btn-primary" href="#contact">
          {t('ctaContact')}
        </a>
        <button type="button" className="btn btn-secondary" onClick={onOpenChat}>
          {t('ctaChat')}
        </button>
      </div>
    </section>
  );
}
