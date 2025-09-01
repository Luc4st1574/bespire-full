import { useState, useEffect, useRef, useCallback } from "react";

export function useInfiniteNotifications(data: any[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const [displayed, setDisplayed] = useState<any[]>([]);

  useEffect(() => {
    setDisplayed(data.slice(0, page * pageSize));
  }, [page, data, pageSize]);

  const loadMore = useCallback(() => {
    if (page * pageSize < data.length) {
      setPage((p) => p + 1);
    }
  }, [page, data.length, pageSize]);

  // Para el observer de scroll infinito
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lastItemRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );
    observer.observe(lastItemRef.current);
    return () => observer.disconnect();
  }, [displayed, loadMore]);

  return { displayed, lastItemRef, hasMore: displayed.length < data.length };
}
