/**
 * Development content validator.
 * Run: npm run validate   (also runs automatically before every build)
 * Checks every track, unit, lesson, question, prerequisite, project and circuit.
 */
import { validateContent } from '../src/data/validate';

const report = validateContent();
const s = report.stats;
console.log(`Servolab content: ${s.tracks} tracks · ${s.units} units · ${s.lessons} lessons · ${s.questions} questions · ${s.projects} projects`);
console.log('Question types:', Object.entries(s.types).map(([k, v]) => `${k}=${v}`).join(' '));
if (report.errors.length) {
  console.error(`\n✗ ${report.errors.length} content error(s):`);
  for (const e of report.errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('✓ All content valid');
