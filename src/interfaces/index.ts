export interface IClass {
  id: string;
  name: string;
  class_number: string;
  created_at: string;
  updated_at: string;
}

export interface ITeacher {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string | null;
  qr_code: string;
  credential_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Relación con clase (se carga con join)
  classes?: IClass;
}

export interface IMember {
  id: string;
  first_name: string;
  last_name: string;
  class_id: string | null;
  qr_code: string;
  credential_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Relación con clase (se carga con join)
  classes?: IClass;
}

export interface IAttendance {
  id: string;
  person_type: "teacher" | "member";
  person_id: string;
  class_id: string | null;
  date: string;
  timestamp: string;
  created_at: string;
  // Relaciones (se cargan con join)
  classes?: IClass;
  teachers?: ITeacher;
  members?: IMember;
}
