export default function Button({
  onClick,
  label,
  className = "",
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
}
