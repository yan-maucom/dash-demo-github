import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const MonthSelector: React.FC = () => {
  const { activeMonth, setActiveMonth, availableMonths } = useInventory();

  const currentIndex = availableMonths.findIndex((m) => m.value === activeMonth);

  const handlePrev = () => {
    if (currentIndex < availableMonths.length - 1) {
      setActiveMonth(availableMonths[currentIndex + 1].value);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      setActiveMonth(availableMonths[currentIndex - 1].value);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white border border-[#E1E9E4] rounded-xl p-1 shadow-sm">
      <button
        onClick={handlePrev}
        disabled={currentIndex >= availableMonths.length - 1}
        title="Mês anterior"
        className="p-1.5 text-[#527365] hover:text-[#23332B] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#EBF1EE] transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2 py-0.5">
        <Calendar className="w-4 h-4 text-[#2D5A47]" />
        <select
          value={activeMonth}
          onChange={(e) => setActiveMonth(e.target.value)}
          className="bg-transparent text-xs sm:text-sm font-bold text-[#23332B] cursor-pointer focus:outline-none"
        >
          {availableMonths.map((m) => (
            <option key={m.value} value={m.value} className="bg-white text-[#23332B] font-medium">
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleNext}
        disabled={currentIndex <= 0}
        title="Próximo mês"
        className="p-1.5 text-[#527365] hover:text-[#23332B] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-[#EBF1EE] transition cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
