import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LAYOUT_CONTAINER } from '../constants/layoutContainer';
import { DEFAULT_PROFILE_CONTACT, mergeProfileContact, readProfileContact } from '../data/profileContact';

const LINKED_FB_ICON =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGKAj9tFjrVNtHuetTn1tT05psaCScaszQwrT8NfC5yR91owVK3aK99Mg5xBVIADDUy11BDyzf-xJzzVLNvyfUVSG0O2jqGalZBDiu17nqaE-aedGBMnbYszZumtfGf6c9my3eezp_nVTK8Mx3Id5a909Kz2YjPav7SeWywQ0uNdt-XUuwYR9CZz39VfqAlrUJmyagxPwIgoad4GiV1p2bnb7yKH8cRIlKIi18fenp7DYdBakuiCZvtPftY1iLDPHzbJAsuGj4iQ';

const LINKED_GOOGLE_ICON =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDEcQGy5uknSbFvttcBTAZKzaUOLSPKLoxLe3BcRtSuy82G5OkFQsegHeoE_YVWfEntHJezF7__mODyxv6gyjca29ryiNzcXgIefpCVEWsPw9DIY6RnsWgZWZIZb9x4j0HAI5mm4hCwg26nzP1pIDmpFo2tRpL7TF9vipM6J-dq0F0_3RN8iNMJz86fmcnRrJK9jEYLpBez_h_SrD7HDudNPgxmKRT_L4KcnvMzp2Zu-AVwcPF1qijGZ15eIpRM0DbTLzkYshxvjg';

const MONTHS = [
  'Tháng Một',
  'Tháng Hai',
  'Tháng Ba',
  'Tháng Tư',
  'Tháng Năm',
  'Tháng Sáu',
  'Tháng Bảy',
  'Tháng Tám',
  'Tháng Chín',
  'Tháng Mười',
  'Tháng Mười một',
  'Tháng Mười hai',
];

const YEARS_BIRTH = Array.from({ length: 60 }, (_, i) => String(1970 + i));

const INITIAL_FORM = {
  fullName: DEFAULT_PROFILE_CONTACT.fullName,
  gender: 'Nam',
  day: '12',
  month: '4',
  year: '1992',
  city: 'Hà Nội',
};

const PLACEHOLDER_LABELS = {
  transactions: 'Danh sách giao dịch',
  notifications: 'Thông báo',
  settings: 'Cài đặt nâng cao',
};

function shortDisplayFromFullName(fullName) {
  const p = fullName.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'Khách Cherry House';
  if (p.length === 1) return p[0];
  return p.slice(-2).join(' ');
}

function initialsFromFullName(fullName) {
  const p = fullName.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0] ?? ''}${p[p.length - 1][0] ?? ''}`.toUpperCase();
  const s = fullName.trim();
  return (s.slice(0, 2) || 'CH').toUpperCase();
}

const SIDEBAR = [
  { id: 'overview', icon: 'dashboard', label: 'Tổng quan' },
  { id: 'account', icon: 'person', label: 'Thông tin tài khoản' },
  { id: 'password', icon: 'lock', label: 'Mật khẩu & Bảo mật' },
  { id: 'bookings', icon: 'event_available', label: 'Đặt chỗ của tôi', href: '/booking' },
  { id: 'transactions', icon: 'list_alt', label: 'Danh sách giao dịch' },
  { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
  { id: 'settings', icon: 'settings', label: 'Cài đặt', hasDividerBelow: true },
];

function ProfileOverviewSection({ profileContact, onEditProfile, onEditPassword }) {
  const greetingName = shortDisplayFromFullName(profileContact.fullName);
  const initials = initialsFromFullName(profileContact.fullName);

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-linear-to-br from-primary/[0.07] via-white to-secondary-container/60 p-5 shadow-sm md:flex md:flex-row-reverse md:items-stretch md:justify-between md:gap-6">
        <div className="flex justify-end md:flex-col md:items-end md:justify-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white font-headline text-base font-bold text-primary shadow-inner shadow-black/[0.04] ring-2 ring-primary/15">
            {initials}
          </div>
        </div>
        <div className="mt-4 min-w-0 md:mt-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant/90">
            Tài khoản Cherry House
          </p>
          <h2 className="mt-1 font-headline text-lg font-bold text-on-surface md:text-xl">
            Xin chào, {greetingName}
          </h2>
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-on-surface-variant">
            Xem nhanh thông tin bên dưới hoặc mở mục <span className="font-semibold text-on-surface">Thông tin tài khoản</span> khi muốn
            chỉnh sửa chi tiết. Đặt phòng của bạn gắn với&nbsp;
            <span className="font-semibold text-on-surface">Bảng phòng</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-colors hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[16px]">edit_square</span>
              Chỉnh sửa hồ sơ
            </button>
            <Link
              to="/booking"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-variant/40"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
              Đặt chỗ của tôi
            </Link>
            <button
              type="button"
              onClick={onEditPassword}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-primary underline-offset-2 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Mật khẩu &amp; bảo mật
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 font-headline text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">contact_mail</span>
            Liên hệ nhận thông báo
          </h3>
          <div className="mt-3 space-y-2 text-xs text-on-surface-variant">
            <span className="flex flex-col rounded-lg bg-surface-container-low/70 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">Email</span>
              <span className="mt-0.5 break-all font-semibold text-on-surface">{profileContact.email}</span>
            </span>
            <span className="flex flex-col rounded-lg bg-surface-container-low/70 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">Điện thoại</span>
              <span className="mt-0.5 font-semibold text-on-surface">{profileContact.phone}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-3 text-left text-xs font-bold text-primary hover:underline"
          >
            Cập nhật trong «Thông tin tài khoản»
          </button>
        </section>

        <section className="rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 font-headline text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-lg text-secondary">workspace_premium</span>
            Hạng &amp; đặt phòng
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            Bạn là thành viên{' '}
            <strong className="text-on-surface">Kim cương</strong>. Ưu đãi thành viên được tính tự động khi vào&nbsp;
            <Link className="font-bold text-primary hover:underline" to="/booking">
              bước thanh toán
            </Link>
            .
          </p>
          <Link
            to="/booking"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">hotel</span>
            Xem danh sách phòng
          </Link>
        </section>
      </div>
    </div>
  );
}

function SidebarItem({ item, active, onSelect }) {
  if (item.href) {
    return (
      <Link
        to={item.href}
        className="flex items-center gap-2.5 px-5 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-variant/50"
      >
        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={[
        'flex w-full items-center gap-2.5 px-5 py-2.5 text-left text-sm font-medium transition-colors',
        active ? 'sidebar-item-active text-white' : 'text-on-surface-variant hover:bg-surface-variant/50',
      ].join(' ')}
    >
      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

function ProfilePage() {
  const [section, setSection] = useState('overview');
  const [form, setForm] = useState(INITIAL_FORM);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL_FORM), [form]);
  const profileContact = readProfileContact();

  const sidebarName = shortDisplayFromFullName(profileContact.fullName);
  const sidebarInitials = initialsFromFullName(profileContact.fullName);

  const placeholderSection = section in PLACEHOLDER_LABELS;
  const mainTab = section === 'password' ? 'password' : 'profile';
  const showAccountTabs = section === 'account' || section === 'password';

  const pageTitle = (() => {
    if (placeholderSection) return 'Cài đặt';
    if (section === 'overview') return 'Tài khoản của bạn';
    if (section === 'password') return 'Mật khẩu & bảo mật';
    return 'Thông tin tài khoản';
  })();

  return (
    <div className="min-h-[60vh] bg-surface pb-24 font-body text-sm lg:pb-14">
      <style>{`
        .sidebar-item-active { background-color: var(--color-primary); color: #fff; }
      `}</style>
      <div className={[LAYOUT_CONTAINER, 'pt-24 md:pt-28'].join(' ')}>
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <div className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
              <div className="border-b border-outline-variant/30 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-headline text-base font-bold text-primary">
                    {sidebarInitials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-headline text-sm font-bold text-on-surface">{sidebarName}</h3>
                    <p className="text-[11px] text-on-surface-variant">Google</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg bg-secondary-container/30 p-2.5 text-xs text-secondary"
                >
                  <div className="flex min-w-0 items-center gap-1.5 font-medium text-secondary">
                    <span className="material-symbols-outlined text-[16px] shrink-0">workspace_premium</span>
                    <span className="truncate">Thành viên Kim cương</span>
                  </div>
                  <span className="material-symbols-outlined shrink-0 text-[16px] text-secondary">
                    chevron_right
                  </span>
                </button>
              </div>
              <nav className="py-2" aria-label="Tài khoản">
                {SIDEBAR.map((item) => (
                  <div key={item.id}>
                    <SidebarItem
                      item={item}
                      active={section === item.id}
                      onSelect={(id) => setSection(id)}
                    />
                    {item.hasDividerBelow ? (
                      <div className="mx-5 border-b border-outline-variant/30" />
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-1 flex w-full items-center gap-2.5 px-5 py-2.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-variant/50"
                  onClick={() => console.info('Đăng xuất — demo')}
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-5">
            <header className="mb-3">
              <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">{pageTitle}</h1>
            </header>

            {showAccountTabs && (
            <div className="mb-4 flex border-b border-outline-variant/50">
              <button
                type="button"
                className={`px-4 py-2 text-xs font-bold transition-colors ${mainTab === 'profile' ? 'border-primary border-b-2 text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                onClick={() => setSection('account')}
              >
                Thông tin tài khoản
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-xs font-bold transition-colors ${mainTab === 'password' ? 'border-primary border-b-2 text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                onClick={() => setSection('password')}
              >
                Mật khẩu & Bảo mật
              </button>
            </div>
            )}

            {placeholderSection ? (
              <ProfilePlaceholderCard title={PLACEHOLDER_LABELS[section]} />
            ) : section === 'overview' ? (
              <ProfileOverviewSection
                profileContact={profileContact}
                onEditProfile={() => setSection('account')}
                onEditPassword={() => setSection('password')}
              />
            ) : mainTab === 'password' ? (
              <PasswordSection />
            ) : (
              <>
                <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
                  <div className="border-b border-outline-variant/30 bg-surface-container-low/30 px-5 py-3">
                    <h2 className="font-headline text-base font-bold text-on-surface">Dữ liệu cá nhân</h2>
                  </div>
                  <div className="space-y-4 p-5 md:p-6">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="fullName">
                        Tên đầy đủ
                      </label>
                      <input
                        id="fullName"
                        className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                      />
                      <p className="mt-1.5 text-[11px] leading-snug text-on-surface-variant">
                        Tên trong hồ sơ được rút ngắn từ họ tên của bạn.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-on-surface">Giới tính</label>
                        <select
                          className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                          value={form.gender}
                          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                        >
                          <option>Nam</option>
                          <option>Nữ</option>
                          <option>Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-on-surface">Ngày</label>
                        <select
                          className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                          value={form.day}
                          onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                        >
                          {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-on-surface">Tháng</label>
                        <select
                          className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                          value={form.month}
                          onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                        >
                          {MONTHS.map((m, i) => (
                            <option key={m} value={String(i + 1)}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-on-surface">Năm</label>
                        <select
                          className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                          value={form.year}
                          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                        >
                          {YEARS_BIRTH.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-on-surface" htmlFor="city">
                        Thành phố cư trú
                      </label>
                      <input
                        id="city"
                        className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                        type="text"
                        placeholder="Thành phố cư trú"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        className="rounded-lg px-4 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-variant/50"
                        onClick={() => setForm(INITIAL_FORM)}
                      >
                        Có lẽ để sau
                      </button>
                      <button
                        type="button"
                        disabled={!dirty}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => mergeProfileContact({ fullName: form.fullName.trim() })}
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
                  <div className="p-5 md:p-6">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-headline text-base font-bold text-on-surface">Email</h3>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">Chỉ có thể sử dụng tối đa 3 email</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Thêm email
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low/50 p-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-on-surface">{profileContact.email}</span>
                        <span className="shrink-0 rounded bg-tertiary-container/10 px-1.5 py-0.5 text-[10px] font-medium text-tertiary">
                          Nơi nhận thông báo
                        </span>
                      </div>
                      <span className="material-symbols-outlined shrink-0 cursor-pointer text-on-surface-variant">
                        more_vert
                      </span>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
                  <div className="p-5 md:p-6">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-headline text-base font-bold text-on-surface">Số di động</h3>
                        <p className="mt-0.5 text-[11px] text-on-surface-variant">Chỉ có thể sử dụng tối đa 3 số di động</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Thêm số di động
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-surface-container-low/50 p-3">
                      <span className="text-sm font-semibold text-on-surface">{profileContact.phone}</span>
                      <span className="material-symbols-outlined cursor-pointer text-on-surface-variant">
                        more_vert
                      </span>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
                  <div className="p-5 md:p-6">
                    <div className="mb-4">
                      <h3 className="font-headline text-base font-bold text-on-surface">Tài khoản đã liên kết</h3>
                      <p className="mt-1 text-[11px] leading-snug text-on-surface-variant">
                        Liên kết tài khoản mạng xã hội để đăng nhập Cherry House dễ dàng hơn.
                      </p>
                    </div>
                    <div className="divide-y divide-outline-variant/30">
                      <div className="flex items-center justify-between py-3 first:pt-0">
                        <div className="flex items-center gap-3">
                          <img src={LINKED_FB_ICON} alt="" className="h-5 w-5" />
                          <span className="text-sm font-semibold text-on-surface">Facebook</span>
                        </div>
                        <button type="button" className="text-xs font-bold text-primary hover:underline">
                          Liên kết
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-3 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={LINKED_GOOGLE_ICON} alt="" className="h-5 w-5" />
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-on-surface">Google</span>
                            <span
                              className="material-symbols-outlined text-base text-tertiary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-on-surface-variant">Đã liên kết</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mục sidebar chưa có nội dung trong bản demo */
function ProfilePlaceholderCard({ title }) {
  return (
    <section className="rounded-xl border border-black/10 border-dashed bg-white p-8 text-center shadow-sm md:p-9">
      <span className="material-symbols-outlined text-3xl text-primary/70">construction</span>
      <h2 className="mt-3 font-headline text-lg font-bold text-on-surface">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-on-surface-variant">
        Cherry House đang hoàn thiện phần này trong bản cập nhật kế tiếp. Hiện tại bạn vẫn có thể
        quản lý thông tin tài khoản và đặt phòng trong phần còn lại.
      </p>
      <Link
        to="/booking"
        className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:brightness-110"
      >
        Đặt phòng của tôi
      </Link>
    </section>
  );
}

function PasswordSection() {
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/30 bg-white shadow-sm">
      <div className="border-b border-outline-variant/30 bg-surface-container-low/30 px-5 py-3">
        <h2 className="font-headline text-base font-bold text-on-surface">Mật khẩu & bảo mật</h2>
        <p className="mt-0.5 text-[11px] leading-snug text-on-surface-variant">
          Demo: biểu mẫu chưa gửi máy chủ. Nối API khi có xác thực thật.
        </p>
      </div>
      <div className="space-y-4 p-5 md:p-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface">Mật khẩu hiện tại</label>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface">Mật khẩu mới</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
            value={pwd.next}
            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface">Nhập lại mật khẩu mới</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
          disabled={!pwd.current || pwd.next.length < 8 || pwd.next !== pwd.confirm}
          onClick={() => console.info('Đổi mật khẩu — demo')}
        >
          Cập nhật mật khẩu
        </button>
      </div>
    </section>
  );
}

export default ProfilePage;
