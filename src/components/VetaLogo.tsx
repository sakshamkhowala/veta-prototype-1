export function VetaLogo({
  className = "size-11",
  full = false,
}: {
  className?: string;
  full?: boolean;
}) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <img
        src="/veta-logo.png"
        alt="Veta - Predict. Plan. Arrive Better."
        className="size-full object-contain rounded-lg"
      />
    </div>
  );
}
