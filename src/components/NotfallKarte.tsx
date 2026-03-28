import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import QRCode from 'qrcode';

interface NotfallKarteProps {
  shareToken: string;
  userData: {
    name: string;
    emergencyContact?: string;
    medications?: string[];
  };
}

const CARD_STYLE = {
  width: '85.6mm',
  height: '54mm',
};

const NotfallKarte = ({ shareToken, userData }: NotfallKarteProps) => {
  const { language } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const shareUrl = `https://mein-lebensanker.de/fuer-angehoerige/${shareToken}`;

  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 160,
      margin: 1,
      color: { dark: '#2C4A3E', light: '#FFFFFF' },
    }).then(setQrDataUrl);
  }, [shareUrl]);

  const t = language === 'de' ? {
    emergency: 'NOTFALLKARTE',
    contact: 'Im Notfall kontaktieren:',
    meds: 'Medikamente:',
    allInfo: 'Alle Infos:',
    backTitle: 'Wie funktioniert der QR-Code?',
    backText1: 'Scannen Sie den QR-Code mit der Kamera Ihres Smartphones.',
    backText2: 'Es öffnet sich eine sichere Übersicht mit allen wichtigen Informationen.',
    backText3: 'Die Daten werden in Echtzeit abgerufen und sind immer aktuell.',
    pinHint: 'Bitte nach PIN fragen:',
    printHint: 'Auf Kreditkartenpapier drucken und ausschneiden.',
    mobileHint: 'Für den Druck am besten auf einem Desktop-Gerät öffnen.',
  } : {
    emergency: 'EMERGENCY CARD',
    contact: 'In case of emergency contact:',
    meds: 'Medications:',
    allInfo: 'All info:',
    backTitle: 'How does the QR code work?',
    backText1: 'Scan the QR code with your smartphone camera.',
    backText2: 'A secure overview with all important information will open.',
    backText3: 'Data is retrieved in real-time and always up to date.',
    pinHint: 'Please ask for PIN:',
    printHint: 'Print on credit card paper and cut out.',
    mobileHint: 'For best printing results, open on a desktop device.',
  };

  const medsDisplay = userData.medications?.slice(0, 3) || [];
  const hasMoreMeds = (userData.medications?.length || 0) > 3;

  return (
    <div className="space-y-6">
      {/* Cards side by side */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center print:flex-row print:gap-4">
        {/* Front */}
        <div
          className="rounded-xl overflow-hidden flex-shrink-0 shadow-lg print:shadow-none"
          style={CARD_STYLE}
        >
          <div
            className="w-full h-full p-[4mm] flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #2C4A3E 0%, #437059 100%)' }}
          >
            {/* Top */}
            <div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: '14px' }}>⚓</span>
                <span
                  className="text-white font-bold"
                  style={{ fontSize: '8px', letterSpacing: '0.1em' }}
                >
                  {t.emergency}
                </span>
              </div>
              <p
                className="text-white font-sans font-bold mt-1.5"
                style={{ fontSize: '16px', lineHeight: 1.2 }}
              >
                {userData.name}
              </p>
              <div className="w-full h-px bg-white/40 mt-1.5 mb-1.5" />

              {userData.emergencyContact && (
                <div className="mb-1">
                  <p className="text-white/80" style={{ fontSize: '8px' }}>
                    {t.contact}
                  </p>
                  <p className="text-white font-bold" style={{ fontSize: '11px' }}>
                    {userData.emergencyContact}
                  </p>
                </div>
              )}

              {medsDisplay.length > 0 && (
                <div>
                  <p className="text-white/80" style={{ fontSize: '8px' }}>
                    {t.meds}
                  </p>
                  <p className="text-white/90" style={{ fontSize: '9px' }}>
                    {medsDisplay.join(', ')}{hasMoreMeds ? ', …' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-white/70" style={{ fontSize: '7px' }}>
                  {t.allInfo}
                </p>
                <p
                  className="text-white/90 truncate"
                  style={{ fontSize: '7px' }}
                >
                  mein-lebensanker.de
                </p>
              </div>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="rounded-sm bg-white p-0.5"
                  style={{ width: '80px', height: '80px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="rounded-xl overflow-hidden flex-shrink-0 shadow-lg print:shadow-none"
          style={CARD_STYLE}
        >
          <div
            className="w-full h-full p-[4mm] flex flex-col justify-between bg-white border-2"
            style={{ borderColor: '#2C4A3E' }}
          >
            <div>
              <p
                className="font-sans font-bold"
                style={{ fontSize: '11px', color: '#2C4A3E' }}
              >
                {t.backTitle}
              </p>
              <div className="mt-1.5 space-y-1">
                <p className="text-foreground" style={{ fontSize: '9px', lineHeight: 1.4 }}>
                  1. {t.backText1}
                </p>
                <p className="text-foreground" style={{ fontSize: '9px', lineHeight: 1.4 }}>
                  2. {t.backText2}
                </p>
                <p className="text-foreground" style={{ fontSize: '9px', lineHeight: 1.4 }}>
                  3. {t.backText3}
                </p>
              </div>
              <div className="mt-2 border-t border-border pt-1.5">
                <p style={{ fontSize: '9px', color: '#2C4A3E' }}>
                  {t.pinHint} <span className="border-b border-foreground inline-block" style={{ width: '60px' }}>&nbsp;</span>
                </p>
              </div>
            </div>
            <p
              className="text-center font-medium"
              style={{ fontSize: '8px', color: '#2C4A3E' }}
            >
              mein-lebensanker.de
            </p>
          </div>
        </div>
      </div>

      {/* Print hints */}
      <p className="text-center text-sm text-muted-foreground print:hidden">
        {t.printHint}
      </p>
      <p className="text-center text-xs text-muted-foreground sm:hidden print:hidden">
        {t.mobileHint}
      </p>
    </div>
  );
};

export default NotfallKarte;
