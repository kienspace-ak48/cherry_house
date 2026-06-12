import { useEffect, useState } from 'react';
import {
  getAvatarColor,
  getAvatarInitial,
  isPlaceholderAvatarUrl,
} from '../../lib/userAvatar';
import { resolveMediaUrl } from '../../lib/resolveMediaUrl';

/**
 * @param {{ fullName?: string; avatarUrl?: string; email?: string; size?: 'xs'|'sm'|'md'|'lg'; className?: string }} props
 */
export default function ProfileAvatar({
  fullName,
  avatarUrl,
  email,
  size = 'md',
  className = '',
}) {
  const seed = String(fullName || '').trim() || String(email || '').trim();
  const customSrc = isPlaceholderAvatarUrl(avatarUrl) ? '' : resolveMediaUrl(avatarUrl);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [customSrc]);

  const sizeClass =
    size === 'lg'
      ? 'h-12 w-12 text-base'
      : size === 'xs'
        ? 'h-9 w-9 text-xs'
        : size === 'sm'
          ? 'h-10 w-10 text-sm'
          : 'h-10 w-10 text-sm';

  const ringClass = 'ring-2 ring-primary/15';

  if (!customSrc || imgFailed) {
    return (
      <div
        className={[
          sizeClass,
          'flex shrink-0 items-center justify-center rounded-full font-headline font-bold text-white',
          ringClass,
          className,
        ].join(' ')}
        style={{ backgroundColor: getAvatarColor(seed) }}
        title={fullName || seed}
        aria-label={fullName ? `Avatar ${fullName}` : 'Avatar'}
      >
        {getAvatarInitial(fullName || seed)}
      </div>
    );
  }

  return (
    <img
      src={customSrc}
      alt={fullName || 'Avatar'}
      referrerPolicy="no-referrer"
      title={fullName || ''}
      onError={() => setImgFailed(true)}
      className={[
        sizeClass,
        'shrink-0 rounded-full object-cover bg-surface-container-high',
        ringClass,
        className,
      ].join(' ')}
    />
  );
}
