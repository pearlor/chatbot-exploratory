export default function Button({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return <button onClick={onClick}>{label}</button>;
}
