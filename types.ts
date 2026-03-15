
export interface Minifigure {
  item_no: string;
  name: string;
  decoded_name: string;
  theme_name: string;
  theme_slug: string;
  sub_category?: string;
  image_url: string;
  thumbnail_url?: string;
  category_id: number;
  year_released: number;
  owned: boolean;
  type?: string;
  last_stock_min_price?: number;
  last_stock_avg_price?: number;
  change_percent?: number;
  stock_updated_at?: string;
  description?: string;
}

export interface PopularMinifig extends Minifigure {
  owner_count: number;
  rank: number;
}

export interface SetAppearance {
  item_no: string;
  set_no: string;
  set_name: string;
  quantity: number;
}

export interface Theme {
  id: string;
  name: string;
  minifig_count: number;
  image_url: string;
  owned_count?: number;
  custom_image_url?: string;
}

export interface CharacterCollection {
  id: string;
  name: string;
  minifig_count: number;
  image_url: string;
}

export interface UserStats {
  total_owned: number;
  unique_themes: number;
  recent_addition_name: string;
}

export interface UserProfile {
  id: string;
  email?: string;
}

export interface StatsProps {
  ownedMinifigs: Minifigure[];
  allMinifigs: Minifigure[];
  user: UserProfile | null;
}

export interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
  allMinifigs: Minifigure[];
}

export interface CollectorRank {
  rank: number;
  user_id: string;
  username: string;
  owned_count: number;
  avatar_url?: string;
}

// MarketMover interface for Home dashboard
export interface MarketMover {
  item_no: string;
  name: string;
  image_url?: string;
  current_price: number;
  change_percent: number;
  total_quantity: number; // 거래량 필드 추가
}
