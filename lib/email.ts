import { Resend } from "resend"

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

interface SendCardEmailParams {
  to: string
  orderId: string
  productName: string
  cardCode: string
  price: number
}

export async function sendCardEmail({
  to,
  orderId,
  productName,
  cardCode,
  price,
}: SendCardEmailParams) {
  const resend = getResend()

  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email")
    return
  }

  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/query`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "AutoCard <noreply@autocard.dev>",
    to,
    subject: `【AutoCard】您购买的 ${productName} 卡券已发货`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>卡券发货通知</title>
</head>
<body style="margin:0;padding:0;background-color:#18181b;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:#27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;">
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:20px;font-weight:700;">卡券发货通知</h1>
              <p style="margin:0;color:#a1a1aa;font-size:14px;">感谢您购买 ${productName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#18181b;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">您的卡券信息</p>
                    <div style="background:#27272a;border:1px dashed #52525b;border-radius:8px;padding:16px;text-align:center;">
                      <code style="color:#38bdf8;font-size:18px;font-weight:600;word-break:break-all;">${cardCode}</code>
                    </div>
                    <p style="margin:12px 0 0;color:#71717a;font-size:12px;">请妥善保管，卡券信息仅发送一次</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:8px;border-bottom:1px solid #3f3f46;">
                    <p style="margin:0;color:#a1a1aa;font-size:13px;">订单号</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:14px;font-weight:500;">${orderId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;padding-bottom:8px;border-bottom:1px solid #3f3f46;">
                    <p style="margin:0;color:#a1a1aa;font-size:13px;">商品</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:14px;font-weight:500;">${productName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0;color:#a1a1aa;font-size:13px;">金额</p>
                    <p style="margin:4px 0 0;color:#ffffff;font-size:14px;font-weight:500;">$${price.toFixed(2)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;color:#71717a;font-size:13px;">您可以通过以下链接查询订单状态：</p>
              <a href="${orderUrl}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">查询订单</a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#18181b;">
              <p style="margin:0;color:#52525b;font-size:12px;text-align:center;">AutoCard 自动发卡平台</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  })
}
