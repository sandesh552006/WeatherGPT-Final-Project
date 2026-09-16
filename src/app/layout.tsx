import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WeatherGPT – Conversational Weather Assistant',
  description: 'AI weather companion powered by Gemini & Open-Meteo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f4f7fb] text-slate-800">
        {children}
      </body>
    </html>
  );
}
