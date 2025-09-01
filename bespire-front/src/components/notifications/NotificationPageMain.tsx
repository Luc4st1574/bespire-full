/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { groupNotifications } from "@/utils/utils";
import { parseTimeAgo } from "@/utils/parseTimeAgo";
import { NOTIFICATION_TYPE_ICONS } from "@/utils/notificationTypeIcons";
import ProgressLink from "../ui/ProgressLink";
import { useMarkAllNotificationsAsRead } from "@/hooks/useMarkAllNotificationsAsRead";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";

const PAGE_SIZE = 10; // Puedes ajustar este valor

type Notification = {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  avatar?: string;
  date?: string;
  message?: string;
  // Add any other fields your notification objects have
};

export default function NotificationsPageMain() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const listEndRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    loading,
    error,
    fetchMore,
    refetch: refetchNotifications,
  } = useNotifications({ skip: 0, limit: PAGE_SIZE });

  // Para marcar todas como leídas
  const { markAll, loading: loadingMarkAll } = useMarkAllNotificationsAsRead();
  const { refetch: refetchUnreadCount } = useUnreadNotificationsCount();

  // Handler para marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAll();
      refetchNotifications();
      refetchUnreadCount();
    } catch (e) {
      /* manejar error */
      console.error("Error marking all as read:", e);
    }
  };

  // Agregar nuevas notificaciones al array general al cargar más
  useEffect(() => {
    if (skip === 0 && notifications.length) {
      setAllNotifications(notifications);
    }
  }, [notifications, skip]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    console.log("Scroll event triggered");
    if (!hasMore || loading) return;

    const scrollable = document.documentElement;
    const scrollTop = scrollable.scrollTop;
    const windowHeight = window.innerHeight;
    const fullHeight = scrollable.offsetHeight;

    if (scrollTop + windowHeight + 150 >= fullHeight) {
      loadMore();
    }
  }, [hasMore, loading]);

  useEffect(() => {
    console.log("Setting up scroll listener");
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Cargar más notificaciones cuando sea necesario
  const loadMore = async () => {
    const nextSkip = allNotifications.length;
    const { data } = await fetchMore({
      variables: { skip: nextSkip, limit: PAGE_SIZE },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult.notifications.length) {
          setHasMore(false);
          return prev;
        }
        console.log(
          "Fetched more notifications:",
          fetchMoreResult.notifications
        );
        setAllNotifications([
          ...allNotifications,
          ...fetchMoreResult.notifications,
        ]);
        return {
          notifications: [
            ...prev.notifications,
            ...fetchMoreResult.notifications,
          ],
        };
      },
    });
    if (!data.notifications.length || data.notifications.length < PAGE_SIZE) {
      setHasMore(false);
    }
    setSkip(nextSkip + PAGE_SIZE);
  };

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (listEndRef.current) {
      observer.observe(listEndRef.current);
    }

    return () => {
      if (listEndRef.current) {
        observer.unobserve(listEndRef.current);
      }
    };
  }, [hasMore, loading, loadMore]);

  // Agrupa las notificaciones (esto es igual que siempre)
  const { recently, lastWeek, earlier } = groupNotifications(allNotifications);

  // Render
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-1">
        <span className="text-lg font-medium">Recently</span>
        <div className="flex items-center gap-2">
          <button
            className="text-sm underline text-[#353B38] hover:underline cursor-pointer"
            onClick={handleMarkAllAsRead}
            disabled={loadingMarkAll}
          >
            Mark all as read
          </button>
          <ProgressLink
            className="hover:underline text-[#353B38] flex items-center gap-1 cursor-pointer"
            href={"/settings/preferences"}
          >
            <img src="/assets/icons/mini_settings.svg" alt="" />
            <span> Manage Notifications</span>
          </ProgressLink>
        </div>
      </div>
      {/* Recently */}
      <div>{recently.map(renderNotif)}</div>
      {/* Last Week */}
      {lastWeek.length > 0 && (
        <>
          <div className="mt-6 mb-2  text-lg font-medium px-4 border-t border-gray-200 pt-4">
            Last Week
          </div>
          <div>{lastWeek.map(renderNotif)}</div>
        </>
      )}
      {/* Earlier */}
      {earlier.length > 0 && (
        <>
          <div className="mt-6 mb-2  text-lg font-medium px-4 border-t border-gray-200 pt-4">
            Earlier
          </div>
          <div>{earlier.map(renderNotif)}</div>
        </>
      )}
      {/* Loading spinner al final */}
      {loading && (
        <div className="text-center my-6">
          <span className="loader" /> Loading more...
        </div>
      )}
      {/* Marca el final para el scroll */}
      <div ref={listEndRef}></div>
      {/* Mensaje cuando no hay más */}
      {!hasMore && (
        <div className="text-center my-6 text-gray-400">
          No more notifications
        </div>
      )}
    </div>
  );

  // Renderiza una notificación individual
  function renderNotif(notif:any) {
    const TypeIcon = NOTIFICATION_TYPE_ICONS[notif.category];
    const isComboAvatar = notif.type === "comment" || notif.type === "review";
    return (
      <div
        key={notif._id}
        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
      >
        {isComboAvatar ? (
          <div className="relative w-[40px] flex justify-center items-center">
            <img
              src={notif.avatar ?? "/assets/icons/default_avatar.svg"}
              alt=""
              className="rounded-full object-cover w-[40px]"
            />
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
            <span className="font-semibold text-sm">{notif.title}</span>{" "}
            <span className="text-sm">{notif.description}</span>
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
            <div className="bg-[#F6F7F7] mt-1 text-sm p-2 rounded">
              {notif.message}
            </div>
          )}
        </div>
      </div>
    );
  }
}
