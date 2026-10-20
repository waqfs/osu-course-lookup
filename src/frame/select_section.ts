import Enquirer from 'enquirer';
import { read_cached_object, read_cached_object_with_meta, write_cached_object } from '@lib/cache';
import { fetch_availbility_data } from '@lib/section_availability';
import type { MeetingDetail, SearchQueryResult, SectionDetail } from '@type/osu_classes_search';

async function fetch_section_data(subject: string, courseId: string, termId: string): Promise<SectionDetail[] | null> {
  const cache_key = `clv2s_${termId}_${subject}_${courseId}`;
  const cached_course = await read_cached_object_with_meta<SearchQueryResult>(cache_key);
  if (cached_course && cached_course._expires > Date.now()) {
    return cached_course.data.data.courses.find((c: any) => c.course.courseId === courseId)?.sections ?? null;
  }

  const res = await fetch(
    `https://content.osu.edu/v2/classes/search?q=${courseId}&subject=${subject.toLowerCase()}&term=${termId}&campus=col&academic-career=ugrd`,
  );
  try {
    const data = (await res.json()) as SearchQueryResult;
    await write_cached_object(cache_key, data, 120_000);

    const course = data.data.courses.find(c => c.course.courseId === courseId);
    return course ? course.sections : null;
  } catch {
    return null;
  }
}

async function fetch_predict_section_data(subject: string, predictTermId: string): Promise<SearchQueryResult | null> {
  const cache_key = `clv2p_${predictTermId}_${subject}`;
  const cached_source = await read_cached_object<SearchQueryResult>(cache_key);
  if (cached_source) return cached_source;

  const res = await fetch(
    `https://content.osu.edu/v2/classes/search?q=${subject.toLowerCase()}&campus=col&academic-career=ugrd&subject=${subject.toLowerCase()}&term=${predictTermId}`,
  );

  const data = (await res.json()) as SearchQueryResult;
  await write_cached_object(cache_key, data);

  return data;
}

async function predict_instructor(subject: string, predictTermId: string, courseId: string, target_meeting_slice: string): Promise<string> {
  const data = await fetch_section_data(subject, courseId, predictTermId);
  if (!data) return 'predict:error';

  for (const section of data) {
    for (const meeting of section.meetings) {
      if (minify_slice(meeting) === target_meeting_slice) {
        const actual_instructors = meeting.instructors.filter(i => i.displayName !== null);
        if (actual_instructors.length > 0) {
          return 'predict:' + actual_instructors.map(i => i.displayName).join('/');
        } else {
          return 'predict:missing';
        }
      }
    }
  }
  return 'predict:not_found';
}

function minify_slice(meeting: MeetingDetail): string {
  if (meeting.facilityId === 'ONLINE') return '{ONLINE}';

  const days: string[] = [];
  if (meeting.saturday) days.push('S');
  if (meeting.monday) days.push('M');
  if (meeting.tuesday) days.push('T');
  if (meeting.wednesday) days.push('W');
  if (meeting.thursday) days.push('R');
  if (meeting.friday) days.push('F');
  if (meeting.sunday) days.push('U');

  const endTime: string[] = meeting.endTime.split(' ');
  const time = meeting.startTime.split(' ')[0] + '-' + endTime[0] + endTime[1][0].toUpperCase();
  return `${meeting.facilityId ?? '??'}=${days.join('')} ${time}`;
}

async function minify_meeting(subject: string, predictTermId: string, courseId: string, meeting: any): Promise<string> {
  const s1 = minify_slice(meeting);

  const actual_instructors = meeting.instructors.filter((i: any) => i.displayName !== null);
  if (actual_instructors.length > 0) {
    return `${s1} <${actual_instructors.map((i: any) => i.displayName).join('/')}>`;
  }
  if (meeting.facilityId === 'ONLINE') {
    return `${s1} <predict:not_available>`;
  }
  const predicted_instructor = await predict_instructor(subject, predictTermId, courseId, s1);
  return `${s1} <${predicted_instructor}>`;
}

async function availability_string(termId: string, courseId: string, section: string, offeringNumber: string, sessionCode: string): Promise<string> {
  const av = await fetch_availbility_data(termId, courseId, section, offeringNumber, sessionCode);
  if (!av) return 'status:unknown';
  return `status:${av.enrollmentStatus.slice(0, 4).toUpperCase()}[${av.enrollmentTotal}/${av.enrollmentCapacity}+${av.waitlistTotal}]`;
}

export async function get_section(subject: string, termId: string, predictTermId: string, courseId: string): Promise<string | null> {
  const course = await fetch_section_data(subject, courseId, termId);
  if (!course) return null;

  const sections = await Promise.all(
    course.map(async item => {
      const av_string = await availability_string(termId, courseId, item.section, item.courseOfferingNumber.toString(), item.sessionCode);

      const meetings = await Promise.all(item.meetings.map(async meeting => await minify_meeting(subject, predictTermId, courseId, meeting)));
      return {
        name: `${item.section}#${item.classNumber} ${av_string} ${item.component.slice(0, 2).toUpperCase()} ${item.instructionMode
          .toUpperCase()
          .replaceAll(' ', '_')} ${meetings.join('+')}`,
        value: '' + Math.random(),
      };
    }),
  );

  console.clear();
  const response = await Enquirer.prompt<{ section: string }>({
    type: 'autocomplete',
    name: 'section',
    message: 'Select a section:',
    limit: process.stdout.rows - 4,
    choices: [
      {
        name: '<-- Go Back',
        value: null,
      },
      ...sections,
    ],
  });
  if (response.section === '<-- Go Back') return null;
  return response.section || null;
}
