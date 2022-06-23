import { Box, CircularProgress } from "@mui/material";
import { BrowserAutocomplete } from "components/BrowserAutocomplete";
import { ContentFromUrl } from "components/ContentFromHtml";
import MainLayout from "layouts/MainLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BASE_URL, BG_COLOR } from "../../constants";

const BrowserPage: NextPage = () => {
  const [contentUrl, setContentUrl] = useState("");
  const router = useRouter();
  const id = router.query.id as string;

  useEffect(() => {
    //const url = "https://dl.dropboxusercontent.com/s/4xj5x8w3gi1cq1a/small.xhtml";
    // https%3A%2F%2Fdl.dropboxusercontent.com%2Fs%2F8ssbdrk825r81nd%2Fsmall_orig.xhtml
    //const url = "https://dl.dropboxusercontent.com/s/8ssbdrk825r81nd/small_orig.xhtml";
    // %3AsTeX%2Fbrowser%3Farchive%3DPapers%26filepath%3Dstex-mmt%2Fpaper.xhtml
    //const url = "https://mmt.beta.vollki.kwarc.info/:sTeX/browser?archive=Papers&filepath=stex-mmt/paper.xhtml";
    if (!router.isReady) return;
    const decoded = decodeURI(id);
    const url = decoded.startsWith(":sTeX") ? BASE_URL + "/" + decoded : decoded;
    setContentUrl(url);
  }, [id, router.isReady]);

  return (
    <MainLayout title="sTeX Browser">
      <Box m="10px 0 45px 50px">
        <BrowserAutocomplete />
      </Box>
      <Box display="flex">
        <Box flexGrow={1} flexBasis={600} bgcolor={BG_COLOR}>
          <Box p="0 10px 0 40px" maxWidth="520px" m="0 auto" bgcolor={BG_COLOR}>
            <ContentFromUrl
              url={contentUrl}
              modifyRendered={(bodyNode) => bodyNode?.props?.children}
            />
          </Box>
        </Box>
        <Box flexBasis={300} display={{ xs: "none", md: "block" }} bgcolor={BG_COLOR}></Box>
      </Box>
    </MainLayout>
  );
};

export default BrowserPage;
