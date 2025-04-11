export interface Profile {
  id: string;
  userId: string;
  name: string;
  role?: string;
  company?: string;
  bio?: string;
  phone?: string;
  email?: string;
  image?: string;
  templateId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  cssStyles?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NfcCard {
  id: string;
  userId: string;
  profileId?: string;
  nfcUid: string;
  isActive: boolean;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  id: string;
  userId: string;
  profileId: string;
  visitDate: Date;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  deviceType?: string;
} 