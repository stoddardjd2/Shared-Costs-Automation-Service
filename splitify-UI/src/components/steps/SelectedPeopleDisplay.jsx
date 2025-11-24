import { Users } from "lucide-react";
import { useData } from "../../contexts/DataContext";

/**
 * Displays selected people as stacked avatars + overflow (+N)
 * and a count badge.
 *
 * Props:
 *  - selectedPeople: array of people objects with at least _id
 *  - maxVisible: number of avatars to show before overflow
 *  - className: optional wrapper class
 *  - hideCount: if true, hides the count badge
 */
export default function SelectedPeopleDisplay({
  selectedPeople = [],
  maxVisible = 5,
  className = "",
  hideCount = false,
  size = 10,
  rounded = "xl",
}) {
  const { participants } = useData();

  const visible = selectedPeople.slice(0, maxVisible);
  const overflow = selectedPeople.length - maxVisible;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Avatars */}
      <div className="flex -space-x-3">
        {visible.map((person, index) => {
          const user = participants.find((u) => u._id === person._id);

          // If participant missing, skip gracefully
          if (!user) return null;

          return (
            <div
              key={user._id}
              className={`w-${size} h-${size} rounded-${rounded} ${user.color} flex items-center justify-center text-white font-semibold text-sm border-3  shadow-md relative group/avatar hover:-translate-y-1 transition-transform duration-200`}
              style={{ zIndex: selectedPeople.length - index }}
            >
              {user.avatar}

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {user.name}
                <div className="absolute top-[28px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            </div>
          );
        })}

        {/* Overflow (+N) */}
        {overflow > 0 && (
          <div
            className={`w-${size} h-${size} rounded-${rounded} bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-xs border-3 border-white shadow-md relative group/avatar hover:translate-x-2 transition-transform duration-200`}
          >
            +{overflow}
            {/* Tooltip for overflow count */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {overflow} more {overflow === 1 ? "person" : "people"}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
      </div>

      {/* Count badge */}
      {!hideCount && (
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
          <Users className="w-4 h-4" />
          <span className="font-medium">{selectedPeople.length}</span>
        </div>
      )}
    </div>
  );
}
