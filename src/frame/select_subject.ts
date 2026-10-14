import Enquirer from 'enquirer';
import { read_cached_object, write_cached_object } from '@lib/cache';

async function possible_subjects(): Promise<string[]> {
  const cached_subjects = await read_cached_object<string[]>('subject_list');
  if (cached_subjects) return cached_subjects;

  const res = await fetch('https://www.asc.ohio-state.edu/barrett.3/schedule/');
  const text = await res.text();

  const subjects = text.matchAll(/<td><a href="([^"]+)">([^<]+)<\/a><\/td>/g);
  const subject_list: string[] = [];
  for (const match of subjects) if (match[2]) subject_list.push(match[2]);

  await write_cached_object('subject_list', subject_list);
  return subject_list;
}

export async function get_subject(): Promise<string | null> {
  const subjects = await possible_subjects();

  console.clear();
  const response = await Enquirer.prompt({
    type: 'autocomplete',
    name: 'subject',
    message: 'Select a subject:',
    limit: process.stdout.rows - 4,
    choices: ['<-- Exit', ...subjects],
  });
  if (response.subject === '<-- Exit') return null;
  return response.subject || null;
}
