import { read_cached_object_with_meta, write_cached_object } from '@lib/cache';

export type SectionAvailability = {
  isOpen: boolean;
  enrollmentStatus: string;
  enrollmentCapacity: number;
  enrollmentTotal: number;
  availableSeats: number;
  waitlistCapacity: number;
  waitlistTotal: number;
};

export async function fetch_availbility_data(
  termId: string,
  courseId: string,
  section: string,
  offering: string,
  sessionCode: string
): Promise<SectionAvailability | null> {
  const cache_key = `clv2a_${termId}_${courseId}_${section}_${offering}_${sessionCode}`;
  const cached = await read_cached_object_with_meta<SectionAvailability>(cache_key);
  if (cached && cached._expires > Date.now()) return cached.data;

  const response = await fetch(
    `https://content.osu.edu/v2/classes/availability?classSection=${section}&courseId=${courseId}&courseOfferingNumber=${offering}&sessionCode=${sessionCode}&termCode=${termId}`
  );
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  if (data && data.data.availability && data.status === 'success') {
    await write_cached_object(cache_key, data.data.availability, 120_000);
    return data.data.availability as SectionAvailability;
  }
  return null;
}
