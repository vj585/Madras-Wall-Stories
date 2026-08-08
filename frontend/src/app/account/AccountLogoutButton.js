"use client";
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AccountLogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between w-full text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
          <LogOut className="w-6 h-6 text-gray-600 group-hover:text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Log Out</h3>
          <p className="text-sm text-gray-500">Sign out of your account</p>
        </div>
      </div>
    </button>
  );
}

