export type BarrettSection = {
  classCode: string;
  id: number;
  parent: number | null;
  type: string;
  days: {
    M: boolean;
    Tu: boolean;
    W: boolean;
    Th: boolean;
    F: boolean;
  };
  time: string | null;
  location: string | null;
  enrolledSeats: number;
  maxSeats: number;
  instructor: string | null;
};

export async function fetch_barrett_sections(subject: string, termId: string): Promise<BarrettSection[] | null> {
  const url = `https://www.asc.ohio-state.edu/barrett.3/schedule/${subject}/${termId}.txt`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.text();
  return parse(data);
}

const barrett_regex =
  /^\s*(?<subject>[A-Z]+)\s+(?<course>\d+(?:\.\d+)?)\s+(?:(?<campus>[A-Z]{2,4})\s+)?(?<id>\d+)\s+(?<type>[A-Z])\s*(?:\(\s*(?<parentId>\d+)\s*\))?\s*(?<days>[MTWRF ]*?)\s*(?<time>\d{4}[AP](?:-\d{4}[AP]?)?)?\s*(?<location>\S+)?\s+(?<enrolled>\d+)\/(?<max>\d+)\s*(?<instructor>.*)$/gm;
function parse(text: string): BarrettSection[] {
  const source = text.split(/INDependent study classes/i)[0];
  return Array.from(source.matchAll(barrett_regex), match => {
    const groups = match.groups!;
    const dayString = (groups.days ?? '').replace(/\s/g, '');
    const instructor = groups.instructor?.replace(/^\{[^}]+\}\s*/, '').trim() || null;
    return {
      classCode: `${groups.subject} ${groups.course}`,
      id: Number(groups.id),
      parent: groups.parentId ? Number(groups.parentId) : null,
      type: groups.type,
      days: {
        M: dayString.includes('M'),
        Tu: dayString.includes('T'),
        W: dayString.includes('W'),
        Th: dayString.includes('R'),
        F: dayString.includes('F'),
      },
      time: groups.time || null,
      location: groups.location || null,
      enrolledSeats: Number(groups.enrolled),
      maxSeats: Number(groups.max),
      instructor,
    };
  });
}
