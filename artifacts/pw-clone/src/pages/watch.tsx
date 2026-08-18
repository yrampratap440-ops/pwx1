import { useEffect, useState } from "react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

// learnbyakp.online shut down. vidcloud.eu.org's player fetches video via a
// custom XHR + blob loader (not a plain .mpd/.m3u8 URL), and it also embeds
// a nested testwave.cc iframe that refuses to load when double-framed inside
// our own site. So instead of iframing, we do a full top-level redirect —
// this matches exactly how it works when opened directly in the browser.
const PLAYER_BASE = "https://vidcloud.eu.org/play.php";

export default function ScheduleWatch() {
  const { addToHistory } = useWatchHistory();
  const [status, setStatus] = useState<"redirecting" | "invalid">("redirecting");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const batchId    = sp.get("batchId") || "";
    const subjectId  = sp.get("subjectId") || "";
    const scheduleId = sp.get("scheduleId") || "";
    const title      = sp.get("title") || sp.get("topic") || "Lecture Video";
    const thumbnail  = sp.get("thumbnail") || "";
    const topicId    = sp.get("topicId") || "";

    if (!batchId || !scheduleId) {
      setStatus("invalid");
      return;
    }

    addToHistory({
      scheduleId, batchId, subjectId, title,
      thumbnail: thumbnail || undefined,
      watchedAt: Date.now(),
    });

    const playerUrl = `${PLAYER_BASE}?${new URLSearchParams({
      batch_id: batchId,
      subject_id: subjectId,
      topic_id: topicId || scheduleId,
      video_id: scheduleId,
      video_name: title,
      video_img: thumbnail,
      video_type: "new",
      play_type: "Lecture",
    }).toString()}`;

    window.location.replace(playerUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.5)", fontSize: 14, gap: 12, textAlign: "center", padding: 16,
    }}>
      {status === "redirecting" ? "Opening video…" : "Invalid video parameters. Please go back and select a video."}
    </div>
  );
}
