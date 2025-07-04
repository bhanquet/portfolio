export function BlogDate({ date }: { date: Date }) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString("en-US", options)}
    </time>
  );
}
