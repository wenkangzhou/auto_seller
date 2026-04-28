import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json()

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL

    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY 未配置" }, { status: 500 })
    }

    if (!fromEmail) {
      return NextResponse.json({ error: "RESEND_FROM_EMAIL 未配置" }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: "【AutoCard】邮件发送测试",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
          <div style="background:#27272a;border-radius:16px;padding:32px;color:#fff;">
            <h1 style="margin:0 0 12px;font-size:20px;">邮件测试成功</h1>
            <p style="margin:0;color:#a1a1aa;font-size:14px;">
              如果您收到这封邮件，说明 Resend 邮件服务配置正确。
            </p>
            <div style="margin-top:20px;padding:16px;background:#18181b;border-radius:8px;">
              <p style="margin:0;color:#71717a;font-size:12px;">发送时间</p>
              <p style="margin:4px 0 0;color:#fff;font-size:14px;">${new Date().toLocaleString("zh-CN")}</p>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Test email error:", err)
    return NextResponse.json(
      { error: err.message || "发送失败" },
      { status: 500 }
    )
  }
}
