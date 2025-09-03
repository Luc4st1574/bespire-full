"use client";

import React from 'react';
import Image from 'next/image';
import { Mail, Phone, Clock , LocateIcon} from 'lucide-react';

// A simplified interface for the chat user object
interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  timezone: string;
  location: string;
}

interface ContactInfoPanelProps {
  user: ChatUser | null;
}

export default function ContactInfoPanel({ user }: ContactInfoPanelProps) {
  if (!user) return null;

  return (
    // Added shadow-sm here
    <aside className="w-80 h-full bg-white flex-shrink-0 p-6 flex flex-col gap-6 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
      <div className="text-center">
        <Image src={user.avatar} alt={user.name} width={80} height={80} className="rounded-full mx-auto" />
        <h3 className="text-lg font-semibold mt-4">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.role}</p>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <a href={`mailto:${user.email}`} className="text-sm text-gray-700 hover:underline truncate">{user.email}</a>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{user.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <LocateIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{user.location}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{user.timezone}</span>
        </div>
      </div>
    </aside>
  )
}