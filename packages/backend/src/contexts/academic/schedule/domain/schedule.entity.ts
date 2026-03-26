export class Schedule {
  constructor(
    public readonly id: string,
    public courseId: string,
    public slot: string,
    public classroomId: string | null,
  ) {}
}
