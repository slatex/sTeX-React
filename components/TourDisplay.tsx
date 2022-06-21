import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import { styled } from "@mui/material/styles";
import { mmtHTMLToReact } from "utils";
import { BASE_URL, BG_COLOR } from "../constants";
import { ContentFromUrl } from "./ContentFromHtml";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  //padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
  backgroundColor: BG_COLOR,
  padding: "8px",
}));

export interface TourItem {
  uri: string;
  display: string;
}

function TourItemDisplay({ item, lang = "en" }: { item: TourItem; lang?: string }) {
  return (
    <Accordion>
      <AccordionSummary>
        <b>{mmtHTMLToReact(item.display)}</b>
      </AccordionSummary>
      <AccordionDetails>
        <ContentFromUrl url={`${BASE_URL}/:vollki/frag?path=${item.uri}&lang=${lang}`} />
      </AccordionDetails>
    </Accordion>
  );
}

export function TourDisplay({ items, lang = "en" }: { items: TourItem[]; lang?: string }) {
  return (
    <>
      {items.map((item) => (
        <TourItemDisplay key={item.uri} item={item} lang={lang} />
      ))}
    </>
  );
}
