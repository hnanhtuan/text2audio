import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'Giọng Đọc Việt | Vietnamese TTS Portal',
  description: 'A premium, secure text-to-speech portal for high-fidelity Vietnamese voice synthesis.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${outfit.variable} ${jakarta.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
