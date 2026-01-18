export const formatKey = (key: string): string => {
  const result = key
    .replace(/([A-Z])/g, " $1") // split camelCase
    .replace(/_/g, " ") // split snake_case
    .trim();

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const formatValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return "-";

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return (
      <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
        {value.map((v, i) => (
          <li key={i}>{formatValue(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return JSON.stringify(value).substring(0, 50) + "...";
  }

  return String(value);
};
