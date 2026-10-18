export default function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (messages === undefined || messages.length === 0) return null;
  return (
    <p id={id} role="alert" className="font-accent mt-1 text-sm text-accent">
      {messages.join(' ')}
    </p>
  );
}
