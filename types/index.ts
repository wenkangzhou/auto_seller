export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  sold_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  product_id: string
  code: string
  status: 'available' | 'sold' | 'disabled'
  order_id: string | null
  created_at: string
  sold_at: string | null
}

export interface Order {
  id: string
  email: string
  total_amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  card_id: string | null
  card_code: string | null
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}
