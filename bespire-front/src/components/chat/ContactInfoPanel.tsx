"use client";

import React from 'react';
import Image from 'next/image';
import { Mail, Phone, Globe, Briefcase, Clock, Linkedin, Facebook } from 'lucide-react';
import { getFileIcon } from '@/utils/getFileIcon';

// Define a comprehensive interface for the chat user object
interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  timezone: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
  };
  sharedFiles: {
    name: string;
    size: string;
    type: string;
  }[];
}

interface ContactInfoPanelProps {
  user: ChatUser | null;
}

export default function ContactInfoPanel({ user }: ContactInfoPanelProps) {
    if (!user) return null;

    return (
        <aside className="w-80 h-full bg-white flex-shrink-0 p-6 flex flex-col gap-6 overflow-y-auto">
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
                    <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{user.organization}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{user.timezone}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700">bespire.com</span>
                </div>
                {user.socials && (
                    <div className="flex items-center gap-4 pt-2">
                        {user.socials.linkedin && (
                            <a href={user.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" title="LinkedIn Profile">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        )}
                        {user.socials.facebook && (
                            <a href={user.socials.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" title="Facebook Profile">
                                <Facebook className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Shared Files</h4>
                <div className="space-y-3">
                    {user.sharedFiles.map((file, index) => {
                        const iconPath = getFileIcon(file.type);
                        return (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <Image src={iconPath} alt={`${file.type} icon`} width={32} height={32} className="w-8 h-8 flex-shrink-0"/>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.size}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </aside>
    )
}