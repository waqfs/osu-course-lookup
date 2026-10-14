import Enquirer from 'enquirer';
import { read_cached_object_with_meta, write_cached_object } from '@lib/cache';

async function fetch_course_data(termId: string, subject: string): Promise<any> {
  const cached_subject_search = await read_cached_object_with_meta<any>(`clv2_${termId}_${subject}`);
  if (cached_subject_search && new Date(cached_subject_search._expires) > new Date()) return cached_subject_search.data;

  const res = await fetch(
    `https://content.osu.edu/v2/classes/search?q=${subject.toLowerCase()}&campus=col&academic-career=ugrd&subject=${subject.toLowerCase()}&term=${termId}`
  );

  const data = await res.json();
  await write_cached_object(`clv2_${termId}_${subject}`, data, 120_000);

  return data;
}

async function possible_courses(termId: string, subject: string): Promise<Record<string, string>[]> {
  const data = await fetch_course_data(termId, subject);

  const max_width = process.stdout.columns - 15;
  return data.data.courses.map((item: any) => ({
    name: `${item.course.subject}-${item.course.catalogNumber} ${item.course.title.slice(0, max_width)}${item.course.title.length > max_width ? '...' : ''}`,
    value: `${item.course.courseId}`,
  }));
}

export async function get_course(termId: string, subject: string): Promise<string | null> {
  const courses = await possible_courses(termId, subject);

  console.clear();
  const response = await Enquirer.prompt({
    type: 'autocomplete',
    name: 'course',
    message: 'Select a course:',
    limit: process.stdout.rows - 4,
    choices: [
      {
        name: '<-- Go Back',
        value: null,
      },
      ...courses,
    ],
  });
  if (response.course === '<-- Go Back') return null;
  return response.course || null;
}
