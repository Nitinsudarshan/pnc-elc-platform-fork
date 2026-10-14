export interface Department {
  id: string;
  name: string;
  head_of_department_id?: string | null;
  head_of_department_name?: string | null;
  description?: string | null;
  is_archived: boolean;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentInput {
  name: string;
  head_of_department_id?: string | null;
  head_of_department_name?: string | null;
  description?: string | null;
}

export interface UpdateDepartmentInput {
  name?: string;
  head_of_department_id?: string | null;
  head_of_department_name?: string | null;
  description?: string | null;
  is_archived?: boolean;
}
