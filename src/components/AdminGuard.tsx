"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const isBrowser = typeof window !== "undefined";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) { router.replace("/admin/login"); return; }
        const data = await res.json();
        if (data?.user?.role === "super_admin") {
          setAuthorized(true);
        } else {
          router.replace("/admin/login");
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecked(true));
  }, [router]);

  if (!isBrowser || !checked || !authorized) {
    return null;
  }

  const session = window.localStorage.getItem("fastnet_session");
  if (session !== "admin_active") {
    return null;
  }

  return <>{children}</>;
}

