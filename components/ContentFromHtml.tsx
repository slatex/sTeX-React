import { LinearProgress } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { mmtHTMLToReact } from "../utils";

export function ContentFromUrl({
  url,
  initial,
  process = (n) => n,
}: {
  url: string;
  initial?: any;
  process?: (node: any) => any;
}) {
  const [rendered, setRendered] = useState<any>(initial);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(url)
      .catch((_e) => null)
      .then((r) => {
        setIsLoading(false);
        let toShow;
        if (r) toShow = mmtHTMLToReact(r.data);
        else toShow = <span style={{ color: "red" }}>Error loading: {url}</span>;
        setRendered(toShow);
      });
  }, [url]);

  return (
    <>
      {process(rendered)}
      {isLoading && (
        <>
          <span style={{ fontSize: "smaller" }}>{url}</span>
          <LinearProgress />
        </>
      )}
    </>
  );
}
