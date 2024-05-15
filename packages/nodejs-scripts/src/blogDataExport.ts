import mysql from 'serverless-mysql';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_COMMENTS_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

export function exportBlogPost() {
  if (!process.env.BLOG_INFO_DIR || !process.env.MYSQL_HOST) {
    console.log(`Env vars not set. Set them at [.env.local] Exiting.`);
    exit(1);
  }
  const staticFilePath = path.join(
    process.env.BLOG_INFO_DIR,
    process.env.BLOG_INFO_FILE
  );
  const staticDataDir = path.dirname(staticFilePath);

  if (fs.existsSync(staticDataDir)) {
    fs.rmdirSync(staticDataDir, { recursive: true });
  }
  fs.mkdirSync(staticDataDir, { recursive: true });

  db.query('SELECT * FROM BlogPosts', []).then((results: any[]) => {
    const jsonData = JSON.stringify(results, null, 2);

    fs.writeFile(staticFilePath, jsonData, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log(
          `Data has been written to ${process.env.BLOG_INFO_FILE} successfully.`
        );
      }

      db.end();
      exit(0);
    });
  });
}
