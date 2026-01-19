import { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(true);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  return (
    showInstallButton && (
      <button
        onClick={handleInstallClick}
        className="px-7 py-3.5 bg-green-500 text-white text-base md:text-lg poppins-semibold rounded-2xl shadow-[0_18px_40px_rgba(96,165,250,0.55)] hover:bg-green-600 hover:shadow-[0_22px_55px_rgba(96,165,250,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        Install App
      </button>
    )
  );
};

export default InstallPWA;
