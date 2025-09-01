"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link, UserPlus, Users, X } from "lucide-react";

interface SharePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

export default function SharePopover({
  isOpen,
  onClose,
  fileName,
}: SharePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  if (!isOpen) {
    return null;
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/files/shared/${fileName}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied!");
      onClose();
    });
  };

  return (
    <>
      {/* Backdrop with blur removed */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-white/75 backdrop-blur-none animate-fadeIn"
        aria-hidden="true"
      />

      {/* Popover Content */}
      <div
        ref={popoverRef}
        className="absolute top-full right-0 mt-2 z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl animate-fadeIn"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Share &quot;{fileName}&quot;
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Anyone with the link can view.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-full -mt-1 -mr-1"
            aria-label="Close share popover"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <label
            htmlFor="share-email"
            className="text-sm font-medium text-gray-700"
          >
            Invite with email
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex flex-grow items-stretch focus-within:z-10">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="share-email"
                className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-[#697D67] focus:ring-[#697D67] sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="button"
              className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span>Invite</span>
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
          >
            <Link className="h-4 w-4" />
            <span>Copy link</span>
          </button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800">
            People with access
          </h4>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Image
                className="h-8 w-8 rounded-full"
                src="https://avatar.vercel.sh/me"
                alt="My avatar"
                width={32}
                height={32}
              />
              <div>
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Public</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}