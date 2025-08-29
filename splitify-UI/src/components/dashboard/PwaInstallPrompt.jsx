import { useState, useEffect } from "react";
import { Smartphone, User } from "lucide-react";
export default function PwaInstallPrompt({ isOpen, onClose }) {
  const [deviceInfo, setDeviceInfo] = useState({
    type: "desktop",
    name: "Loading...",
    desc: "Detecting your device...",
    icon: "📱",
    supported: true,
  });

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMac = /Macintosh/.test(ua);
    const isWindows = /Windows/.test(ua);
    const isChrome = /Chrome/.test(ua);
    const isSafari = /Safari/.test(ua) && !isChrome;
    const isFirefox = /Firefox/.test(ua);
    const isEdge = /Edg/.test(ua);

    console.log("agent", ua);

    if (isIOS) {
      if (/iPad/.test(ua)) {
        return {
          type: "ios-ipad",
          name: "iPad",
          desc: "iOS Safari",
          icon: "📱",
          supported: isSafari,
        };
      } else {
        return {
          type: "ios-iphone",
          name: "iPhone",
          desc: "iOS Safari",
          icon: "📱",
          supported: isSafari,
        };
      }
    } else if (isAndroid) {
      return {
        type: "android",
        name: "Android",
        desc: isChrome ? "Chrome Browser" : "Android Browser",
        icon: "🤖",
        supported: isChrome,
      };
    } else if (isMac) {
      return {
        type: "mac",
        name: "Mac",
        desc: isChrome
          ? "Chrome Browser"
          : isSafari
          ? "Safari Browser"
          : "Desktop Browser",
        icon: "💻",
        supported: isChrome || isSafari,
      };
    } else if (isWindows) {
      return {
        type: "windows",
        name: "Windows PC",
        desc: isChrome
          ? "Chrome Browser"
          : isEdge
          ? "Edge Browser"
          : "Desktop Browser",
        icon: "💻",
        supported: isChrome || isEdge,
      };
    } else {
      return {
        type: "desktop",
        name: "Desktop",
        desc: "Web Browser",
        icon: "💻",
        supported: isChrome || isFirefox || isEdge,
      };
    }
  };
  const getInstallSteps = (deviceType) => {
    const steps = {
      "ios-iphone": [
        {
          title: "Open in Safari",
          desc: "Make sure you're viewing this page in Safari browser",
        },
        {
          title: "Tap the Share button",
          desc: ` <span>
              Look for the
             <svg class="inline w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Communication / Share_iOS_Export"> <path id="Vector" d="M9 6L12 3M12 3L15 6M12 3V13M7.00023 10C6.06835 10 5.60241 10 5.23486 10.1522C4.74481 10.3552 4.35523 10.7448 4.15224 11.2349C4 11.6024 4 12.0681 4 13V17.8C4 18.9201 4 19.4798 4.21799 19.9076C4.40973 20.2839 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07899 21 7.19691 21H16.8036C17.9215 21 18.4805 21 18.9079 20.7822C19.2842 20.5905 19.5905 20.2839 19.7822 19.9076C20 19.4802 20 18.921 20 17.8031V13C20 12.0681 19.9999 11.6024 19.8477 11.2349C19.6447 10.7448 19.2554 10.3552 18.7654 10.1522C18.3978 10 17.9319 10 17 10" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
              share icon at the bottom of your screen
            </span>`,
        },
        {
          title: 'Select "Add to Home Screen"',
          desc: 'Scroll down and tap ➕ "Add to Home Screen"',
        },
        {
          title: "Confirm installation",
          desc: 'Tap "Add" in the top right corner to install the app',
        },
      ],
      "ios-ipad": [
        {
          title: "Open in Safari",
          desc: "Make sure you're viewing this page in Safari browser",
        },
        {
          title: "Tap the Share button",
          desc: ` <span>
              Look for the
             <svg class="inline w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Communication / Share_iOS_Export"> <path id="Vector" d="M9 6L12 3M12 3L15 6M12 3V13M7.00023 10C6.06835 10 5.60241 10 5.23486 10.1522C4.74481 10.3552 4.35523 10.7448 4.15224 11.2349C4 11.6024 4 12.0681 4 13V17.8C4 18.9201 4 19.4798 4.21799 19.9076C4.40973 20.2839 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07899 21 7.19691 21H16.8036C17.9215 21 18.4805 21 18.9079 20.7822C19.2842 20.5905 19.5905 20.2839 19.7822 19.9076C20 19.4802 20 18.921 20 17.8031V13C20 12.0681 19.9999 11.6024 19.8477 11.2349C19.6447 10.7448 19.2554 10.3552 18.7654 10.1522C18.3978 10 17.9319 10 17 10" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
              share icon in the toolbar
            </span>`,
        },
        {
          title: 'Select "Add to Home Screen"',
          desc: 'Tap ➕ "Add to Home Screen" from the menu',
        },
        {
          title: "Confirm installation",
          desc: 'Tap "Add" to install the app to your home screen',
        },
      ],

      android: [
        {
          title: "Open in Chrome",
          desc: "Make sure you're viewing this page in Chrome browser",
        },
        {
          title: "Tap the menu",
          desc: "Look for the ⋮ three dots menu in the top right",
        },
        {
          title: 'Select "Add to Home screen"',
          desc: 'Tap "Add to Home screen" or "Install app" from the menu',
        },
        {
          title: "Confirm installation",
          desc: 'Tap "Add" or "Install" to add the app to your device',
        },
      ],
      mac: [
        {
          title: "Open in supported browser",
          desc: "Use Chrome or Safari for the best experience",
        },
        {
          title: "Look for install prompt",
          desc: "Check for an install button in the address bar or a popup notification",
        },
        {
          title: 'Click "Install"',
          desc: "Follow the browser prompts to install the app",
        },
        {
          title: "Access from Applications",
          desc: "The app will be available in your Applications folder and dock",
        },
      ],
      windows: [
        {
          title: "Open in supported browser",
          desc: "Use Chrome or Edge for the best installation experience",
        },
        {
          title: "Look for install option",
          desc: `  <span>
              Check for an install button
              <svg
                class="inline w-5 h-5 mx-1"
                fill="#000000"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M30.92,8H26.55a1,1,0,0,0,0,2H31V30H5V10H9.38a1,1,0,0,0,0-2H5.08A2,2,0,0,0,3,10V30a2,2,0,0,0,2.08,2H30.92A2,2,0,0,0,33,30V10A2,2,0,0,0,30.92,8Z"></path>
                <path d="M10.3,18.87l7,6.89a1,1,0,0,0,1.4,0l7-6.89a1,1,0,0,0-1.4-1.43L19,22.65V4a1,1,0,0,0-2,0V22.65l-5.3-5.21a1,1,0,0,0-1.4,1.43Z"></path>
              </svg>
              in the address bar
            </span>`,
        },
        {
          title: 'Click "Install"',
          desc: 'Click the install button or use browser menu → "Install app"',
        },
        {
          title: "Pin to taskbar",
          desc: "The app will be installed and can be pinned to your taskbar",
        },
      ],
      desktop: [
        {
          title: "Use a modern browser",
          desc: "Chrome, Firefox, or Edge work best for PWA installation",
        },
        {
          title: "Look for install prompt",
          desc: "Check your address bar for an install option",
        },
        {
          title: "Follow browser instructions",
          desc: "Each browser may have slightly different install steps",
        },
      ],
    };

    return steps[deviceType] || steps["desktop"];
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDeviceInfo(getDeviceInfo());
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = getInstallSteps(deviceInfo.type);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5 transition-opacity duration-300"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-0 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
          >
            ✕
          </button>

          <div className="w-14 h-14 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center text-2xl">
            <Smartphone className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Install App
          </h2>
          <p className="text-slate-600 text-sm">
            Add to your device for quick access
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Device Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            {/* <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              {deviceInfo.icon}
            </div> */}
            <User className="w-9 h-9 p-1 bg-blue-600 text-white rounded-xl" />

            <div className="flex-1">
              <div className="font-medium text-slate-900 text-sm">
                {deviceInfo.name}
              </div>
              <div className="text-slate-600 text-xs mt-0.5">
                {deviceInfo.desc}
              </div>
            </div>
          </div>

          {/* Install Steps */}
          {!deviceInfo.supported ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4 opacity-50">⚠️</div>
              <h3 className="font-medium text-slate-900 mb-2">
                Installation Not Available
              </h3>
              <p className="text-slate-600 text-sm">
                PWA installation is not supported in your current browser. Try
                using Chrome, Safari, or Edge for the best experience.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1 text-sm">
                      {step.title}
                    </div>
                    <div
                      className="text-slate-600 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: step.desc }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
