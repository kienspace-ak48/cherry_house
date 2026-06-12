/** Dấu * cho nhãn trường bắt buộc trên form auth. */
export default function RequiredMark() {
  return (
    <span className="font-semibold text-primary" title="Bắt buộc" aria-hidden="true">
      {' '}
      *
    </span>
  );
}
