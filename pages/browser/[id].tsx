import MenuIcon from "@mui/icons-material/Menu";
import { Box, CircularProgress, Drawer, IconButton } from "@mui/material";
import axios from "axios";
import { BrowserAutocomplete } from "components/BrowserAutocomplete";
import { OverlayDialog } from "components/OverlayDialog";
import HTMLReactParser, { DOMNode, domToReact, Element } from "html-react-parser";
import MainLayout from "layouts/MainLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { fixSelfClosingTags, replace } from "utils";
import { BASE_URL, BG_COLOR } from "../../constants";

const getSidePanel = (domNode: DOMNode) => {
  if (!(domNode instanceof Element)) return;
  if (domNode.name === "body" || domNode.name === "html") return;
  let isFromSideNote = false;
  for (let parent: any = domNode; parent; parent = parent.parent) {
    if (parent.attribs?.id === "sidenote-container") {
      isFromSideNote = true;
      break;
    }
  }
  if (!isFromSideNote) return <></>;

  if (!domNode.attribs?.onclick) return undefined;
  const rx = /stexMainOverlayOn\('(.*)'/g;
  const matches = rx.exec(domNode.attribs.onclick);
  const path = BASE_URL + matches?.[1];
  return <OverlayDialog contentUrl={path} displayNode={<>{domToReact([domNode])}</>} />;
};

function SideContentDrawer({ drawerContent }: { drawerContent: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawerOpen(open);
  };
  return (
    <Box display={{ xs: "block", md: "none" }} sx={{ float: "right" }} bgcolor={BG_COLOR}>
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          position: "fixed",
          top: "132px",
          right: "10px",
          marginLeft: "15px",
          border: "1px solid #CCC",
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box p="40px 10px 0">{drawerContent}</Box>
      </Drawer>
    </Box>
  );
}

const BrowserPage: NextPage = () => {
  const [content, setContent] = useState(null as any);
  const [sideContent, setSideContent] = useState(null as any);
  const [isFetchingDoc, setIsFetchingDoc] = useState(true);
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
    const getContent = () => {
      setIsFetchingDoc(true);
      try {
        return axios.get(url).then((r) => {
          setIsFetchingDoc(false);
          const html = fixSelfClosingTags(r.data);

          setContent(
            (HTMLReactParser(html, { replace }) as any)?.props?.children[1].props.children
          );
          setSideContent(
            (HTMLReactParser(html, { replace: getSidePanel }) as any)?.props?.children[1].props
              .children
          );
        });
      } catch (e) {
        setIsFetchingDoc(false);
        setContent("Error fetching/parsing input");
      }
    };
    getContent();
  }, [id, router.isReady]);
  
  return (
    <MainLayout title='sTeX Browser'>
      <Box m="10px 0 45px 50px">
        <BrowserAutocomplete />
      </Box>

      <Box display="flex">
        <Box flexGrow={1} bgcolor={BG_COLOR}>
          <SideContentDrawer drawerContent={sideContent} />
          {isFetchingDoc && <CircularProgress />}
          <Box px="20px" maxWidth="520px" m="0 auto" bgcolor={BG_COLOR}>
            {content}
          </Box>
        </Box>
        <Box
          display={{ xs: "none", md: "block" }}
          p="0 10px 10px"
          border="1px solid #CCC"
          borderRadius="5px"
          bgcolor={BG_COLOR}
        >
          {sideContent}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default BrowserPage;
