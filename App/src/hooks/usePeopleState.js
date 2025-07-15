import { useState } from "react";

export const usePeopleState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: "", phone: "" });
  const [newPeople, setNewPeople] = useState([]);

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

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.includes(searchQuery)
  );

  const togglePersonSelection = (person) => {
    setSelectedPeople((prev) =>
      prev.find((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  const handleAddNewPerson = () => {
    if (
      newPerson.name.trim() &&
      newPerson.phone.trim()
    ) {
      const initials = newPerson.name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
      const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-green-500",
        "bg-pink-500",
        "bg-indigo-500",
      ];
      const person = {
        id: Date.now(),
        name: newPerson.name.trim(),
        phone: newPerson.phone.trim(),
        avatar: initials,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
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
