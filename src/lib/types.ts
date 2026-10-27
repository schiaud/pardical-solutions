export type Yard = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hours: string;
  about_text: string;
  warranty_text: string;
  returns_text: string;
  pickup_note: string;
  brand_color: string;
  logo_url: string;
  custom_domain: string | null;
  owner_password_hash: string | null;
  created_at: string;
};

export type PartStatus = "available" | "held" | "sold";

export type Part = {
  id: number;
  yard_id: number;
  stock_no: string;
  year: number | null;
  make: string;
  model: string;
  part_type: string;
  description: string;
  interchange: string;
  oem_number: string;
  grade: string;
  mileage: number | null;
  donor_vin: string;
  price_cents: number | null;
  core_charge_cents: number;
  location: string;
  photos: string;
  photo_credit: string;
  status: PartStatus;
  suggested_price_cents: number | null;
  suggestion_source: string | null;
  suggestion_note: string | null;
  suggested_at: string | null;
  price_approved_at: string | null;
  fb_posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadKind = "part_request" | "sell_car" | "founding_yard" | "broker_demo" | "chat";

export type Lead = {
  id: number;
  yard_id: number | null;
  kind: LeadKind;
  part_id: number | null;
  name: string;
  phone: string;
  email: string;
  zip: string;
  data: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
};
