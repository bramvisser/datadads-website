import { useLanguage } from '../LanguageContext';
import { COMPANY } from '../company';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <h2 className="section-title" id="contact-title">
        {t('contactTitle')}
      </h2>
      <p>{t('contactText')}</p>
      <div className="contact-grid">
        <div>
          <h3>{t('emailLabel')}</h3>
          <a className="contact-email" href={`mailto:${COMPANY.email}`}>
            {COMPANY.email}
          </a>
        </div>
        <div>
          <h3>{t('addressLabel')}</h3>
          <address>
            {COMPANY.street}
            <br />
            {COMPANY.postalCode} {COMPANY.city}
            <br />
            {t('country')}
          </address>
        </div>
      </div>
    </section>
  );
}
