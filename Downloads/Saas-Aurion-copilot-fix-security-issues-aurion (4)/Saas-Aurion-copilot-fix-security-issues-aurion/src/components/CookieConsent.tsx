import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier immédiatement si l'utilisateur a déjà vu le popup
    const hasSeenCookiePopup = localStorage.getItem('cookie-consent-seen');

    if (hasSeenCookiePopup) {
      return; // Ne pas afficher le popup
    }

    // Si pas encore vu, afficher après le délai
    const timer = setTimeout(() => {
      // Vérifier encore une fois au cas où l'utilisateur aurait accepté entre temps
      const stillNotSeen = !localStorage.getItem('cookie-consent-seen');
      if (stillNotSeen) {
        setIsVisible(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent-seen', 'true');
    localStorage.setItem('cookie-settings', JSON.stringify({
      preferences: true,
      analytics: true,
      advertising: true,
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent-seen', 'true');
    localStorage.setItem('cookie-settings', JSON.stringify({
      preferences: false,
      analytics: false,
      advertising: false,
    }));
    setIsVisible(false);
  };

  const handlePreferences = () => {
    // Pour l'instant, on accepte tout quand on clique sur Preferences
    // Dans une vraie implémentation, cela ouvrirait une modale de préférences détaillées
    handleAcceptAll();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[460px] p-6 md:p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <h2 className="text-lg font-medium text-gray-900">AURION AI</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Text */}
          <div className="mb-8">
            <p className="text-[15px] text-gray-600 leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Accept All Button */}
            <button
              onClick={handleAcceptAll}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-[12px] h-[48px]"
              style={{ transition: 'none' }}
            >
              Accept All
            </button>

            {/* Secondary Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-[10px] h-[44px]"
              >
                Reject All
              </button>
              <button
                onClick={handlePreferences}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-[10px] h-[44px]"
              >
                Preferences
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Powered by CookieGuard
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
