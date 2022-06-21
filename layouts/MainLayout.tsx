import { Toolbar } from "@mui/material";
import Head from "next/head";
import Link from "next/link";

export default function MainLayout({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <Head>
        <title>{title || "sTeX Documents"}</title>
        <meta name="description" content="VoLL-KI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Toolbar sx={{ background: "#3f51b5" }}>
          <Link href="/">
            <span style={{ color: "white", fontSize: "24px", cursor: "pointer" }}>VoLL-KI</span>
          </Link>
        </Toolbar>
        <div style={{ margin: "10px" }}>{children}</div>
      </main>
    </div>
  );
}
