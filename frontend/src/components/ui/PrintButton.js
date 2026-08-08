"use client";
import React from 'react';

export default function PrintButton({ label = "Print" }) {
  return (
    <div className="fixed bottom-8 right-8 print:hidden">
      <button 
        onClick={() => window.print()} 
        className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 font-bold transition-all"
      >
        {label}
      </button>
    </div>
  );
}

