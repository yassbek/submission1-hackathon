"use client";

import { useEffect, useRef } from "react";

interface JitsiMeetingProps {
  roomName: string;
  userName: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiMeeting({
  roomName,
  userName,
  onClose,
}: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Jitsi Meet API script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI && containerRef.current) {
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
            ],
            SHOW_JITSI_WATERMARK: false,
          },
          userInfo: {
            displayName: userName,
          },
        };

        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Handle meeting end
        apiRef.current.addEventListener("readyToClose", () => {
          if (onClose) onClose();
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [roomName, userName, onClose]);

  return (
    <div className="w-full h-full min-h-[600px]" ref={containerRef}>
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Loading meeting...</p>
      </div>
    </div>
  );
}
