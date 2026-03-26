import { Course } from '../entities';
import { apiRequest } from '../lib';

export async function getCourses(): Promise<Course[]> {
  return await apiRequest<Course[]>('/courses');
}

export async function createCourse(data: {
  name: string;
  code: string;
  credits: number;
}) {
  return await apiRequest<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: any) {
  return await apiRequest<Course>(`/courses/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string) {
  return await apiRequest<void>(`/courses/${id}`, {
    method: 'DELETE',
  });
}
