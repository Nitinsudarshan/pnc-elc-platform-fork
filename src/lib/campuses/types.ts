export type CampusStatus = 'active' | 'closed';

export interface Campus {
  id: string;
  name: string;
  status: CampusStatus;
  created_at: string;
}

export interface CreateCampusInput {
  name: string;
  status?: CampusStatus;
}

export interface UpdateCampusInput {
  name?: string;
  status?: CampusStatus;
}
