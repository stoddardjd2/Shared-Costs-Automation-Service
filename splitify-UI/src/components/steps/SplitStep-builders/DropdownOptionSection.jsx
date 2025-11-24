import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { ChevronDown, Info, Crown } from "lucide-react";

export default function DropdownOptionSection({
  title,
  hideTitle,
  isEditMode = false,
  editNote = "*Change will apply for future requests",
  options = [],
  selectedKey = null,
  onSelect,
  onBeforeSelect,
  columns = 2,
  dropdownMaxHeight = 400,
  dropdownMargin = 8,
  icon,
  infoContent,
  bottomOffset = 177, //for tray
  isHidden,
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const [showInfo, setShowInfo] = useState(false);

  const wrapRef = useRef(null);
  const infoRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Unique per dropdown instance
  const instanceId = useId();

  const selectedOption = options.find((o) => o.key === selectedKey);

  const gridColsClass = useMemo(() => {
    if (columns === 1) return "grid-cols-1";
    if (columns === 3) return "grid-cols-3";
    if (columns === 4) return "grid-cols-4";
    return "grid-cols-2";
  }, [columns]);

  // -----------------------------------------------------
  // ✅ GLOBAL EVENT: close if another dropdown was opened
  // -----------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (e.detail !== instanceId) {
        setOpen(false);
        setShowInfo(false);
      }
    };
    window.addEventListener("dropdown-opened", handler);
    return () => window.removeEventListener("dropdown-opened", handler);
  }, [instanceId]);

  // ---------------------------------------------
  // ✅ OUTSIDE CLICK (without blocking scroll!)
  // ---------------------------------------------
  useEffect(() => {
    function onPointerDownCapture(e) {
      const path = e.composedPath?.() || [];

      const inside =
        (wrapRef.current && path.includes(wrapRef.current)) ||
        (triggerRef.current && path.includes(triggerRef.current)) ||
        (menuRef.current && path.includes(menuRef.current)) ||
        (infoRef.current && path.includes(infoRef.current));

      if (!inside) {
        setOpen(false);
        setShowInfo(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, []);

  // -----------------------------------------------------
  // Determine if menu should open UP or DOWN
  // -----------------------------------------------------
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const tRect = trigger.getBoundingClientRect();
    const menuHeight = Math.min(menu.scrollHeight, dropdownMaxHeight);

    // NEW: space below = viewport - bottom of trigger - bottomOffset
    const spaceBelow = window.innerHeight - tRect.bottom - bottomOffset;

    const spaceAbove = tRect.top;

    const shouldOpenUp =
      spaceBelow < menuHeight + dropdownMargin && spaceAbove > spaceBelow;

    setDirection(shouldOpenUp ? "up" : "down");
  }, [open, dropdownMaxHeight, dropdownMargin, bottomOffset]);

  // -----------------------------------------------------
  // Toggle dropdown
  // -----------------------------------------------------
  const toggleOpen = () => {
    const next = !open;

    if (next) {
      // Notify all dropdowns this one is opening
      window.dispatchEvent(
        new CustomEvent("dropdown-opened", { detail: instanceId })
      );
    }

    setOpen(next);
  };

  const handleSelect = (opt) => {
    if (onBeforeSelect?.(opt) === false) return;
    onSelect?.(opt.key);
    setOpen(false);
  };

  if (isHidden) return null;
  
  return (
    <div className="space-y-2 mb-6">
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

          {infoContent && (
            <div ref={infoRef} className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowInfo((v) => !v)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
              >
                <Info className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 6, x: "-50%" }}
                    transition={{ duration: 0.18 }}
                    className="
                      absolute bottom-full left-1/2 mb-2
                      w-[240px]
                      bg-white text-gray-600 text-sm rounded-2xl p-3
                      shadow-[0_4px_16px_rgba(0,0,0,0.25)]
                      border-2 border-blue-600
                    "
                  >
                    {typeof infoContent === "string" ? (
                      <p>{infoContent}</p>
                    ) : (
                      infoContent
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Wrapper */}
      <div ref={wrapRef} className="relative">
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleOpen}
          className={`relative z-[50] w-full flex items-center justify-between text-left p-3 rounded-xl border bg-white 
            transition-all hover:border-gray-300
            ${
              open
                ? "border-blue-400 shadow-sm ring-2 ring-blue-100"
                : "border-gray-200"
            }`}
        >
          <div className="min-w-0 flex items-center gap-3">
            {selectedOption?.icon ?? icon}

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                {selectedOption?.label ?? "Choose an option"}
              </div>

              {selectedOption?.subLabel && (
                <div className="text-xs text-gray-600 mt-0.5">
                  {selectedOption.subLabel}
                </div>
              )}
            </div>
          </div>

          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="ml-2 w-5 h-5 text-gray-600" />
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              key="dropdown"
              initial={{
                opacity: 0,
                y: direction === "down" ? -6 : 6,
                scale: 0.98,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: direction === "down" ? -6 : 6,
                scale: 0.98,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`absolute z-[60] w-full rounded-2xl border border-gray-200 bg-white shadow-xl p-2 overflow-auto 
                ${direction === "down" ? "top-full" : "bottom-full"}`}
              style={{
                marginTop: direction === "down" ? dropdownMargin : 0,
                marginBottom: direction === "up" ? dropdownMargin : 0,
                maxHeight: dropdownMaxHeight,
              }}
            >
              <div className={`grid ${gridColsClass} gap-2`}>
                {options.map((opt) => {
                  const active = selectedKey === opt.key;
                  const disabled = !!opt.disabled;

                  return (
                    <motion.button
                      key={opt.key}
                      type="button"
                      whileHover={!disabled ? { scale: 1.0 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                      onClick={() => handleSelect(opt)}
                      className={`relative p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all
                        ${
                          disabled
                            ? "bg-gray-50 border-gray-200 text-gray-400"
                            : active
                            ? "bg-blue-50 border-blue-600 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      {opt.premium && (
                        <div className="absolute -top-2 -right-2 z-20">
                          <div
                            className="
                              flex items-center gap-1.5
                              px-2 py-[3px] rounded-full text-[10px] font-semibold
                              text-white shadow-sm border border-white/30
                              bg-gradient-to-r from-orange-400 via-orange-600 to-orange-600
                            "
                          >
                            <Crown className="w-4 h-4" />
                            Premium
                          </div>
                        </div>
                      )}

                      {opt.icon && (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center
                            ${
                              active
                                ? "bg-blue-600"
                                : disabled
                                ? "bg-gray-400"
                                : "bg-gray-500"
                            }`}
                        >
                          {opt.icon}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {opt.label}
                        </div>

                        {opt.subLabel && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {opt.subLabel}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isEditMode && (
        <div className="text-sm text-gray-500 mt-1">{editNote}</div>
      )}
    </div>
  );
}
