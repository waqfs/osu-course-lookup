const minutes_to_string = (minutes: number) => {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const suffix = hour24 >= 12 ? 'P' : 'A';
  const hour12 = hour24 % 12 || 12;

  return `${hour12.toString()}:${minute.toString().padStart(2, '0')} ${suffix}`;
};

export function format_time(start: string, end?: string): { start: string; end: string } {
  const match = start.match(/^(\d{2})(\d{2})([AP])$/);
  if (!match) throw new Error(`Invalid start time: ${start}`);

  const [, start_hour_str, start_minute_str, zone] = match;

  const start_hour = Number(start_hour_str);
  const start_minute = Number(start_minute_str);

  let start_minutes = (start_hour % 12) * 60 + start_minute + (zone === 'P' ? 12 * 60 : 0);
  let end_minutes: number;

  if (end) {
    const match = end.match(/^(\d{2})(\d{2})$/);
    if (!match) throw new Error(`Invalid end time: ${end}`);

    const end_hour = Number(match[1]);
    const end_minute = Number(match[2]);

    end_minutes = (end_hour % 12) * 60 + end_minute + (zone === 'P' ? 12 * 60 : 0);

    if (end_minutes < start_minutes) {
      end_minutes += 12 * 60;
    }
  } else {
    end_minutes = start_minutes + 55;
  }

  return {
    start: minutes_to_string(start_minutes),
    end: minutes_to_string(end_minutes),
  };
}
