import { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

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
        className="fixed bottom-5 right-5 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-orange-600"
      >
        Install App
      </button>
    )
  );
};

export default InstallPWA;
