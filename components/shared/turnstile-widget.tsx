"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileWidget({
  value,
  onChange,
}: {
  value: string;
  onChange: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) {
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) {
        return;
      }

      containerRef.current.innerHTML = "";
      window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onChange(token),
        "expired-callback": () => onChange(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [onChange]);

  if (!SITE_KEY) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {!value ? (
        <div className="text-xs text-stone-500">
          Complete the verification challenge before generating the preview.
        </div>
      ) : null}
    </div>
  );
}
