'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [savedPasscode, setSavedPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);

  const [text, setText] = useState('');
  const [voiceCode, setVoiceCode] = useState('vi-VN-Neural2-A');
  const [isConverting, setIsConverting] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  // 1. Resolve hydration mismatch & load passcode from local storage
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('tts_app_passcode');
    if (stored) {
      setSavedPasscode(stored);
      setIsAuthenticated(true);
    }
  }, []);

  // Clean up audio URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // 2. Handle Authentication Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Vui lòng nhập mật mã truy cập.');
      return;
    }

    setIsVerifyingAuth(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tts_app_passcode', passcode.trim());
        setSavedPasscode(passcode.trim());
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Mật mã không chính xác.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  // 3. Handle Log out / Lock
  const handleLogout = () => {
    localStorage.removeItem('tts_app_passcode');
    setSavedPasscode('');
    setPasscode('');
    setIsAuthenticated(false);
    setTtsError('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
  };

  // 4. Handle Text-to-Speech conversion
  const handleSynthesize = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setTtsError('Vui lòng nhập văn bản cần chuyển đổi.');
      return;
    }

    setIsConverting(true);
    setTtsError('');
    
    // Revoke previous audio URL if any to free memory
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': savedPasscode,
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceCode: voiceCode,
        }),
      });

      if (response.status === 401) {
        // Token expired or invalid passcode
        handleLogout();
        setAuthError('Phiên làm việc hết hạn hoặc mật mã sai. Vui lòng đăng nhập lại.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi máy chủ (${response.status})`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setTtsError(err.message || 'Có lỗi xảy ra khi tạo giọng nói.');
    } finally {
      setIsConverting(false);
    }
  };

  if (!isMounted) {
    return (
      <main>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#06b6d4' }}></div>
          <p style={{ color: '#94a3b8', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Đang tải...</p>
        </div>
      </main>
    );
  }

  // --- RENDERING PASSCODE PORTAL ---
  if (!isAuthenticated) {
    return (
      <main>
        <div className="glass-container portal-card">
          <div className="portal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="display-title">Giọng Đọc Việt</h1>
          <p className="subtitle">Mục đích sử dụng nội bộ. Vui lòng nhập mật mã để truy cập ứng dụng.</p>

          <form onSubmit={handleAuthSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="passcode-input">Mật mã truy cập</label>
              <div className="input-wrapper">
                <input
                  id="passcode-input"
                  type="password"
                  className={`input-field ${authError ? 'error' : ''}`}
                  placeholder="Nhập mật mã của bạn..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isVerifyingAuth}
                />
              </div>
              {authError && (
                <div className="error-message">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={isVerifyingAuth}>
              {isVerifyingAuth ? (
                <>
                  <div className="spinner"></div>
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Xác nhận</span>
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- RENDERING MAIN DASHBOARD ---
  return (
    <main>
      <div className="glass-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-area">
            <h2>Giọng Đọc Việt</h2>
            <p>Vietnamese Voice Portal (Private Use)</p>
          </div>
          <button onClick={handleLogout} className="btn-utility" title="Đăng xuất ứng dụng">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Khóa Ứng Dụng</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSynthesize}>
          <div className="input-group">
            <label className="input-label" htmlFor="tts-textarea">Văn bản cần đọc (Tiếng Việt)</label>
            <div className="textarea-wrapper">
              <textarea
                id="tts-textarea"
                className="textarea-field"
                placeholder="Nhập nội dung văn bản tiếng Việt bạn muốn chuyển đổi thành giọng nói tại đây (tối đa 4000 ký tự)..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isConverting}
                maxLength={4000}
              />
              <span className="char-counter">{text.length} / 4000</span>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="voice-select">Giọng đọc Việt Nam (Google Cloud TTS)</label>
            <div className="select-wrapper">
              <select
                id="voice-select"
                className="select-field"
                value={voiceCode}
                onChange={(e) => setVoiceCode(e.target.value)}
                disabled={isConverting}
              >
                <optgroup label="Neural2 (Giọng đọc tự nhiên, chất lượng tốt nhất)">
                  <option value="vi-VN-Neural2-A">vi-VN-Neural2-A (Giọng Nữ - Tự nhiên, Khuyên dùng)</option>
                  <option value="vi-VN-Neural2-D">vi-VN-Neural2-D (Giọng Nam - Tự nhiên, Khuyên dùng)</option>
                </optgroup>
                <optgroup label="WaveNet (Giọng đọc trí tuệ nhân tạo chất lượng cao)">
                  <option value="vi-VN-Wavenet-A">vi-VN-Wavenet-A (Giọng Nữ - Tiêu chuẩn WaveNet)</option>
                  <option value="vi-VN-Wavenet-B">vi-VN-Wavenet-B (Giọng Nam - Tiêu chuẩn WaveNet)</option>
                  <option value="vi-VN-Wavenet-C">vi-VN-Wavenet-C (Giọng Nữ - Nhẹ nhàng)</option>
                  <option value="vi-VN-Wavenet-D">vi-VN-Wavenet-D (Giọng Nam - Đậm chất Bắc)</option>
                </optgroup>
                <optgroup label="Standard (Giọng đọc máy tiêu chuẩn)">
                  <option value="vi-VN-Standard-A">vi-VN-Standard-A (Giọng Nữ)</option>
                  <option value="vi-VN-Standard-B">vi-VN-Standard-B (Giọng Nam)</option>
                  <option value="vi-VN-Standard-C">vi-VN-Standard-C (Giọng Nữ - Nhẹ nhàng)</option>
                  <option value="vi-VN-Standard-D">vi-VN-Standard-D (Giọng Nam - Trầm ấm)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {ttsError && (
            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{ttsError}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={isConverting || !text.trim()}>
            {isConverting ? (
              <>
                <div className="spinner"></div>
                <span>Đang chuyển đổi giọng nói...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                <span>Chuyển Thành Giọng Nói</span>
              </>
            )}
          </button>
        </form>

        {/* Audio Player Component */}
        {audioUrl && (
          <div className="player-container">
            <div className="player-header">
              <span className="player-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Nghe giọng đọc</span>
              </span>
              <a
                href={audioUrl}
                download={`giong-doc-viet-${voiceCode.toLowerCase()}.mp3`}
                className="btn-utility"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="Tải xuống file âm thanh MP3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Tải Xuống MP3</span>
              </a>
            </div>
            
            <div className="audio-controls-row">
              <audio src={audioUrl} controls autoPlay className="native-audio" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
