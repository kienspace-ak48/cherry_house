import { LAYOUT_CONTAINER } from '../constants/layoutContainer';

function AboutPage() {
  return (
    <div className={[LAYOUT_CONTAINER, 'py-16'].join(' ')}>
      <h1 className="font-headline text-3xl font-bold text-on-surface">
        Về Cherry House
      </h1>
      <p className="text-on-surface-variant mt-4 max-w-2xl leading-relaxed">
        Trang giới thiệu đang được hoàn thiện — có thể thay nội dung sau khi đối chiếu layout Stitch.
      </p>
    </div>
  );
}

export default AboutPage;
