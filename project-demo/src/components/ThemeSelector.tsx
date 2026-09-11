import React from 'react';
import { Leaf } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF1EE] text-[#2D5A47] rounded-xl border border-[#CBDED5] text-xs font-semibold">
      <Leaf className="w-3.5 h-3.5 text-[#2D5A47]" />
      <span>Verde Suave</span>
    </div>
  );
};
