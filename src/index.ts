import { parseArgs } from 'util';
import { get_subject } from '@frame/select_subject';
import { get_course } from '@frame/select_course';
import { get_section } from '@frame/select_section';

const args = parseArgs({
  options: {
    term: { type: 'string', short: 't' },
    predict: { type: 'string', short: 'p' },
  },
});
if (!args.values.term || !args.values.predict) {
  console.error('Usage: bun run src/index.ts --term <term_id> --predict <predict_id>');
  process.exit(1);
}

const termId = args.values.term;
const predictId = args.values.predict;

while (true) {
  const subject = await get_subject();
  if (!subject) break;

  while (true) {
    const courseId = await get_course(termId, subject);
    if (!courseId) break;

    while (true) {
      const sections = await get_section(subject, termId, predictId, courseId);
      if (!sections) break;
    }
  }
}
