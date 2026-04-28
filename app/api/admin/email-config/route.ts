import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    apiKeyConfigured: !!process.env.RESEND_API_KEY,
    fromEmailConfigured: !!process.env.RESEND_FROM_EMAIL,
    fromEmail: process.env.RESEND_FROM_EMAIL || null,
  })
}
