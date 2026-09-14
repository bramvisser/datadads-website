import { useState } from 'react';
import './App.css';
import { useLanguage } from './LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ChatDock from './components/ChatDock';

export default function App() {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main" className="container">
        <Hero onOpenChat={() => setChatOpen(true)} />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
      <ChatDock open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
