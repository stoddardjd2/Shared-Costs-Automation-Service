import React, { useEffect } from "react";
import { Search, Plus, ArrowLeft, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ContactCard from "../costs/ContactCard";
import ConfirmButtonTray from "./ConfirmButtonTray";
import { useData } from "../../contexts/DataContext";
import { useNavigate } from "react-router-dom";

const SearchStep = ({
  searchQuery,
  setSearchQuery,
  selectedPeople,
  filteredPeople,
  togglePersonSelection,
  onAddContact,
  onBack,
  onContinue,
  selectedCharge,
  newChargeDetails,
  // New person form
  newPerson,
  setNewPerson,
  handleAddNewPerson,
  onDeletePerson,
  handleUpdatePersonName,
}) => {
  const { participants } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (participants.length == 0) {
      navigate("/dashboard/add/newperson");
    }
  }, []);

  // ✅ Framer Motion variants for staggered card load
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      {/* Main content with padding bottom to prevent button tray overlap */}
      <div className="pb-[180px]">
        <div className="max-w-lg mx-auto px-6 py-0">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-white rounded-xl transition-all hover:shadow-md"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Select People
              </h1>
              <p className="text-gray-600">Choose who to split charges with</p>
            </div>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 border border-gray-200 rounded-xl outline-none text-base bg-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <button
            onClick={onAddContact}
            className="w-full mb-8 p-4 bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-xl flex items-center justify-center gap-3 font-semibold transition-all hover:shadow-md group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add New Person
          </button>

          <div className="space-y-3 mb-8">
            {filteredPeople.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {filteredPeople.map((person) => (
                  <motion.div key={person._id} variants={cardVariants}>
                    <ContactCard
                      person={person}
                      isSelected={
                        !!selectedPeople.find((p) => p._id === person._id)
                      }
                      onToggle={togglePersonSelection}
                      onDeletePerson={onDeletePerson}
                      handleUpdatePersonName={handleUpdatePersonName}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  Start typing to search people you know
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmButtonTray
        buttonContent={
          <>
            Continue
            <ArrowRight className="w-5 h-5" />
          </>
        }
        isCheckout={false}
        selectedPeople={selectedPeople}
        onConfirm={onContinue}
        hideBillingInfo={true}
      />
    </div>
  );
};

export default SearchStep;
