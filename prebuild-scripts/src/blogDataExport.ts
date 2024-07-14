import mysql from 'serverless-mysql';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const db = process.env.MY_SQL_HOST ? mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_COMMENTS_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
}) : undefined;

const BLOG_INFO_FILEPATH = './static/blogData.json';
export function exportBlogPost() {
  if (!process.env.MYSQL_HOST) {
    console.log(`Env vars not set. Set them at [.env.local] Exiting.`);
    fs.writeFile(BLOG_INFO_FILEPATH, '[]', console.error);
    return;
  }

  const staticDataDir = path.dirname(BLOG_INFO_FILEPATH);

  if (fs.existsSync(staticDataDir)) {
    fs.rmdirSync(staticDataDir, { recursive: true });
  }
  fs.mkdirSync(staticDataDir, { recursive: true });

  db.query('SELECT * FROM BlogPosts', []).then((results: any[]) => {
    const jsonData = JSON.stringify(results, null, 2);

    fs.writeFile(BLOG_INFO_FILEPATH, jsonData, (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log(
          `Data has been written to ${BLOG_INFO_FILEPATH} successfully.`
        );
      }

      db.end();
      exit(0);
    });
  });
}
