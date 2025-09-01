/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
//@ts-ignore
import NProgress from "nprogress";
import { useCallback, memo } from "react";

interface ProgressLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  [key: string]: any;
}

const ProgressLink = memo(({ href, children, onClick, ...props }: ProgressLinkProps) => {
  const pathname = usePathname();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Ejecutar el onClick personalizado primero si existe
    if (onClick) {
      onClick(e);
    }
    
    // Solo iniciar el progress si vamos a una ruta diferente Y no se previno la navegación
    if (href !== pathname && !e.defaultPrevented) {
      NProgress.start();
    }
  }, [href, pathname, onClick]);

  return (
    <Link
      href={href}
      {...props}
      onClick={handleClick}
      prefetch={true} // Mantén el prefetch si quieres
    >
      {children}
    </Link>
  );
});

ProgressLink.displayName = 'ProgressLink';
export default ProgressLink;
