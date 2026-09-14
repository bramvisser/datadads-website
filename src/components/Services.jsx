import { useLanguage } from '../LanguageContext';

const SERVICES = [
  { key: 'engineering', icon: '⚙️' },
  { key: 'science', icon: '🤖' },
  { key: 'analytics', icon: '📈' },
  { key: 'strategy', icon: '🧭' },
];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <h2 className="section-title" id="services-title">
        {t('servicesTitle')}
      </h2>
      <p className="section-intro">{t('servicesIntro')}</p>
      <ul className="card-grid">
        {SERVICES.map(({ key, icon }) => (
          <li className="card" key={key}>
            <span className="card-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{t(`service_${key}_title`)}</h3>
            <p>{t(`service_${key}_text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
