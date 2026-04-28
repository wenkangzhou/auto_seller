import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js"
import crypto from "crypto"

const apiKey = process.env.LEMON_SQUEEZY_API_KEY
const storeId = process.env.LEMON_SQUEEZY_STORE_ID
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET

export function initLemonSqueezy() {
  if (!apiKey) {
    throw new Error("LEMON_SQUEEZY_API_KEY is not set")
  }
  lemonSqueezySetup({ apiKey })
}

export function getStoreId() {
  if (!storeId) {
    throw new Error("LEMON_SQUEEZY_STORE_ID is not set")
  }
  return storeId
}

export async function createLemonSqueezyCheckout({
  variantId,
  email,
  customData,
  redirectUrl,
}: {
  variantId: string
  email: string
  customData: Record<string, string>
  redirectUrl: string
}) {
  initLemonSqueezy()

  const checkout = await createCheckout(
    getStoreId(),
    variantId,
    {
      checkoutData: {
        email,
        custom: customData,
      },
      productOptions: {
        redirectUrl,
      },
    }
  )

  return checkout
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!webhookSecret) {
    console.error("LEMON_SQUEEZY_WEBHOOK_SECRET is not set")
    return false
  }

  const hmac = crypto.createHmac("sha256", webhookSecret)
  hmac.update(payload)
  const digest = hmac.digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
