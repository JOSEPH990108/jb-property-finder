export interface Property {
  id: number;
  projectName: string;
  location: string;
  price: number;
  sqft: number;
  rooms: number;
  bathrooms: number;
  images: string[];
  category: string;
  status: string;
  propertyType: string;
  area: string;
  listType: string;
  dateCompleted: string;
  tenure: string;
  developer: string;
}

export type Developer = {
  id: string;
  name: string; // e.g. "Eco World", "Sunway", "SP Setia"
  logoUrl?: string; // optional: logo image URL
  description?: string; // optional: short intro or company tagline
  establishedYear?: number; // optional: year founded
  projects?: string[]; // optional: array of project names or IDs
  websiteUrl?: string; // optional: link to developer website
  contactNumber?: string; // optional: developer hotline
};

export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  isAgent: boolean;
};

export type AuthMethod = "email" | "phone";
