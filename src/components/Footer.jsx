import { useLanguage } from '../LanguageContext';
import { COMPANY } from '../company';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="container site-footer">
      <span>
        © {year} {COMPANY.name}
      </span>
      <span>{t('footerTagline')}</span>
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      <span>
        {COMPANY.street}, {COMPANY.postalCode} {COMPANY.city}
      </span>
    </footer>
  );
}
