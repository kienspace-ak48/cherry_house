import { useEffect, useState } from 'react';
import { DEFAULT_USER_AVATAR_URL } from '../../constants/defaultUserAvatar';
import { resolveMediaUrl } from '../../lib/resolveMediaUrl';

function initialsFromFullName(fullName) {
  const p = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0] ?? ''}${p[p.length - 1][0] ?? ''}`.toUpperCase();
  const s = String(fullName || '').trim();
  return (s.slice(0, 2) || 'CH').toUpperCase();
}

export default function ProfileAvatar({ fullName, avatarUrl, size = 'md', className = '' }) {
  const resolvedAvatar = avatarUrl ? resolveMediaUrl(avatarUrl) : '';
  const [imgSrc, setImgSrc] = useState(resolvedAvatar || DEFAULT_USER_AVATAR_URL);

  useEffect(() => {
    setImgSrc(resolvedAvatar || DEFAULT_USER_AVATAR_URL);
  }, [resolvedAvatar]);

  const sizeClass =
    size === 'lg'
      ? 'h-12 w-12 text-base'
      : size === 'xs'
        ? 'h-9 w-9 text-xs'
        : size === 'sm'
          ? 'h-10 w-10 text-sm'
          : 'h-10 w-10 text-sm';

  const ringClass =
    size === 'lg' ? 'ring-2 ring-primary/15' : 'ring-2 ring-primary/15';

  return (
    <img
      src={imgSrc}
      alt={fullName || 'Avatar'}
      referrerPolicy="no-referrer"
      title={fullName || initialsFromFullName(fullName)}
      onError={() => {
        if (imgSrc !== DEFAULT_USER_AVATAR_URL) {
          setImgSrc(DEFAULT_USER_AVATAR_URL);
        }
      }}
      className={[
        sizeClass,
        'shrink-0 rounded-full object-cover bg-primary/5',
        ringClass,
        className,
      ].join(' ')}
    />
  );
}
