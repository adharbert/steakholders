import React, { useState } from "react";
import { Home, BookOpen, Users, Star, Flame, ChevronRight, MapPin, Calendar, DollarSign, Plus, Check } from "lucide-react";

export default function SteakholdersMeatup() {
  const [activeTab, setActiveTab] = useState("home");
  const [reviewStep, setReviewStep] = useState(null); // null | "form" | "submitted"
  const [ratings, setRatings] = useState({ doneness: 0, flavor: 0, tenderness: 0, value: 0 });
  const [notes, setNotes] = useState("");

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');
  `;

  const styles = `
    ${fonts}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0604; }
    .phone-frame {
      width: 390px;
      max-width: 100%;
      margin: 24px auto;
      background: #120907;
      border-radius: 44px;
      border: 10px solid #1a1210;
      box-shadow: 0 60px 120px -40px rgba(120, 20, 10, 0.4), 0 30px 60px -30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(180, 100, 80, 0.15);
      overflow: hidden;
      position: relative;
      min-height: 844px;
      font-family: 'Cormorant Garamond', serif;
      color: #e8dcc8;
    }
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 28px 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: #e8dcc8;
    }
    .status-right { display: flex; gap: 6px; align-items: center; }
    .notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      height: 28px;
      background: #000;
      border-radius: 0 0 18px 18px;
    }
    .screen {
      padding: 8px 0 100px;
      min-height: 800px;
      background:
        radial-gradient(ellipse at top right, rgba(139, 30, 20, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(90, 45, 30, 0.12) 0%, transparent 50%),
        linear-gradient(180deg, #120907 0%, #0a0604 100%);
    }
    .grain {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.04;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay;
    }
    .header {
      padding: 20px 28px 24px;
      border-bottom: 1px solid rgba(180, 100, 80, 0.12);
    }
    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-mark {
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-style: italic;
      font-size: 13px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #c9a678;
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b1e14 0%, #5a1008 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      color: #f4e8d0;
      font-size: 14px;
      border: 2px solid rgba(201, 166, 120, 0.3);
    }
    .greeting {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #f4e8d0;
      margin-top: 20px;
      line-height: 1.1;
      letter-spacing: -0.01em;
    }
    .greeting em {
      font-style: italic;
      color: #c9a678;
      font-weight: 900;
    }
    .subgreet {
      font-size: 15px;
      color: rgba(232, 220, 200, 0.55);
      margin-top: 6px;
      font-style: italic;
    }
    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(201, 166, 120, 0.7);
      padding: 24px 28px 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-label::after {
      content: "";
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(201, 166, 120, 0.3), transparent);
    }
    .upcoming-card {
      margin: 0 24px;
      background: linear-gradient(135deg, #1a0e0a 0%, #241310 100%);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(201, 166, 120, 0.15);
      position: relative;
    }
    .upcoming-hero {
      height: 140px;
      background:
        linear-gradient(180deg, transparent 40%, rgba(18, 9, 7, 0.95) 100%),
        radial-gradient(circle at 30% 40%, #6b1810 0%, #2a0c06 70%);
      position: relative;
      overflow: hidden;
    }
    .flame-icon {
      position: absolute;
      top: 16px;
      right: 20px;
      background: rgba(10, 6, 4, 0.6);
      backdrop-filter: blur(10px);
      border-radius: 100px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.15em;
      color: #e8b87a;
      border: 1px solid rgba(201, 166, 120, 0.2);
    }
    .marbling {
      position: absolute;
      inset: 0;
      opacity: 0.4;
      background-image:
        radial-gradient(ellipse 40px 10px at 25% 35%, rgba(244, 232, 208, 0.6), transparent),
        radial-gradient(ellipse 25px 8px at 60% 60%, rgba(244, 232, 208, 0.4), transparent),
        radial-gradient(ellipse 55px 12px at 75% 30%, rgba(244, 232, 208, 0.5), transparent),
        radial-gradient(ellipse 30px 6px at 40% 75%, rgba(244, 232, 208, 0.3), transparent);
    }
    .upcoming-body { padding: 20px 24px 24px; }
    .date-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.2em;
      color: #c9a678;
      margin-bottom: 10px;
    }
    .restaurant-name {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: #f4e8d0;
      line-height: 1.1;
    }
    .restaurant-location {
      font-size: 14px;
      color: rgba(232, 220, 200, 0.6);
      margin-top: 4px;
      font-style: italic;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .attendees {
      display: flex;
      align-items: center;
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px dashed rgba(201, 166, 120, 0.15);
    }
    .avatar-stack { display: flex; }
    .avatar-stack .avatar {
      width: 32px;
      height: 32px;
      margin-left: -8px;
      font-size: 12px;
      border: 2px solid #1a0e0a;
    }
    .avatar-stack .avatar:first-child { margin-left: 0; }
    .avatar-blue { background: linear-gradient(135deg, #2a4a5c 0%, #15262e 100%); }
    .avatar-green { background: linear-gradient(135deg, #3d5a3a 0%, #1e2d1c 100%); }
    .avatar-gold { background: linear-gradient(135deg, #c9a678 0%, #7a6345 100%); color: #1a0e0a; }
    .attendee-count {
      margin-left: 12px;
      font-size: 13px;
      color: rgba(232, 220, 200, 0.7);
    }
    .attendee-count strong { color: #f4e8d0; font-weight: 500; }
    .rsvp-btn {
      margin-left: auto;
      background: #c9a678;
      color: #1a0e0a;
      border: none;
      padding: 8px 16px;
      border-radius: 100px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.2em;
      font-weight: 600;
      cursor: pointer;
    }
    .stats-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      padding: 0 24px;
    }
    .stat-card {
      background: rgba(26, 14, 10, 0.6);
      border: 1px solid rgba(201, 166, 120, 0.1);
      border-radius: 14px;
      padding: 14px 12px;
      text-align: center;
    }
    .stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 900;
      color: #c9a678;
      font-style: italic;
      line-height: 1;
    }
    .stat-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(232, 220, 200, 0.5);
      margin-top: 6px;
    }
    .review-item {
      display: flex;
      gap: 16px;
      padding: 16px 28px;
      border-bottom: 1px solid rgba(201, 166, 120, 0.08);
      cursor: pointer;
    }
    .review-thumb {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      flex-shrink: 0;
      background: radial-gradient(circle at 40% 40%, #6b1810 0%, #2a0c06 70%);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(201, 166, 120, 0.1);
    }
    .review-thumb .marbling {
      background-image:
        radial-gradient(ellipse 20px 5px at 30% 40%, rgba(244, 232, 208, 0.6), transparent),
        radial-gradient(ellipse 15px 4px at 60% 60%, rgba(244, 232, 208, 0.4), transparent);
    }
    .review-content { flex: 1; min-width: 0; }
    .review-title {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      font-weight: 700;
      color: #f4e8d0;
      line-height: 1.2;
    }
    .review-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      color: rgba(201, 166, 120, 0.6);
      margin-top: 4px;
      text-transform: uppercase;
    }
    .review-score {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
    }
    .score-num {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 900;
      color: #c9a678;
      font-style: italic;
    }
    .score-num span { font-size: 12px; color: rgba(201, 166, 120, 0.5); }
    .review-desc {
      font-size: 14px;
      color: rgba(232, 220, 200, 0.7);
      margin-top: 6px;
      font-style: italic;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .nav-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(10, 6, 4, 0.85);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(201, 166, 120, 0.15);
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      padding: 14px 0 28px;
    }
    .nav-item {
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: rgba(232, 220, 200, 0.4);
      cursor: pointer;
      padding: 6px;
      transition: color 0.2s;
    }
    .nav-item.active { color: #c9a678; }
    .nav-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    /* Review form */
    .review-form { padding: 0 28px; }
    .meat-hero {
      margin: 0 24px 24px;
      height: 180px;
      border-radius: 20px;
      background:
        linear-gradient(180deg, transparent 30%, rgba(10,6,4,0.9) 100%),
        radial-gradient(circle at 50% 40%, #8b2418 0%, #3a1008 60%, #1a0604 100%);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(201, 166, 120, 0.2);
    }
    .meat-hero .marbling {
      opacity: 0.5;
      background-image:
        radial-gradient(ellipse 60px 14px at 25% 35%, rgba(244, 232, 208, 0.6), transparent),
        radial-gradient(ellipse 40px 10px at 60% 55%, rgba(244, 232, 208, 0.4), transparent),
        radial-gradient(ellipse 80px 16px at 75% 30%, rgba(244, 232, 208, 0.5), transparent),
        radial-gradient(ellipse 50px 12px at 40% 75%, rgba(244, 232, 208, 0.3), transparent);
    }
    .meat-hero-label {
      position: absolute;
      bottom: 20px;
      left: 24px;
      right: 24px;
    }
    .meat-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 900;
      color: #f4e8d0;
      line-height: 1;
    }
    .meat-hero-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.25em;
      color: #c9a678;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 0;
      border-bottom: 1px dashed rgba(201, 166, 120, 0.12);
    }
    .rating-label {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      font-style: italic;
      color: #f4e8d0;
    }
    .stars { display: flex; gap: 4px; }
    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: rgba(201, 166, 120, 0.25);
      transition: color 0.15s;
    }
    .star-btn.filled { color: #c9a678; }
    .notes-field {
      width: 100%;
      margin-top: 16px;
      background: rgba(26, 14, 10, 0.6);
      border: 1px solid rgba(201, 166, 120, 0.15);
      border-radius: 12px;
      padding: 14px;
      color: #e8dcc8;
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      resize: none;
      min-height: 80px;
      font-style: italic;
    }
    .notes-field:focus { outline: none; border-color: rgba(201, 166, 120, 0.4); }
    .notes-field::placeholder { color: rgba(232, 220, 200, 0.3); }
    .submit-btn {
      width: 100%;
      margin-top: 20px;
      background: linear-gradient(135deg, #8b1e14 0%, #5a1008 100%);
      color: #f4e8d0;
      border: 1px solid rgba(201, 166, 120, 0.3);
      padding: 16px;
      border-radius: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.25em;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #c9a678;
      background: none;
      border: none;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.2em;
      cursor: pointer;
      padding: 20px 28px 8px;
      text-transform: uppercase;
    }
    .overall {
      text-align: center;
      padding: 24px 28px 16px;
    }
    .overall-num {
      font-family: 'Playfair Display', serif;
      font-size: 56px;
      font-weight: 900;
      font-style: italic;
      color: #c9a678;
      line-height: 1;
    }
    .overall-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.3em;
      color: rgba(232, 220, 200, 0.5);
      text-transform: uppercase;
      margin-top: 6px;
    }
    /* Members/split view */
    .bill-header {
      margin: 0 24px;
      padding: 24px;
      background: linear-gradient(135deg, #1a0e0a 0%, #241310 100%);
      border-radius: 20px;
      border: 1px solid rgba(201, 166, 120, 0.15);
      text-align: center;
    }
    .bill-total {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 900;
      color: #f4e8d0;
      font-style: italic;
      letter-spacing: -0.02em;
    }
    .bill-total .currency { color: #c9a678; font-size: 32px; vertical-align: super; font-weight: 700; }
    .bill-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.25em;
      color: rgba(201, 166, 120, 0.7);
      margin-top: 8px;
      text-transform: uppercase;
    }
    .split-row {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      color: rgba(232, 220, 200, 0.7);
      margin-top: 14px;
      font-style: italic;
    }
    .split-row strong { color: #c9a678; font-weight: 900; font-size: 20px; }
    .member-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 28px;
      border-bottom: 1px solid rgba(201, 166, 120, 0.08);
    }
    .member-name {
      font-family: 'Playfair Display', serif;
      font-size: 17px;
      color: #f4e8d0;
      font-weight: 500;
    }
    .member-role {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      color: rgba(201, 166, 120, 0.6);
      text-transform: uppercase;
      margin-top: 3px;
    }
    .paid-badge {
      margin-left: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      color: #7a9a5c;
      background: rgba(122, 154, 92, 0.1);
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid rgba(122, 154, 92, 0.25);
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pending-badge {
      margin-left: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      color: rgba(232, 220, 200, 0.4);
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid rgba(232, 220, 200, 0.15);
      text-transform: uppercase;
    }
    /* submitted state */
    .submitted-wrap {
      padding: 80px 40px;
      text-align: center;
    }
    .check-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a678 0%, #7a6345 100%);
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a0e0a;
    }
    .submitted-title {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 900;
      font-style: italic;
      color: #f4e8d0;
      line-height: 1.1;
    }
    .submitted-sub {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px;
      color: rgba(232, 220, 200, 0.6);
      margin-top: 14px;
      font-style: italic;
    }
    .divider-ornament {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 0;
      color: rgba(201, 166, 120, 0.4);
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      letter-spacing: 0.5em;
    }
  `;

  const Star = ({ filled, onClick }) => (
    <button className={`star-btn ${filled ? 'filled' : ''}`} onClick={onClick}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l2.84 6.48L22 9.53l-5.25 4.98L18.18 22 12 18.27 5.82 22l1.43-7.49L2 9.53l7.16-1.05L12 2z" />
      </svg>
    </button>
  );

  const renderStars = (key) => (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} filled={ratings[key] >= n} onClick={() => setRatings({ ...ratings, [key]: n })} />
      ))}
    </div>
  );

  const avg = Object.values(ratings).filter(v => v > 0).length > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).filter(v => v > 0).length).toFixed(1)
    : "—";

  return (
    <div style={{ background: "#0a0604", minHeight: "100vh", padding: "20px 12px" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="phone-frame">
        <div className="notch" />
        <div className="grain" />
        <div className="status-bar">
          <span>9:41</span>
          <span className="status-right">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M1 7h2v3H1zM5 5h2v5H5zM9 3h2v7H9zM13 1h2v9h-2z"/></svg>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="1" y="3" width="12" height="6" rx="1"/><rect x="2" y="4" width="10" height="4" fill="currentColor"/><rect x="14" y="5" width="1" height="2" fill="currentColor"/></svg>
          </span>
        </div>

        <div className="screen">
          {activeTab === "home" && reviewStep === null && (
            <>
              <div className="header">
                <div className="brand-row">
                  <div className="brand-mark">Steakholders · Meatup</div>
                  <div className="avatar">K</div>
                </div>
                <div className="greeting">Good evening, <em>Katie</em></div>
                <div className="subgreet">Your next cut awaits.</div>
              </div>

              <div className="section-label">Upcoming Meatup</div>
              <div className="upcoming-card">
                <div className="upcoming-hero">
                  <div className="marbling" />
                  <div className="flame-icon">
                    <Flame size={11} /> PRIME
                  </div>
                </div>
                <div className="upcoming-body">
                  <div className="date-chip">
                    <Calendar size={11} /> FRI · MAY 15 · 7:30 PM
                  </div>
                  <div className="restaurant-name">Bern's Steak House</div>
                  <div className="restaurant-location">
                    <MapPin size={13} /> Tampa, Florida
                  </div>
                  <div className="attendees">
                    <div className="avatar-stack">
                      <div className="avatar">K</div>
                      <div className="avatar avatar-blue">A</div>
                      <div className="avatar avatar-green">J</div>
                      <div className="avatar avatar-gold">M</div>
                    </div>
                    <div className="attendee-count">
                      <strong>6 shareholders</strong> confirmed
                    </div>
                    <button className="rsvp-btn">GOING</button>
                  </div>
                </div>
              </div>

              <div className="section-label">The Ledger</div>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-num">14</div>
                  <div className="stat-label">Meatups</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">4.2</div>
                  <div className="stat-label">Avg Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">$847</div>
                  <div className="stat-label">Your Spend</div>
                </div>
              </div>

              <div className="section-label">Recent Reviews</div>
              <div className="review-item" onClick={() => { setActiveTab("review"); setReviewStep("form"); }}>
                <div className="review-thumb"><div className="marbling" /></div>
                <div className="review-content">
                  <div className="review-title">Dry-Aged Ribeye</div>
                  <div className="review-meta">ANDY · BERN'S · 22 OZ</div>
                  <div className="review-desc">Crust was mesmerizing, interior a touch past medium-rare but forgivable at this marbling.</div>
                </div>
                <div className="review-score">
                  <div className="score-num">4.6<span>/5</span></div>
                </div>
              </div>
              <div className="review-item">
                <div className="review-thumb"><div className="marbling" /></div>
                <div className="review-content">
                  <div className="review-title">Tomahawk, Bone-In</div>
                  <div className="review-meta">JORDAN · COWBOY · 38 OZ</div>
                  <div className="review-desc">A theatrical cut. Sharing portions generously, though the char crossed into bitter.</div>
                </div>
                <div className="review-score">
                  <div className="score-num">3.9<span>/5</span></div>
                </div>
              </div>
              <div className="review-item">
                <div className="review-thumb"><div className="marbling" /></div>
                <div className="review-content">
                  <div className="review-title">Wagyu Filet</div>
                  <div className="review-meta">MARCUS · A5 · 6 OZ</div>
                  <div className="review-desc">Buttery beyond reason. Small portion but one of the finest bites of the year.</div>
                </div>
                <div className="review-score">
                  <div className="score-num">4.9<span>/5</span></div>
                </div>
              </div>
            </>
          )}

          {activeTab === "review" && reviewStep === "form" && (
            <>
              <button className="back-link" onClick={() => { setActiveTab("home"); setReviewStep(null); }}>
                ← BACK
              </button>
              <div className="meat-hero">
                <div className="marbling" />
                <div className="meat-hero-label">
                  <div className="meat-hero-sub">YOUR ORDER · 22 OZ</div>
                  <div className="meat-hero-title">Dry-Aged Ribeye</div>
                </div>
              </div>

              <div className="overall">
                <div className="overall-num">{avg}</div>
                <div className="overall-label">Overall Score</div>
              </div>

              <div className="review-form">
                <div className="rating-row">
                  <div className="rating-label">Doneness</div>
                  {renderStars("doneness")}
                </div>
                <div className="rating-row">
                  <div className="rating-label">Flavor</div>
                  {renderStars("flavor")}
                </div>
                <div className="rating-row">
                  <div className="rating-label">Tenderness</div>
                  {renderStars("tenderness")}
                </div>
                <div className="rating-row">
                  <div className="rating-label">Value</div>
                  {renderStars("value")}
                </div>

                <div className="divider-ornament">· · ·</div>

                <textarea
                  className="notes-field"
                  placeholder="Tasting notes... What did the crust tell you?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button className="submit-btn" onClick={() => setReviewStep("submitted")}>
                  Commit Review
                </button>
              </div>
            </>
          )}

          {reviewStep === "submitted" && (
            <div className="submitted-wrap">
              <div className="check-circle">
                <Check size={40} strokeWidth={3} />
              </div>
              <div className="submitted-title">Review <em style={{ color: "#c9a678" }}>committed.</em></div>
              <div className="submitted-sub">
                Your cut is in the ledger. The shareholders will see it at the next meatup.
              </div>
              <button className="submit-btn" style={{ marginTop: 32 }} onClick={() => { setReviewStep(null); setActiveTab("home"); setRatings({ doneness: 0, flavor: 0, tenderness: 0, value: 0 }); setNotes(""); }}>
                Return Home
              </button>
            </div>
          )}

          {activeTab === "archive" && (
            <>
              <div className="header">
                <div className="greeting">The <em>Archive</em></div>
                <div className="subgreet">Every cut, every verdict.</div>
              </div>
              {[
                { name: "Peter Luger", loc: "Brooklyn, NY", date: "MAR 12", score: "4.4", cut: "Porterhouse for Two" },
                { name: "Gibsons Bar & Steakhouse", loc: "Chicago, IL", date: "JAN 20", score: "4.2", cut: "Chicago Cut Ribeye" },
                { name: "The Capital Grille", loc: "Orlando, FL", date: "NOV 08", score: "3.8", cut: "Dry Aged NY Strip" },
                { name: "Ruth's Chris", loc: "Jacksonville, FL", date: "SEP 14", score: "3.5", cut: "Cowboy Ribeye" },
                { name: "St. Elmo Steak House", loc: "Indianapolis, IN", date: "JUL 22", score: "4.7", cut: "Filet Mignon" },
              ].map((r, i) => (
                <div className="review-item" key={i}>
                  <div className="review-thumb"><div className="marbling" /></div>
                  <div className="review-content">
                    <div className="review-title">{r.name}</div>
                    <div className="review-meta">{r.date} · {r.loc}</div>
                    <div className="review-desc">{r.cut}</div>
                  </div>
                  <div className="review-score">
                    <div className="score-num">{r.score}<span>/5</span></div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "split" && (
            <>
              <div className="header">
                <div className="greeting">The <em>Bill</em></div>
                <div className="subgreet">Bern's · May 15</div>
              </div>
              <div className="bill-header">
                <div className="bill-total"><span className="currency">$</span>1,284<span style={{ fontSize: 32, color: "#c9a678" }}>.50</span></div>
                <div className="bill-sub">Total · Tax + 22% Tip Included</div>
                <div className="split-row">
                  Split between 6 → <strong>$214.08 each</strong>
                </div>
              </div>

              <div className="section-label">Shareholders</div>
              {[
                { name: "Katie", role: "President", paid: true, color: "" },
                { name: "Andy", role: "Founder", paid: true, color: "avatar-blue" },
                { name: "Jordan", role: "Treasurer", paid: true, color: "avatar-green" },
                { name: "Marcus", role: "Grill Master", paid: false, color: "avatar-gold" },
                { name: "Priya", role: "Notes Keeper", paid: false, color: "avatar-blue" },
                { name: "Chris", role: "Sommelier", paid: true, color: "avatar-green" },
              ].map((m, i) => (
                <div className="member-item" key={i}>
                  <div className={`avatar ${m.color}`}>{m.name[0]}</div>
                  <div>
                    <div className="member-name">{m.name}</div>
                    <div className="member-role">{m.role}</div>
                  </div>
                  {m.paid ? (
                    <div className="paid-badge"><Check size={10} /> PAID</div>
                  ) : (
                    <div className="pending-badge">PENDING</div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="nav-bar">
          <button className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => { setActiveTab("home"); setReviewStep(null); }}>
            <Home size={20} />
            <span className="nav-label">Home</span>
          </button>
          <button className={`nav-item ${activeTab === "archive" ? "active" : ""}`} onClick={() => { setActiveTab("archive"); setReviewStep(null); }}>
            <BookOpen size={20} />
            <span className="nav-label">Archive</span>
          </button>
          <button className={`nav-item ${activeTab === "review" && reviewStep === "form" ? "active" : ""}`} onClick={() => { setActiveTab("review"); setReviewStep("form"); }}>
            <Plus size={20} />
            <span className="nav-label">Review</span>
          </button>
          <button className={`nav-item ${activeTab === "split" ? "active" : ""}`} onClick={() => { setActiveTab("split"); setReviewStep(null); }}>
            <Users size={20} />
            <span className="nav-label">Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
