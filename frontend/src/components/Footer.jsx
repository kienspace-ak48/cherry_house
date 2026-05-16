import {LAYOUT_CONTAINER} from '../constants/layoutContainer'
function Footer(){
    return (
        <footer id="lien-he" className="w-full scroll-mt-28 bg-surface-container pt-16 pb-8">
            <div className={[LAYOUT_CONTAINER, 'flex flex-col items-start justify-between gap-12 md:flex-row'].join(' ')}>
                <div className="max-w-sm space-y-6">
                <span className="font-headline text-2xl font-bold text-primary">Cherry House</span>
                <p className="font-label text-sm leading-relaxed text-stone-500">
                    Khách sạn Boutique đẳng cấp mang phong cách thiết kế đương đại và lòng hiếu khách Việt
                    Nam nồng hậu.
                </p>
                <div className="flex gap-4">
                    <span className="material-symbols-outlined cursor-pointer text-primary">social_leaderboard</span>
                    <span className="material-symbols-outlined cursor-pointer text-primary">retweet</span>
                    <span className="material-symbols-outlined cursor-pointer text-primary">travel_explore</span>
                </div>
                </div>
                <div className="grid grid-cols-2 gap-12 md:grid-cols-2">
                <div className="space-y-4">
                    <h4 className="font-headline text-sm font-bold tracking-widest text-on-surface uppercase">
                    Liên kết
                    </h4>
                    <ul className="space-y-2">
                    <li>
                        <a
                        className="font-label text-sm text-stone-500 transition-colors hover:text-primary"
                        href="#"
                        >
                        Về chúng tôi
                        </a>
                    </li>
                    <li>
                        <a
                        className="font-label text-sm text-stone-500 transition-colors hover:text-primary"
                        href="#"
                        >
                        Tuyển dụng
                        </a>
                    </li>
                    <li>
                        <a
                        className="font-label text-sm text-stone-500 transition-colors hover:text-primary"
                        href="#"
                        >
                        Bản đồ
                        </a>
                    </li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-headline text-sm font-bold tracking-widest text-on-surface uppercase">
                    Pháp lý
                    </h4>
                    <ul className="space-y-2">
                    <li>
                        <a
                        className="font-label text-sm text-stone-500 transition-colors hover:text-primary"
                        href="#"
                        >
                        Chính sách bảo mật
                        </a>
                    </li>
                    <li>
                        <a
                        className="font-label text-sm text-stone-500 transition-colors hover:text-primary"
                        href="#"
                        >
                        Điều khoản sử dụng
                        </a>
                    </li>
                    </ul>
                </div>
                </div>
            </div>
            <div
                className={[LAYOUT_CONTAINER, 'mt-16 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-8 md:flex-row'].join(
                ' ',
                )}
            >
            <p className="font-label text-sm text-stone-500">
            © {new Date().getFullYear()} Cherry House Boutique Hotel. Crafted with warmth.
            </p>
            <div className="flex gap-8">
            <span className="font-label text-xs tracking-widest text-stone-400 uppercase">VN</span>
            <span className="font-label text-xs tracking-widest text-stone-400 uppercase">EN</span>
            </div>
            </div>
        </footer>
    )
}

export default Footer