/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from "react";
import { mockNotifications } from "@/mocks/notifications";
import IconNotification from "@/assets/icons/icon_notification.svg";
import { NOTIFICATION_TYPE_ICONS } from "@/utils/notificationTypeIcons";
import ProgressLink from "../ui/ProgressLink";
import { parseTimeAgo } from "@/utils/parseTimeAgo";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { useMarkAllNotificationsAsRead } from "@/hooks/useMarkAllNotificationsAsRead";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { notifications, refetch: refetchNotifications } = useNotifications({
    limit: 4,
  });
  const { unreadCount, refetch: refetchUnreadCount } =
    useUnreadNotificationsCount();
  const { markAll, loading: loadingMarkAll } = useMarkAllNotificationsAsRead();

  // Hook para cerrar el popover al hacer click fuera
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Handler para marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAll();
      // Actualiza los datos en el UI tras el mutation
      refetchNotifications();
      refetchUnreadCount();
    } catch (e) {
      // Puedes mostrar un toast/error aquí
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <IconNotification className="w-5 h-5  cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-200 text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-4 w-[380px] z-30 bg-white rounded-xl shadow-xl border border-[#E2E6E4]">
          {/* ... el resto igual ... */}
          <div className="flex items-center justify-between p-4 pb-1">
            <span className="text-lg font-medium">Notifications</span>
            <button
              className="text-sm underline text-[#353B38] hover:underline cursor-pointer"
              onClick={handleMarkAllAsRead}
              disabled={loadingMarkAll}
            >
              Mark all as read
            </button>
          </div>
          <div className="">
            {notifications.slice(0, 4).map((notif: any) => {
              const TypeIcon = NOTIFICATION_TYPE_ICONS[notif.category];
            const isComboAvatar = notif.type === "comment" || notif.type === "review";
              return (
                <div
                  key={notif._id}
                  className="flex items-start gap-3 px-4 py-3 bg-white  hover:bg-gray-50 transition cursor-pointer"
                >
                  {isComboAvatar ? (
                    <div className="relative w-[40px] flex justify-center items-center">
                      <img
                        src={notif.avatar ?? "/assets/icons/default_avatar.svg"}
                        alt=""
                        className="rounded-full object-cover  w-[40px]"
                      />
                      {/* Icono de tipo sobrepuesto */}
                      <div className="iconNotifyMini bg-[#DEFCBD]">
                        <TypeIcon className="text-[#62864D] w-[30px] h-[30px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="iconNotify bg-[#DEFCBD]">
                      <TypeIcon className="text-[#62864D] w-[20px] h-[20px]" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 w-full">
                    <div>
                      <span className="font-semibold text-sm">
                        {notif.title}
                      </span>{" "}
                      <span className="text-xs">{notif.description}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[#3F4744] text-xs capitalize">
                        {notif.category}
                      </div>
                      <span className="text-[#3F4744] text-xs capitalize">
                        {notif.date && parseTimeAgo(notif.date)}
                      </span>
                    </div>
                    {notif.message && (
                      <div className="bg-[#F6F7F7] mt-1 text-xs p-2 rounded">
                        {notif.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center px-4 py-2  text-sm">
            <ProgressLink
              className="hover:underline text-[#353B38] cursor-pointer"
              href={"/notifications"}
            >
              View all
            </ProgressLink>
            <ProgressLink
              className="hover:underline text-[#353B38] flex items-center gap-1 cursor-pointer"
              href={"/settings/preferences"}
            >
              <img src="/assets/icons/mini_settings.svg" alt="" />
              <span> Manage Notifications</span>
            </ProgressLink>
          </div>
        </div>
      )}
    </div>
  );
}
