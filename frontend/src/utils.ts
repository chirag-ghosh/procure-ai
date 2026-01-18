export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);

  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
