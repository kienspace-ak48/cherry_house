import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { DEFAULT_HEADER_NAV_LINKS } from '../constants/headerNavLinks';
import { getHeaderBookingHref } from '../lib/bookingContext';
import { getClientUser, isClientLoggedIn } from '../lib/authStorage';
import ProfileAvatar from './profile/ProfileAvatar';

const linkClass = (isActive) =>
  [
    'font-headline block rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors lg:inline lg:p-0',
    isActive
      ? 'bg-primary/10 text-primary lg:border-b-2 lg:border-primary lg:bg-transparent lg:pb-1'
      : 'text-on-surface-variant hover:bg-black/5 hover:text-primary lg:hover:bg-transparent',
  ].join(' ');

/**
 * @param {{ pathname: string; hash: string }} location
 * @param {{ to: string; end?: boolean }} item
 */
function isNavItemActive(location, item) {
  const { pathname, hash } = location;
  const { to } = item;

  if (to === '/') {
    return pathname === '/' && hash !== '#phong-noi-bat';
  }

  if (to.startsWith('/#')) {
    const expected = '#' + to.split('#').slice(1).join('#');
    return pathname === '/' && hash === expected;
  }

  const pathOnly = to.split('#')[0];
  if (!pathOnly || pathOnly === '/') return false;

  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

function Header({ navLinks = DEFAULT_HEADER_NAV_LINKS }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const loggedIn = isClientLoggedIn();
  const clientUser = getClientUser();

  const closeMenu = () => setMenuOpen(false);
  const bookingHref = getHeaderBookingHref();

  return (
    <>
      <header
        className={[
          'fixed top-0 z-[101] w-full border-b border-black/5 transition-colors',
          menuOpen ? 'bg-white shadow-sm' : 'bg-white/80 backdrop-blur-xl',
        ].join(' ')}
      >
        <nav
          className={[
            LAYOUT_CONTAINER,
            'flex items-center justify-between gap-3 py-3 md:py-4',
          ].join(' ')}
        >
          <Link
            to="/"
            className="font-headline min-w-0 truncate text-lg font-bold italic text-primary sm:text-xl md:text-2xl"
            onClick={closeMenu}
          >
            Cherry House
          </Link>

          <div className="hidden flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:flex xl:gap-x-8">
            {navLinks.map((item) => {
              const to = item.to === '/booking' ? bookingHref : item.to;
              return (
              <NavLink
                key={item.to}
                to={to}
                end={item.end ?? false}
                className={() => linkClass(isNavItemActive(location, { ...item, to }))}
              >
                {item.label}
              </NavLink>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {loggedIn ? (
              <Link
                to="/profile"
                className="rounded-lg p-1 transition-all hover:bg-primary/5"
                onClick={closeMenu}
                aria-label={`Tài khoản — ${clientUser?.fullName || 'Thành viên'}`}
              >
                <ProfileAvatar
                  fullName={clientUser?.fullName}
                  avatarUrl={clientUser?.avatarUrl}
                  size="xs"
                />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-all hover:text-primary lg:block"
                  onClick={closeMenu}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 lg:block"
                  onClick={closeMenu}
                >
                  Đăng ký
                </Link>
              </>
            )}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-on-surface hover:bg-black/5 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="material-symbols-outlined text-2xl">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[99] bg-black/40 lg:hidden"
            aria-label="Đóng menu"
            onClick={closeMenu}
          />
          <div
            className="fixed top-14 right-0 left-0 z-[100] max-h-[min(calc(100dvh-3.5rem),calc(100svh-3.5rem))] overflow-y-auto rounded-b-2xl border-x border-b border-black/10 bg-white shadow-lg lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
          >
            <div className={[LAYOUT_CONTAINER, 'py-4'].join(' ')}>
              <ul className="flex flex-col gap-1 border-b border-black/5 pb-3">
                {navLinks.map((item) => {
                  const to = item.to === '/booking' ? bookingHref : item.to;
                  return (
                  <li key={item.to}>
                    <NavLink
                      to={to}
                      end={item.end ?? false}
                      className={() =>
                        linkClass(isNavItemActive(location, { ...item, to }))
                      }
                      onClick={closeMenu}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                  );
                })}
                {loggedIn ? (
                  <li>
                    <NavLink
                      to="/profile"
                      className={() =>
                        [
                          linkClass(isNavItemActive(location, { to: '/profile' })),
                          'flex items-center gap-2',
                        ].join(' ')
                      }
                      onClick={closeMenu}
                    >
                      <ProfileAvatar
                        fullName={clientUser?.fullName}
                        avatarUrl={clientUser?.avatarUrl}
                        size="xs"
                      />
                      Tài khoản
                    </NavLink>
                  </li>
                ) : (
                  <>
                    <li>
                      <NavLink
                        to="/login"
                        className={() =>
                          linkClass(isNavItemActive(location, { to: '/login' }))
                        }
                        onClick={closeMenu}
                      >
                        Đăng nhập
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/register"
                        className={() =>
                          linkClass(isNavItemActive(location, { to: '/register' }))
                        }
                        onClick={closeMenu}
                      >
                        Đăng ký
                      </NavLink>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
