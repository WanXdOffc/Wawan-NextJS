"use client";

import { useEffect, useState } from "react";

let deferredPrompt: any;

export default function InstallPWA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setShow(false);

    console.log(choice.outcome);
  };

  if (!show) return null;

  return (
    <button
      onClick={installApp}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "12px 16px",
        borderRadius: "8px",
        background: "#0f172a",
        color: "white",
        zIndex: 9999,
      }}
    >
      Install App 🚀
    </button>
  );
}
