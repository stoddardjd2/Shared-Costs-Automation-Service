import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";
export default function PwaInstallPrompt({ fixed = false }) {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleClick() {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  if (!show) return null;

  if (window.innerWidth > 1200) return null;

  if (!fixed) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Smartphone className="w-4 h-4 mr-3" />
        Install Mobile App
      </button>
    );
  }

  return (
    <button
      className={`fixed bottom-4 left-4 rounded-2xl px-4 py-2 shadow bg-blue-600 text-white`}
      onClick={handleClick}
    >
      Install App
    </button>
  );
}
