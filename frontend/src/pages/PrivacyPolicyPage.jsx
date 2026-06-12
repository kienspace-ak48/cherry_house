import LegalDocumentLayout, { LegalSection } from '../components/legal/LegalDocumentLayout';

function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout title="Chính sách bảo mật" updatedAt="1 tháng 6, 2026">
      <p>
        Cherry House (&quot;chúng tôi&quot;) cam kết bảo vệ quyền riêng tư của khách hàng và thành viên khi sử
        dụng website đặt phòng chính thức. Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và
        bảo vệ thông tin cá nhân của bạn.
      </p>

      <LegalSection title="1. Phạm vi áp dụng">
        <p>
          Chính sách áp dụng cho mọi người truy cập website, tạo tài khoản, đặt phòng, thanh toán, liên hệ
          hỗ trợ hoặc sử dụng trợ lý AI trên nền tảng Cherry House.
        </p>
      </LegalSection>

      <LegalSection title="2. Thông tin chúng tôi thu thập">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-on-surface">Thông tin tài khoản:</strong> họ tên, email, số điện thoại,
            ảnh đại diện (nếu có), phương thức đăng nhập (email hoặc OAuth).
          </li>
          <li>
            <strong className="text-on-surface">Thông tin đặt phòng:</strong> cơ sở, chi nhánh, phòng, ngày
            nhận/trả, số khách, ghi chú đặc biệt, mã booking.
          </li>
          <li>
            <strong className="text-on-surface">Thông tin thanh toán:</strong> phương thức thanh toán, số tiền,
            trạng thái giao dịch. Chúng tôi không lưu trữ đầy đủ số thẻ; dữ liệu thẻ được xử lý bởi đối tác cổng
            thanh toán (VNPay, MoMo, …).
          </li>
          <li>
            <strong className="text-on-surface">Dữ liệu kỹ thuật:</strong> địa chỉ IP, loại trình duyệt, thiết
            bị, cookie phiên đăng nhập và nhật ký truy cập nhằm bảo mật hệ thống.
          </li>
          <li>
            <strong className="text-on-surface">Nội dung chat AI:</strong> tin nhắn bạn gửi tới trợ lý để hỗ
            trợ tìm phòng và tư vấn — chỉ dành cho thành viên đã đăng nhập.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Mục đích sử dụng">
        <ul className="list-disc space-y-2 pl-5">
          <li>Xử lý đặt phòng, xác nhận, hủy và chăm sóc khách tại cơ sở.</li>
          <li>Xử lý thanh toán, hoàn tiền (nếu có) và quản lý ví Cherry House.</li>
          <li>Gửi email xác nhận, nhắc lịch và thông báo liên quan đến booking.</li>
          <li>Cải thiện dịch vụ, phòng chống gian lận và đảm bảo an toàn hệ thống.</li>
          <li>Tuân thủ nghĩa vụ pháp lý khi có yêu cầu từ cơ quan có thẩm quyền.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Chia sẻ thông tin">
        <p>
          Chúng tôi không bán dữ liệu cá nhân. Thông tin có thể được chia sẻ với: nhân viên lễ tân/chi nhánh
          liên quan đến booking của bạn; đối tác thanh toán để hoàn tất giao dịch; nhà cung cấp hạ tầng (hosting,
          email) theo hợp đồng bảo mật; cơ quan nhà nước khi pháp luật yêu cầu.
        </p>
      </LegalSection>

      <LegalSection title="5. Lưu trữ và bảo mật">
        <p>
          Dữ liệu được lưu trên máy chủ có kiểm soát truy cập, mã hóa kết nối (HTTPS) và chính sách phân
          quyền nội bộ. Thời gian lưu trữ phụ thuộc loại dữ liệu (ví dụ: lịch sử booking theo quy định kế toán
          và khiếu nại).
        </p>
      </LegalSection>

      <LegalSection title="6. Quyền của bạn">
        <p>Bạn có thể yêu cầu:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Truy cập, chỉnh sửa thông tin cá nhân trong mục Tài khoản.</li>
          <li>Rút lại sự đồng ý marketing (nếu có) hoặc yêu cầu xóa tài khoản qua kênh liên hệ.</li>
          <li>Khiếu nại nếu cho rằng dữ liệu bị xử lý trái chính sách.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cookie và công nghệ tương tự">
        <p>
          Website sử dụng cookie phiên đăng nhập và lưu trữ cục bộ (localStorage) cho trải nghiệm như ghi nhớ
          đăng nhập, ẩn popup khuyến mãi tạm thời. Bạn có thể xóa cookie trong trình duyệt; một số tính năng có
          thể không hoạt động đầy đủ.
        </p>
      </LegalSection>

      <LegalSection title="8. Thay đổi chính sách">
        <p>
          Chúng tôi có thể cập nhật chính sách khi có thay đổi tính năng hoặc quy định pháp luật. Phiên bản mới
          được đăng trên trang này kèm ngày cập nhật. Việc tiếp tục sử dụng dịch vụ sau khi cập nhật đồng nghĩa
          bạn chấp nhận chính sách mới.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  );
}

export default PrivacyPolicyPage;
