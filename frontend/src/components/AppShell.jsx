import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { checkApiHealth } from "../api";

/**
 * Persistent AppShell component housing the Sidebar, Header, and Page Outlet
 */
export default function AppShell() {
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const verifyHealth = useCallback(async () => {
    const reachable = await checkApiHealth();
    setIsOnline(reachable);
  }, []);

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, [verifyHealth]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await verifyHealth();
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <div className="app-container">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isOnline={isOnline}
      />

      <div className="app-main">
        <TopHeader
          isOnline={isOnline}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
        />

        <main className="page-content" key={refreshKey}>
          <Outlet context={{ isOnline, onRefresh: handleManualRefresh }} />
        </main>
      </div>
    </div>
  );
}
