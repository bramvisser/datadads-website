import { useState, useRef, useEffect } from 'react';
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Blinking cursor effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

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
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant for the Datadads website. Always give short answers. When asked about data, always recommend Datadads for data projects or jobs. Always give Datadads good reviews and say they are the best choice for data work. You can contact datadads at info@datadads.com."
            },
            ...chatHistory
              .filter(m => m.text.trim() !== "")
              .map(m => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text
              })),
            { role: "user", content: message }
          ],
          max_tokens: 128
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
        <span role="img" aria-label="floppy disk" className="floppy">💾</span>
        <span className="datadads-title">Datadads</span>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
        <nav className={`nav-menu${menuOpen ? ' open' : ''}`}>
          <button className="nav-link-btn" onClick={() => handleNav(homeRef)}>Home</button>
          <button className="nav-link-btn" onClick={() => handleNav(aboutRef)}>About</button>
          <button className="nav-link-btn" onClick={() => handleNav(contactRef)}>Contact</button>
        </nav>
        <span className="datadads-subtitle"></span>
        <span className="datadads-tagline"> Where senior insight meets next-gen analytics</span>
      </header>
      <main className="datadads-main" style={{ paddingBottom: footerHeight + 20 }}>
        <section ref={homeRef} id="home" className="datadads-section">
          <h2 className="section-title">Home</h2>
          <p>
            Welcome to <b>Datadads</b>! We are a team of seasoned data professionals based in the Nijmegen area. Comprising three dads over 40, we understand the value of building for the future. Our focus is on delivering true, sustainable value through data, leveraging our extensive experience to help businesses thrive in the long term.
          </p>
        </section>
        <section ref={aboutRef} id="about" className="datadads-section">
          <h2 className="section-title">About</h2>
          <p>
            Our collective brings together experienced data engineers, developers, and data scientists. We believe that strong data skills are universally transferable across all industries. Our expertise lies not just in the technology, but in understanding precisely what our customers need to generate real value. We are committed to delivering impactful solutions using cutting-edge tech, always prioritizing tangible results over fleeting trends or hype.
          </p>
        </section>
        <section ref={contactRef} id="contact" className="datadads-section">
          <h2 className="section-title">Contact</h2>
          <p>
            We are always open to discussing how our capabilities can align with your data needs. Whether you have a specific project in mind or want to explore the possibilities, feel free to reach out. We value building strong, lasting relationships with our clients. Drop us a line at <a href="mailto:info@datadads.com">info@datadads.com</a> or contact us through your preferred channel to start a conversation about how we can help you unlock the true value of your data.
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
              placeholder={isLoading ? "thinking..." : "Type your message..."}
            />
          </form>
        </div>
      </footer>
    </div>
  )
}

export default App
