export interface Schedule{
    id: string,
    courseId: string,
    courseName?: string,
    slot: string, 
}

export interface CreateScheduleDto{
    courseId: string,
    slot: string, 
}

export interface UpdateScheduleDto{
    courseId?: string,
    slot?: string, 
}