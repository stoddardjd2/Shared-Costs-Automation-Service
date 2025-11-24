import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Crown, Info } from "lucide-react";

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
  dropdownMaxHeight =400,
  dropdownMargin = 8,
  icon,
  infoContent,
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");
  const [showInfo, setShowInfo] = useState(false);

  const wrapRef = useRef(null);
  const infoRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const backdropRef = useRef(null);

  const selectedOption = options.find((o) => o.key === selectedKey);

  const gridColsClass = useMemo(() => {
    if (columns === 1) return "grid-cols-1";
    if (columns === 3) return "grid-cols-3";
    if (columns === 4) return "grid-cols-4";
    return "grid-cols-2";
  }, [columns]);

  // Close dropdown + info on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target) &&
        infoRef.current &&
        !infoRef.current.contains(e.target)
      ) {
        setOpen(false);
        setShowInfo(false);
      }
    }

    function onEsc(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setShowInfo(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Decide up/down
  useEffect(() => {
    if (!open) return;
    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;
    if (!triggerEl || !menuEl) return;

    const tRect = triggerEl.getBoundingClientRect();
    const mHeight = Math.min(menuEl.scrollHeight, dropdownMaxHeight);

    const spaceBelow = window.innerHeight - tRect.bottom;
    const spaceAbove = tRect.top;

    setDirection(
      spaceBelow < mHeight + dropdownMargin && spaceAbove > spaceBelow
        ? "up"
        : "down"
    );
  }, [open, dropdownMaxHeight, dropdownMargin, options.length]);

  const handleSelect = (opt) => {
    // if (opt.disabled) return;

    const allow = onBeforeSelect?.(opt);
    if (allow === false) return;

    onSelect?.(opt.key);
    setOpen(false);
  };

  return (
    <div className="space-y-2 mb-6">
      {/* Title + new modern tooltip */}
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

                    {/* Arrow */}
                    <div
                      className="
              absolute top-full left-1/2 -translate-x-1/2
              w-0 h-0 
              border-l-6 border-r-6 border-t-6
              border-l-transparent border-r-transparent border-t-gray-900
            "
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* WRAPPER for dropdown */}
      <div ref={wrapRef} className="relative">
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between text-left p-3 rounded-xl border bg-white 
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
                {selectedOption?.badge && (
                  <span className="text-[11px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {selectedOption.badge}
                  </span>
                )}
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
        {/* Backdrop OUTSIDE AnimatePresence */}
        {open && (
          <button
            ref={backdropRef}
            type="button"
            aria-hidden="true"
            className="fixed inset-0 z-[50] cursor-default bg-transparent"
            onPointerDown={(e) => {
              e.preventDefault();
              const { clientX, clientY } = e;

              setOpen(false);
              setShowInfo(false);

              requestAnimationFrame(() => {
                if (backdropRef.current) {
                  backdropRef.current.style.pointerEvents = "none";
                }
                const el = document.elementFromPoint(clientX, clientY);
                if (
                  el &&
                  !wrapRef.current?.contains(el) &&
                  !triggerRef.current?.contains(el)
                ) {
                  el.click?.();
                }
              });
            }}
          />
        )}

        {/* Animate ONLY the menu */}
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
        : "bg-white border-gray-200 hover:border-blue-600"
    }`}
                    >
                      {/* ⭐ PREMIUM BADGE (per-option) */}
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
                            {/* Pulse dot */}
                            <Crown className="w-4 h-4 mr-3" />
                            Premium
                          </div>
                        </div>
                      )}

                      {/* Icon block */}
                      {opt.icon && (
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center
        ${active ? "bg-blue-600" : disabled ? "bg-gray-400" : "bg-gray-500"}`}
                        >
                          {opt.icon}
                        </div>
                      )}

                      {/* Text block */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <span>{opt.label}</span>
                        </div>

                        {opt.subLabel && (
                          <div className="text-xs text-gray-600 mt-0.5">
                            {opt.subLabel}
                          </div>
                        )}
                        {opt.badge && (
                          <span className="mt-3 inline-block text-[11px] bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full">
                            {opt.badge}
                          </span>
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
