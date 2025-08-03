import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { ParkingCircle } from "lucide-react";
import { addContact } from "../queries/user";

export const usePeopleState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: "", phone: "" });
  const [newPeople, setNewPeople] = useState([]);
  const [isPhoneInUse, setIsPhoneInUse] = useState(false);

  // Array of allowed Tailwind colors (excluding blue, red, orange, yellow, and dull colors)
  const allowedColors = [
    "bg-purple-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-rose-500",
    "bg-lime-500",
  ];

  const { setParticipants, participants } = useData();
  const [people, setPeople] = useState([]);

  const normalizePhoneNumber = (phone) => {
    return phone.replace(/\D/g, "");
  };

  // Function to get a random color from the allowed colors array
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * allowedColors.length);
    return allowedColors[randomIndex];
  };

  // Improved filtering that handles different phone number formats
  const filteredPeople = participants.filter((person) => {
    // Original name search logic (unchanged)
    const nameMatch = person.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Only perform phone search if the search query contains digits
    const normalizedSearchQuery = normalizePhoneNumber(searchQuery);
    const phoneMatch =
      normalizedSearchQuery.length > 0 &&
      normalizePhoneNumber(person.phone).includes(normalizedSearchQuery);

    return nameMatch || phoneMatch;
  });

  const togglePersonSelection = (person) => {
    setSelectedPeople((prev) =>
      prev.find((p) => p._id === person._id)
        ? prev.filter((p) => p._id !== person._id)
        : [...prev, person]
    );
  };

  const handleAddNewPerson = async () => {
    if (newPerson.name.trim() && newPerson.phone.trim()) {
      const nameParts = newPerson.name.trim().split(" ");
      const initials =
        nameParts.length === 1
          ? nameParts[0][0].toUpperCase()
          : (
              nameParts[0][0] + nameParts[nameParts.length - 1][0]
            ).toUpperCase();

      const person = {
        name: newPerson.name.trim(),
        phone: newPerson.phone.trim().replace(/\D/g, ""),
        avatar: initials,
        color: getRandomColor(), // Add random color selection
      };

      try {
        const res = await addContact(person);
        if (res) {
          const newPerson = res.contact

          setParticipants((prev) => [...prev, newPerson]);
          setSelectedPeople((prev) => [...prev, newPerson]);
          setNewPerson({ name: "", phone: "" });
          setPeople((prev) => [...prev, newPerson]);
          setNewPeople((prev) => [...prev, newPerson]);
          return true;
        }
      } catch (error) {
        console.error("Error adding contact:", error);
        setIsPhoneInUse(true);
        return false;
      }
    }
    return false;
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedPeople,
    setSelectedPeople,
    newPerson,
    setNewPerson,
    newPeople,
    people,
    setPeople,
    filteredPeople,
    togglePersonSelection,
    handleAddNewPerson,
    setIsPhoneInUse,
    isPhoneInUse,
  };
};
