export interface Address {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
  address: Address[];
  createdAt?: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductImage {
  url: string;
  publicId?: string | null;
  alt?: string;
}

export interface ProductRatings {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: Category | string;
  images: ProductImage[];
  stock: number;
  ratings: ProductRatings;
  seller: User | string;
  tags: string[];
  isFeatured: boolean;
}

export interface Review {
  _id: string;
  user: User | string;
  product: Product | string;
  rating: number;
  comment?: string;
  helpful: number;
  createdAt: string;
}

export interface OrderItem {
  product: Product | string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address & { fullName: string };
  paymentMethod: "card" | "cod" | "paypal" | "upi";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  trackingId?: string;
  createdAt: string;
}
