import fs from 'fs';

export function readFile(file: string) {
  const result = fs.readFileSync(file, 'utf8');
  return result;
}
