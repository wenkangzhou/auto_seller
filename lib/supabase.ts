import { createClient } from '@supabase/supabase-js'
import { Product, OrderWithItems } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

function getClientSideClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)')
  }
  return createClient(supabaseUrl, supabaseKey)
}

function getServerSideClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase secret key (SUPABASE_SECRET_KEY)')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database helper functions
export async function getActiveProducts(): Promise<Product[]> {
  const client = getClientSideClient()
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const client = getClientSideClient()
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getAvailableCardCount(productId: string): Promise<number> {
  // Use server-side client to bypass RLS for inventory count
  const client = getServerSideClient()
  const { count, error } = await client
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('status', 'available')

  if (error) {
    console.error('getAvailableCardCount error:', error)
    return 0
  }
  return count || 0
}

export async function getOrderByIdAndEmail(orderId: string, email: string): Promise<OrderWithItems | null> {
  const client = getClientSideClient()
  const { data: order, error: orderError } = await client
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('email', email)
    .single()

  if (orderError || !order) return null

  const { data: items, error: itemsError } = await client
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsError) return null

  return { ...order, items: items || [] }
}

// Server-side exports for API routes
export { getServerSideClient as supabaseServer }
