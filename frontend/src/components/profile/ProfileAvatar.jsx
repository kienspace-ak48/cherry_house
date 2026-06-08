function initialsFromFullName(fullName) {
  const p = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0] ?? ''}${p[p.length - 1][0] ?? ''}`.toUpperCase();
  const s = String(fullName || '').trim();
  return (s.slice(0, 2) || 'CH').toUpperCase();
}

export default function ProfileAvatar({ fullName, avatarUrl, size = 'md', className = '' }) {
  const initials = initialsFromFullName(fullName);
  const sizeClass =
    size === 'lg' ? 'h-12 w-12 text-base' : size === 'sm' ? 'h-10 w-10 text-sm' : 'h-10 w-10 text-sm';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || 'Avatar'}
        referrerPolicy="no-referrer"
        className={[
          sizeClass,
          'shrink-0 rounded-full object-cover ring-2 ring-primary/15',
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <div
      className={[
        sizeClass,
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-headline font-bold text-primary',
        size === 'lg' ? 'bg-white shadow-inner shadow-black/[0.04] ring-2 ring-primary/15' : '',
        className,
      ].join(' ')}
    >
      {initials}
    </div>
  );
}
