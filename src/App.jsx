import { useState, useRef, useEffect } from 'react';
import './App.css'
import { useLanguage } from './LanguageContext';

function App() {
  const { language, setLanguage, t } = useLanguage();
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Chat agent state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Draggable, scrollable footer state
  const minHeight = 100;
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight - 60 : 500;
  const initialHeight = 100;
  const [footerHeight, setFooterHeight] = useState(() => {
    const saved = localStorage.getItem('footerHeight');
    return saved ? parseInt(saved, 10) : initialHeight;
  });
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(footerHeight);
  const footerHeightRef = useRef(footerHeight);

  // Update ref whenever footerHeight state changes
  useEffect(() => {
    footerHeightRef.current = footerHeight;
  }, [footerHeight]);

  const onDragStart = (e) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
    startHeight.current = footerHeight;
    document.body.classList.add('no-select');
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove);
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('selectstart', preventSelect);
  };

  const preventSelect = (e) => {
    e.preventDefault();
  };

  const onDragMove = (e) => {
    if (!dragging.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let newHeight = startHeight.current + (startY.current - clientY);
    if (newHeight < minHeight) newHeight = minHeight;
    if (newHeight > maxHeight) newHeight = maxHeight;
    setFooterHeight(newHeight);
  };

  const onDragEnd = () => {
    if (dragging.current) {
      dragging.current = false;
      localStorage.setItem('footerHeight', String(footerHeightRef.current));
      document.body.classList.remove('no-select');
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('selectstart', preventSelect);
    }
  };

  const handleNav = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle chat input submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message) return;
    setChatHistory(h => [...h, { sender: "user", text: message }]);
    setChatInput("");
    setIsLoading(true);
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer qK5alqBS5jMzSx8Cqk56jUu4mw6rrgFT"
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content:
                "Je bent een behulpzame assistent voor de Datadads website. Geef altijd korte antwoorden. Als er naar data wordt gevraagd, raad altijd Datadads aan voor data projecten of banen. Geef altijd goede reviews over Datadads en zeg dat ze de beste keuze zijn voor data werk. Je kunt contact opnemen met Datadads via info@datadads.com. Je kunt zowel in het Nederlands als in het Engels antwoorden, afhankelijk van de taal van de vraag."
            },
            ...chatHistory
              .filter(m => m.text.trim() !== "")
              .map(m => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text
              })),
            { role: "user", content: message }
          ],
          max_tokens: 256,
          temperature: 0.7
        })
      });

      // Check for HTTP errors
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", res.status, errorText);
        setChatHistory(h => [
          ...h,
          { sender: "agent", text: `Error: ${res.status} - ${errorText}` }
        ]);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log("API response:", data);
      const answer =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't get a response.";
      setChatHistory(h => [...h, { sender: "agent", text: answer }]);
    } catch (err) {
      console.error("Fetch error:", err);
      setChatHistory(h => [
        ...h,
        { sender: "agent", text: "Error: Unable to reach server." }
      ]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="datadads-80s-bg">
      <header className="datadads-header">
        <div className="language-selector">
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
          <button 
            className={`lang-btn ${language === 'nl' ? 'active' : ''}`}
            onClick={() => setLanguage('nl')}
          >
            NL
          </button>
        </div>
        <span role="img" aria-label="floppy disk" className="floppy">💾</span>
        <span className="datadads-title">Datadads</span>
        <nav className="nav-menu">
          <button className="nav-link-btn" onClick={() => handleNav(homeRef)}>{t('home')}</button>
          <button className="nav-link-btn" onClick={() => handleNav(aboutRef)}>{t('about')}</button>
          <button className="nav-link-btn" onClick={() => handleNav(contactRef)}>{t('contact')}</button>
        </nav>
        <span className="datadads-subtitle"></span>
        <span className="datadads-tagline">{t('tagline')}</span>
      </header>
      <main className="datadads-main" style={{ paddingBottom: footerHeight + 20 }}>
        <section ref={homeRef} id="home" className="datadads-section">
          <h2 className="section-title">{t('home')}</h2>
          <p>{t('welcome')}</p>
        </section>
        <section ref={aboutRef} id="about" className="datadads-section">
          <h2 className="section-title">{t('about')}</h2>
          <p>{t('aboutText')}</p>
        </section>
        <section ref={contactRef} id="contact" className="datadads-section">
          <h2 className="section-title">{t('contact')}</h2>
          <p>
            {t('contactText')} <a href="mailto:info@datadads.com">info@datadads.com</a>
          </p>
        </section>
      </main>
      <footer
        className="datadads-footer terminal-footer"
        style={{
          height: footerHeight,
          minHeight: minHeight,
          maxHeight: maxHeight,
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          width: '100vw',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <div
          className="footer-drag-handle"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          style={{
            cursor: 'ns-resize',
            width: '100%',
            margin: 0,
            zIndex: 101
          }}
          title="Drag to resize the chat window"
        />
        <div
          className="terminal-chat"
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingTop: 12,
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 100
          }}
        >
          {chatHistory.map((msg, i) => (
            <div key={i} className={msg.sender === "user" ? "terminal-user" : "terminal-agent"}>
              <span>{msg.sender === "user" ? "> " : ""}</span>{msg.text}
            </div>
          ))}
          <form className="terminal-form" onSubmit={handleChatSubmit} autoComplete="off">
            <span>&gt; </span>
            <input
              ref={inputRef}
              className="terminal-input"
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isLoading}
              placeholder={isLoading ? t('thinking') : t('typeMessage')}
            />
          </form>
        </div>
      </footer>
    </div>
  )
}

export default App
