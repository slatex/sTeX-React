import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { ContentFromUrl } from "components/ContentFromHtml";
import HTMLReactParser, { DOMNode, domToReact, Element } from "html-react-parser";
import { OverlayDialog } from "./components/OverlayDialog";
import { BASE_URL } from "./constants";

const ISSERVER = typeof window === "undefined";
export const localStore = ISSERVER ? undefined : localStorage;

function indexes(source: string, find: string): number[] {
  var startingIndices = [];
  var indexOccurence = source.indexOf(find, 0);
  while (indexOccurence >= 0) {
    startingIndices.push(indexOccurence);

    indexOccurence = source.indexOf(find, indexOccurence + 1);
  }
  return startingIndices;
}

function nearestTag(done: string) {
  for (let i = done.length - 1; i >= 0; i--) {
    if (done[i] === "<") {
      for (let j = i + 1; j < done.length - 1; j++) {
        if (done[j] === " ") {
          return "></" + done.substring(i + 1, j) + ">";
        }
      }
      break;
    }
  }
  return null;
}

// HACK: Get the correct (X)HTML from mmt to remove this function and its two helpers above.
export function fixSelfClosingTags(html: string) {
  const selfClosingLocs = indexes(html, "/>");
  if (selfClosingLocs?.length <= 0) return html;
  let fixed = html.substring(0, selfClosingLocs[0]);
  for (let i = 0; i < selfClosingLocs.length - 1; i++) {
    const tag = nearestTag(fixed) || " />";
    fixed += tag + html.substring(selfClosingLocs[i] + 2, selfClosingLocs[i + 1]);
  }

  const tag = nearestTag(fixed) || " />";
  fixed += tag + html.substring(selfClosingLocs[selfClosingLocs.length - 1] + 2);
  return fixed;
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

function removeStyleTag(style: string, tag: string) {
  const start = style.indexOf(tag);
  if (start == -1) return style;
  const end = style.indexOf(";", start + 1);
  if (end === -1) return style;
  return style.substring(0, start) + style.substring(end + 1);
}

// HACK: Return only the appropriate XHTML from MMT.
function getChildrenOfBodyNode(htmlNode: JSX.Element) {
  const body = htmlNode?.props?.children[1];
  return body?.props?.children;
}

export const replace = (domNode: DOMNode) => {
  if (!(domNode instanceof Element)) return;

  // HACK: Make MMT return only the required elements.
  if (domNode.attribs?.id === "stexMainOverlay" || domNode.attribs?.id === "sidenote-container") {
    return <></>;
  }
  if (domNode.name === "head" || domNode.name === "iframe" || domNode.name === "script") {
    return <></>;
  }
  if (!localStore?.getItem("no-responsive")) {
    // HACK: Make MMT return appropriate (X)HTML for responsive page.
    if (domNode.attribs?.class === "body") {
      domNode.attribs.style = removeStyleTag(
        removeStyleTag(domNode.attribs?.style, "padding-left"),
        "padding-right"
      );
    }

    if (domNode.attribs?.style) {
      domNode.attribs.style = removeStyleTag(
        removeStyleTag(domNode.attribs?.style, "min-width"),
        "width"
      );
    }
  }

  const properties = ["stex:definiendum", "stex:comp"];
  if (properties.some((x) => x === domNode.attribs?.property) && !domNode.attribs.processed) {
    if (domNode.attribs?.onmouseover) delete domNode.attribs.onmouseover;
    if (domNode.attribs?.onclick) delete domNode.attribs.onclick;
    if (domNode.attribs?.onmouseover) delete domNode.attribs.onmouseout;
    domNode.attribs.processed = "true";
    const resource = domNode.attribs.resource;
    const shortPath = `${BASE_URL}/:sTeX/fragment?${resource}&language=`; //+ getLanguage(t),
    const longPath = `${BASE_URL}/:sTeX/declaration?${resource}&language=`;

    return (
      <OverlayDialog
        contentUrl={longPath}
        displayNode={
          <NoMaxWidthTooltip
            title={
              <div style={{ minWidth: "300px", maxWidth: "600px" }}>
                <ContentFromUrl url={shortPath} process={(n) => getChildrenOfBodyNode(n)} />
              </div>
            }
          >
            {domToReact([domNode], { replace }) as any}
          </NoMaxWidthTooltip>
        }
      />
    );
  }
};

export function mmtHTMLToReact(html: string) {
  return HTMLReactParser(fixSelfClosingTags(html), { replace });
}

export function fixDuplicateLabels(RAW: { label: string }[]) {
  const fixed = [...RAW]; // create a copy;
  const labelToIndex = new Map<string, number[]>();
  for (const [idx, item] of fixed.entries()) {
    if (labelToIndex.has(item.label)) {
      labelToIndex.get(item.label)?.push(idx);
    } else {
      labelToIndex.set(item.label, [idx]);
    }
  }
  for (const [label, indexes] of labelToIndex.entries()) {
    if (indexes?.length <= 1) continue;
    for (const [idx, index] of indexes.entries()) {
      fixed[index].label = `${label} (${idx + 1})`;
    }
  }
  return fixed;
}
