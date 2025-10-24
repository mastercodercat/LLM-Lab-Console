"use client";
import { useState } from "react";
import { Button, Group, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";

export function ExportButtons({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function download(format: "json" | "csv") {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${id}/export?format=${format}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `experiment-${id}.${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess("Download started");
      showNotification({
        title: "Export",
        message: "Download started",
        color: "green",
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Export failed");
      showNotification({
        title: "Export failed",
        message: err?.message ?? "Export failed",
        color: "red",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  }

  return (
    <div>
      <Group pt="md">
        <Button onClick={() => download("json")} disabled={loading}>
          {loading ? <Loader size="xs" /> : "Export JSON"}
        </Button>
        <Button
          variant="outline"
          onClick={() => download("csv")}
          disabled={loading}
        >
          {loading ? <Loader size="xs" /> : "Export CSV"}
        </Button>
      </Group>
    </div>
  );
}
