import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Play, Pause } from "lucide-react";
import advancedOptions from "../../../../assets/demoSlides/advancedOptions.png";

// claude
const ProductDemoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Demo configuration - easily customizable
  const demoConfig = {
    // title: "Discover Amazing Features",
    // subtitle: "See how our product can transform your workflow",
    slides: [
      {
        id: 1,
        title: "Smart Analytics Dashboard",
        description:
          "Get real-time insights with our powerful analytics engine that tracks all your key metrics in one beautiful interface.",
        image: advancedOptions,
        badge: "New Feature",
        ctaText: "Learn More",
      },
      {
        id: 2,
        title: "Seamless Team Collaboration",
        description:
          "Work together effortlessly with real-time collaboration tools, comments, and shared workspaces that keep everyone aligned.",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
        badge: "Popular",
        ctaText: "Try It Now",
      },
      {
        id: 3,
        title: "Advanced Automation",
        description:
          "Save hours every week with intelligent automation that handles repetitive tasks and streamlines your entire workflow.",
        image:
          "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop",
        badge: "Time Saver",
        ctaText: "Automate Now",
      },
      {
        id: 4,
        title: "Mobile-First Experience",
        description:
          "Access everything you need on the go with our fully responsive mobile app that works perfectly on any device.",
        image:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
        badge: "Mobile Ready",
        ctaText: "Download App",
      },
    ],
    primaryColor: "bg-blue-600",
    accentColor: "text-blue-600",
  };

  React.useEffect(() => {
    let interval;
    if (isAutoPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentSlide((prev) =>
          prev === demoConfig.slides.length - 1 ? 0 : prev + 1
        );
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isOpen, demoConfig.slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === demoConfig.slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? demoConfig.slides.length - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = demoConfig.slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`${demoConfig.primaryColor} text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
      >
        View Product Demo
      </button>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {demoConfig.title}
                </h2>
                <p className="text-gray-600 mt-1">{demoConfig.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
                >
                  {isAutoPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              {/* Slide Content */}
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-1/2 relative overflow-hidden">
                  <img
                    src={currentSlideData.image}
                    alt={currentSlideData.title}
                    className="w-full h-64 lg:h-96 object-cover"
                  />
                  {currentSlideData.badge && (
                    <div
                      className={`absolute top-4 left-4 ${demoConfig.primaryColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                    >
                      {currentSlideData.badge}
                    </div>
                  )}
                </div>

                {/* Text Section */}
                <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {currentSlideData.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {currentSlideData.description}
                  </p>
                  <button
                    className={`${demoConfig.primaryColor} text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity w-fit`}
                  >
                    {currentSlideData.ctaText}
                  </button>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all z-10"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all z-10"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Bottom Navigation */}
            <div className="p-6 bg-gray-50 flex items-center justify-between">
              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {demoConfig.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide
                        ? demoConfig.primaryColor.replace("bg-", "bg-")
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <div className="text-sm text-gray-500">
                &nbsp; {currentSlide + 1}  of {demoConfig.slides.length}
              </div>

              {/* Progress Bar */}
              <div className="flex-1 mx-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${demoConfig.primaryColor}`}
                    style={{
                      width: `${
                        ((currentSlide + 1) / demoConfig.slides.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Navigation Info */}
              <div className="text-sm text-gray-500">
                Use ← → keys to navigate
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation */}
      {isOpen && (
        <div
          className="fixed inset-0 pointer-events-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
            if (e.key === "Escape") setIsOpen(false);
          }}
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default ProductDemoModal;
