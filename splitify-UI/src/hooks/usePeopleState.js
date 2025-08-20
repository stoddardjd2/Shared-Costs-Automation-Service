import { useState } from "react";
import { useData } from "../contexts/DataContext";
import { ParkingCircle } from "lucide-react";
import { addContact, updateContactName } from "../queries/user";
import { deleteContact } from "../queries/user";
export const usePeopleState = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [newPerson, setNewPerson] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [newPeople, setNewPeople] = useState([]);
  // const [isPhoneInUse, setIsPhoneInUse] = useState(false); // kept for backward-compat
  const [emailError, setEmailError] = useState(false);
  // Tailwind colors
  const allowedColors = [
    "bg紫-500",
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
  ].map((c) => c.replace("bg紫", "bg-purple")); // in case editor autoconverts

  const { setParticipants, participants } = useData();
  const [people, setPeople] = useState([]);

  const normalizePhoneNumber = (phone = "") => phone.replace(/\D/g, "");
  const validateEmail = (email = "") =>
    email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const getRandomColor = () =>
    allowedColors[Math.floor(Math.random() * allowedColors.length)];

  // Filter by name, phone (digits), or email (substring)
  const filteredPeople = participants.filter((person) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (person.name || "").toLowerCase().includes(q);

    const normalizedSearchDigits = normalizePhoneNumber(searchQuery);
    const phoneMatch =
      normalizedSearchDigits.length > 0 &&
      normalizePhoneNumber(person.phone || "").includes(normalizedSearchDigits);

    const emailMatch =
      (person.email || "").toLowerCase().includes(q) && q.length > 0;

    return nameMatch || phoneMatch || emailMatch;
  });

  const togglePersonSelection = (person) => {
    setSelectedPeople((prev) =>
      prev.find((p) => p._id === person._id)
        ? prev.filter((p) => p._id !== person._id)
        : [...prev, person]
    );
  };

  const handleAddNewPerson = async () => {
    const name = (newPerson.name || "").trim();
    const rawPhone = (newPerson.phone || "").trim();
    const email = (newPerson.email || "").trim();

    const hasAtLeastOneContact = rawPhone || email;
    if (!name || !hasAtLeastOneContact) return false;
    if (!validateEmail(email)) return false;

    const nameParts = name.split(" ").filter(Boolean);
    const initials =
      nameParts.length === 1
        ? nameParts[0][0]?.toUpperCase() || "?"
        : (
            (nameParts[0][0] || "") + (nameParts[nameParts.length - 1][0] || "")
          ).toUpperCase();

    // Build contact with only provided fields
    const person = {
      name,
      ...(rawPhone ? { phone: normalizePhoneNumber(rawPhone) } : {}),
      ...(email ? { email } : {}),
      avatar: initials,
      color: getRandomColor(),
    };

    try {
      const res = await addContact(person);
      if (res) {
        const created = res.contact;
        setParticipants((prev) => [...prev, created]);
        setSelectedPeople((prev) => [...prev, created]);
        setNewPerson({ name: "", phone: "", email: "" });
        setPeople((prev) => [...prev, created]);
        setNewPeople((prev) => [...prev, created]);
        setEmailError(false);
        return true;
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      // Preserve existing behavior for phone duplicates; optionally expand later for email dupes.
      setEmailError(error);
      return false;
    }

    return false;
  };

  async function handleDeletePerson(contactId) {
    const res = await deleteContact(contactId);
    if (res) {
      setParticipants((prev) =>
        prev.filter((person) => person._id !== contactId)
      );
      setSelectedPeople((prev) =>
        prev.filter((person) => person._id !== contactId)
      );
      setPeople((prev) => prev.filter((person) => person._id !== contactId));
      setNewPeople((prev) => prev.filter((person) => person._id !== contactId));
    }
  }

  async function handleUpdatePersonName(contactId, updatedName) {
    const res = await updateContactName(contactId, updatedName);
    if (res) {
      setParticipants((prev) =>
        prev.map((person) =>
          person._id === contactId ? { ...person, name: updatedName } : person
        )
      );
      setSelectedPeople((prev) =>
        prev.map((person) =>
          person._id === contactId ? { ...person, name: updatedName } : person
        )
      );
      setPeople((prev) =>
        prev.map((person) =>
          person._id === contactId ? { ...person, name: updatedName } : person
        )
      );
      setNewPeople((prev) =>
        prev.map((person) =>
          person._id === contactId ? { ...person, name: updatedName } : person
        )
      );
      return true;
    } else {
      return false;
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    selectedPeople,
    setSelectedPeople,
    newPerson,
    setNewPerson,
    newPeople,
    setNewPeople,
    people,
    setPeople,
    filteredPeople,
    togglePersonSelection,
    handleAddNewPerson,
    emailError,
    setEmailError,
    handleDeletePerson,
    handleUpdatePersonName,
    // setIsPhoneInUse,
    // isPhoneInUse,
  };
};
