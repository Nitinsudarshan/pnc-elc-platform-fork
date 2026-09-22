export type LocationType = 'Campus' | 'Bootcamp' | 'Day Center';
export type LocationStatus = 'active' | 'closed';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address?: string | null;
  status: LocationStatus;
  created_at: string;
}

export interface CreateLocationInput {
  name: string;
  type?: LocationType;
  address?: string | null;
  status?: LocationStatus;
}

export interface UpdateLocationInput {
  name?: string;
  type?: LocationType;
  address?: string | null;
  status?: LocationStatus;
}
