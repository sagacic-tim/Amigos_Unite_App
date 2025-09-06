
// src/hooks/useAuthStatus.ts
import { useEffect, useState, useCallback } from "react";
import publicApi from "@/services/publicApi";

const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading,    setLoading]    = useState(true);

  const verifyToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await publicApi.get<{ valid: boolean }>("/api/v1/verify_token");
      return res.data.valid;
    } catch { return false; }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await publicApi.post("/api/v1/refresh_token");
      return true;
    } catch { return false; }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await publicApi.get("/api/v1/csrf").catch(() => {});
      let ok = await verifyToken();
      if (!ok) ok = await refreshToken();
      setIsLoggedIn(ok);
      setLoading(false);
    })();
  }, [verifyToken, refreshToken]);

  return { isLoggedIn, loading };
};

export default useAuthStatus;
