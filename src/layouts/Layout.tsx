import React from "react";
import { Outlet } from "react-router-dom";
import SiteHeader from "@/components/Header/SiteHeader";

const Layout: React.FC = () => {
  return (
    <>
      <SiteHeader
        // Example: wire to your auth/modal handlers if you want:
        // onLogin={() => openLoginModal()}
        // onSignup={() => openSignupModal()}
        // onLogout={() => authService.logout()}
        // onSetThemeMode={(mode) => themeStore.setMode(mode)}
        // onSetPalette={(p) => themeStore.setPalette(p)}
      />
      <main className="page-container">
        <Outlet />
      </main>
      {/* <Footer /> if/when you add one */}
    </>
  );
};

export default Layout;
