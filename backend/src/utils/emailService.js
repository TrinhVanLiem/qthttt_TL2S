const nodemailer = require('nodemailer');

// Dùng Ethereal (fake SMTP — không cần tài khoản thật, chỉ để demo)
// Hoặc đổi sang Gmail nếu có cấu hình App Password
const createTransporter = () => {
  // Nếu có cấu hình Gmail trong .env thì dùng Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: Ethereal (fake SMTP, email sẽ hiển thị tại ethereal.email)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'demo@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'demo',
    },
  });
};

const sendOrderConfirmation = async ({ to, name, orderId, items, totalAmount }) => {
  try {
    const transporter = createTransporter();

    const itemRows = items.map(i =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i.title}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price.toLocaleString('vi-VN')}đ</td>
      </tr>`
    ).join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
        <div style="background:#1B6B4A;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">🧭 TravelGuide Hub</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1B6B4A">Đặt hàng thành công! </h2>
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Cảm ơn bạn đã tin tưởng TravelGuide Hub. Đơn hàng của bạn đã được xác nhận.</p>
          
          <div style="background:#f8fafb;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px;color:#666;font-size:13px">Mã đơn hàng: <strong>#${String(orderId).slice(-8).toUpperCase()}</strong></p>
          </div>

          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f8fafb">
                <th style="padding:10px;text-align:left;font-size:13px">Sản phẩm</th>
                <th style="padding:10px;text-align:right;font-size:13px">Giá</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td style="padding:12px;font-weight:bold">Tổng tiền</td>
                <td style="padding:12px;font-weight:bold;text-align:right;color:#e8a020;font-size:18px">
                  ${totalAmount.toLocaleString('vi-VN')}đ
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="background:#f0faf5;border-radius:8px;padding:16px;margin:24px 0">
            <p style="margin:0;color:#1B6B4A;font-size:14px">
               File guide PDF sẽ được gửi tới email này trong vòng <strong>5 phút</strong>.<br/>
               Hỗ trợ: <strong>1900 1177</strong> | support@travelguidehub.com
            </p>
          </div>

          <p style="color:#666;font-size:13px">Chúc bạn có một chuyến đi tuyệt vời!</p>
        </div>
        <div style="background:#f8fafb;padding:16px;text-align:center;font-size:12px;color:#999">
          © 2025 TravelGuide Hub. All rights reserved.
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"TravelGuide Hub" <no-reply@travelguidehub.com>',
      to,
      subject: ` Xác nhận đơn hàng #${String(orderId).slice(-8).toUpperCase()} - TravelGuide Hub`,
      html,
    });

    console.log(` Email gửi tới ${to} — MessageId: ${info.messageId}`);
    // Nếu dùng Ethereal, in preview URL
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`🔗 Preview email: ${preview}`);

    return true;
  } catch (err) {
    console.error(' Lỗi gửi email:', err.message);
    return false; // Không throw — không làm hỏng luồng thanh toán
  }
};

// Generic sendMail — dùng cho partner notifications
const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: '"TravelGuide Hub" <no-reply@travelguidehub.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email → ${to} | ${subject}`);
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`🔗 Preview: ${preview}`);
    return true;
  } catch (err) {
    console.error('❌ Lỗi gửi email:', err.message);
    return false;
  }
};

module.exports = { sendOrderConfirmation, sendMail };
