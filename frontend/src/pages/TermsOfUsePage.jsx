import LegalDocumentLayout, { LegalSection } from '../components/legal/LegalDocumentLayout';

function TermsOfUsePage() {
  return (
    <LegalDocumentLayout title="Điều khoản sử dụng" updatedAt="1 tháng 6, 2026">
      <p>
        Khi truy cập website Cherry House và/hoặc hoàn tất đặt phòng, bạn đồng ý tuân thủ các điều khoản dưới
        đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
      </p>

      <LegalSection title="1. Định nghĩa">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-on-surface">&quot;Cherry House&quot;</strong> — thương hiệu và hệ thống đặt
            phòng trực tiếp do đơn vị vận hành quản lý.
          </li>
          <li>
            <strong className="text-on-surface">&quot;Khách&quot;</strong> — người dùng website, có hoặc không
            có tài khoản, thực hiện tìm kiếm hoặc đặt phòng.
          </li>
          <li>
            <strong className="text-on-surface">&quot;Booking&quot;</strong> — yêu cầu đặt phòng được ghi nhận
            trên hệ thống với mã xác nhận.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Dịch vụ">
        <p>
          Website cung cấp thông tin cơ sở, chi nhánh, phòng, giá tham khảo, kiểm tra phòng trống theo ngày và
          thanh toán trực tuyến. Giá và tình trạng phòng hiển thị dựa trên dữ liệu thời gian thực; booking chỉ
          được xác nhận sau khi thanh toán thành công (hoặc theo quy trình ví Cherry House nếu áp dụng).
        </p>
      </LegalSection>

      <LegalSection title="3. Tài khoản">
        <ul className="list-disc space-y-2 pl-5">
          <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập.</li>
          <li>Thông tin cung cấp phải chính xác, đặc biệt họ tên, email và số điện thoại khi checkout.</li>
          <li>Cherry House có quyền tạm khóa tài khoản nếu phát hiện gian lận, lạm dụng hoặc vi phạm điều khoản.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Đặt phòng và thanh toán">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Khi chọn &quot;Xác nhận đặt phòng&quot;, bạn cam kết thông tin booking là đúng và đồng ý với giá,
            chính sách hủy của phòng/cơ sở tương ứng.
          </li>
          <li>
            Booking ở trạng thái chờ thanh toán có thể bị hủy tự động khi hết thời gian giữ phòng (
            <em>hold</em>).
          </li>
          <li>Mã khuyến mãi (nếu có) phải hợp lệ, trong thời hạn và đúng điều kiện áp dụng.</li>
          <li>Thanh toán qua cổng bên thứ ba tuân theo điều khoản của đối tác đó.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Hủy, đổi lịch và hoàn tiền">
        <p>
          Chính sách hủy phụ thuộc từng phòng/cơ sở và được hiển thị trước khi đặt. Khách có thể xem và hủy
          booking trong mục Tài khoản theo quy tắc hệ thống. Hoàn tiền (nếu đủ điều kiện) được xử lý theo
          phương thức thanh toán ban đầu hoặc ví Cherry House tùy chính sách áp dụng.
        </p>
      </LegalSection>

      <LegalSection title="6. Trách nhiệm tại cơ sở">
        <p>
          Khách tuân thủ nội quy lưu trú tại chi nhánh (giờ quiet, không hút thuốc nơi quy định, số lượng khách
          tối đa, …). Cherry House và đơn vị vận hành không chịu trách nhiệm cho tài sản cá nhân bị mất mát do
          bất cẩn của khách, trừ khi pháp luật có quy định khác.
        </p>
      </LegalSection>

      <LegalSection title="7. Trợ lý AI">
        <p>
          Trợ lý AI hỗ trợ tra cứu phòng và gợi ý dựa trên dữ liệu hệ thống. Thông tin từ AI mang tính tham
          khảo; quyết định cuối cùng và giá chính thức luôn theo màn hình checkout và xác nhận booking.
        </p>
      </LegalSection>

      <LegalSection title="8. Sở hữu trí tuệ">
        <p>
          Logo, nội dung, hình ảnh và giao diện website thuộc quyền Cherry House hoặc được cấp phép hợp pháp.
          Không sao chép, khai thác thương mại khi chưa có sự đồng ý bằng văn bản.
        </p>
      </LegalSection>

      <LegalSection title="9. Giới hạn trách nhiệm">
        <p>
          Trong phạm vi pháp luật cho phép, Cherry House không chịu trách nhiệm cho gián đoạn dịch vụ do sự cố
          mạng, bảo trì, thiên tai hoặc lỗi từ bên thứ ba (cổng thanh toán, nhà mạng). Chúng tôi nỗ lực khôi
          phục dịch vụ trong thời gian sớm nhất.
        </p>
      </LegalSection>

      <LegalSection title="10. Luật áp dụng">
        <p>
          Điều khoản được giải thích theo pháp luật Việt Nam. Tranh chấp ưu tiên giải quyết thương lượng; nếu
          không thành, tranh chấp được đưa ra cơ quan có thẩm quyền tại Việt Nam.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}

export default TermsOfUsePage;
