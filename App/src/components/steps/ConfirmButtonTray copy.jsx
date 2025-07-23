import { ArrowRight } from "lucide-react";
export default function ConfirmButtonTray({
  selectedPeople,
  onConfirm,
  buttonContent,
}) {
  console.log(selectedPeople, "SELCETED");
  return (
    <>
      {/* Continue Button */}
      {selectedPeople.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-lg mx-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPeople.length}{" "}
                    {selectedPeople.length === 1 ? "person" : "people"} selected
                  </h3>
                  <div className="flex gap-4">
                    <span>$6.33 each</span>
                    <span>Monthly</span>
                  </div>
                </div>

                <div className="flex -space-x-2 mt-2">
                  {selectedPeople.slice(0, 5).map((person) => (
                    <div
                      key={person.id}
                      className={`w-8 h-8 rounded-full ${person.color} flex items-center justify-center text-white font-semibold text-xs border-2 border-white`}
                    >
                      {person.avatar}
                    </div>
                  ))}
                  {selectedPeople.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                      +{selectedPeople.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onConfirm}
              className="w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all hover:shadow-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3"
            >
              {buttonContent}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
