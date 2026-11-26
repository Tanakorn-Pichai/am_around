export type ProviderId = 'grab' | 'lineman' | 'bolt' | 'indrive' | 'maxim' | 'tada';

export type VehicleType = 'motorbike' | 'car';

export interface Provider {
  id: ProviderId;
  name: string;
  shortCode: string;
  badgeColor: string;
  isSelected: boolean;
  deepLinkScheme: string;
  fallbackUrl: string;
  serviceName: string;
  carServiceName: string;
}

export interface LocationItem {
  id: string;
  name: string;
  shortName: string;
  district: string;
  lat: number;
  lng: number;
  isRecent?: boolean;
  isPinned?: boolean;
}

export interface ActiveSearchRoute {
  pickup: LocationItem;
  destination: LocationItem;
  distanceKm: number;
  durationMinutes?: number;
  routePolyline: [number, number][];
}

export interface RiderRoadMotion {
  pathIndex: number;
  startDistanceM: number;
  speedMps: number;
  direction: 1 | -1;
}

export interface DriverPin {
  shortCode: string;
  badgeColor: string;
  lat: number;
  lng: number;
  isMoving?: boolean;
  roadMotion?: RiderRoadMotion;
}

export interface RideOption {
  id: string;
  providerId: ProviderId;
  providerName: string;
  serviceName: string;
  vehicleType: VehicleType;
  etaMinutes: number;
  distanceKm: number;
  estimatedFare: number;
  currency: string;
  isRecommended: boolean;
  driverPin: DriverPin;
}

export type AuthProviderType = 'google' | 'facebook' | 'email';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarBg: string;
  provider: AuthProviderType;
}

export type AppScreen = 'login' | 'providers' | 'map' | 'handoff';

export type SortMode = 'fastest' | 'cheapest';

export type PinMode = 'view' | 'pickup' | 'destination';

export type Language = 'th' | 'en';

export type ThemeMode = 'light' | 'dark';
