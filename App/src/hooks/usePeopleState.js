import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { ParkingCircle } from "lucide-react";

export const usePeopleState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: "", phone: "" });
  const [newPeople, setNewPeople] = useState([]);

  const { addParticipant, participants } = useData();
  const [people, setPeople] = useState([
    {
      id: 1,
      name: "John Smith",
      phone: "+1 (555) 123-4567",
      avatar: "JS",
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+1 (555) 234-5678",
      avatar: "SJ",
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "Mike Brown",
      phone: "+1 (555) 345-6789",
      avatar: "MB",
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Emily Davis",
      phone: "+1 (555) 456-7890",
      avatar: "ED",
      color: "bg-pink-500",
    },
    {
      id: 5,
      name: "Alex Wilson",
      phone: "+1 (555) 567-8901",
      avatar: "AW",
      color: "bg-indigo-500",
    },
  ]);


const normalizePhoneNumber = (phone) => {
  return phone.replace(/\D/g, "");
};

// Improved filtering that handles different phone number formats
const filteredPeople = participants.filter((person) => {
  // Original name search logic (unchanged)
  const nameMatch = person.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  // Only perform phone search if the search query contains digits
  const normalizedSearchQuery = normalizePhoneNumber(searchQuery);
  const phoneMatch = normalizedSearchQuery.length > 0 && 
    normalizePhoneNumber(person.phone).includes(normalizedSearchQuery);

  return nameMatch || phoneMatch;
});

const togglePersonSelection = (person) => {
  setSelectedPeople((prev) =>
    prev.find((p) => p.id === person.id)
      ? prev.filter((p) => p.id !== person.id)
      : [...prev, person]
  );
};

  const handleAddNewPerson = () => {
    if (newPerson.name.trim() && newPerson.phone.trim()) {
      const initials = newPerson.name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const person = {
        // id: Date.now(),
        name: newPerson.name.trim(),
        phone: newPerson.phone.trim(),
        avatar: initials,
        // color: colors[Math.floor(Math.random() * colors.length)],
      };
      addParticipant(person);

      setSelectedPeople((prev) => [...prev, person]);

      // reset input field:
      setNewPerson({ name: "", phone: "" });

      // update people state:
      setPeople((prev) => [...prev, person]);

      // update new people state
      setNewPeople((prev) => [...prev, person]);
      return true;
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
  };
};
