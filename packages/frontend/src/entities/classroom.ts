export type Classroom = {
  id: string;
  code: string;
  building: string;
  capacity: number;
};

export type CreateClassroomDto = {
  code: string;
  building: string;
  capacity: number;
};

export type UpdateClassroomDto = Partial<CreateClassroomDto>;
