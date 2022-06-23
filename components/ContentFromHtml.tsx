import { LinearProgress } from "@mui/material";
import axios from "axios";
import { HighlightContext, mmtHTMLToReact } from "mmtParser";
import { useEffect, useMemo, useState } from "react";

export function ContentFromUrl({
  url,
  modifyRendered = (n) => n,
  skipSidebar = false,
}: {
  url: string;
  modifyRendered?: (node: any) => any;
  skipSidebar?: boolean;
}) {
  const [rendered, setRendered] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [highlightedParentId, setHighlightedParentId] = useState("");
  const value = useMemo(
    () => ({ highlightedParentId, setHighlightedParentId }),
    [highlightedParentId]
  );

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(url)
      .catch((_e) => null)
      .then((r) => {
        setIsLoading(false);
        let toShow;
        if (r) toShow = mmtHTMLToReact(r.data, skipSidebar);
        else toShow = <span style={{ color: "red" }}>Error loading: {url}</span>;
        setRendered(toShow);
      });
  }, [url, skipSidebar]);

  if (isLoading) {
    return (
      <>
        <span style={{ fontSize: "smaller" }}>{url}</span>
        <LinearProgress />
      </>
    );
  }
  return (
    <HighlightContext.Provider value={value}>{modifyRendered(rendered)}</HighlightContext.Provider>
  );
}
