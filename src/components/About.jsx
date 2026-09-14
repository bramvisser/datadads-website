import { useLanguage } from '../LanguageContext';

const VALUES = ['lasting', 'results', 'senior'];

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <h2 className="section-title" id="about-title">
        {t('aboutTitle')}
      </h2>
      <p>{t('aboutText')}</p>
      <ul className="values">
        {VALUES.map((key) => (
          <li key={key}>
            <strong>{t(`value_${key}_title`)}</strong>
            <p>{t(`value_${key}_text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
