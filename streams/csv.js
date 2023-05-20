import { parse } from 'csv-parse';
import fs from 'node:fs';

const tasksCsv = new URL('./tasks.csv', import.meta.url);
const tasksCsvStream = fs.createReadStream(tasksCsv);
const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2,
});

async function csv() {
  const csvLines = tasksCsvStream.pipe(csvParse);
  for await (const eachLine of csvLines) {
    const [title, description] = eachLine;
    fetch('http://localhost:4444/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });
  }

}

csv();