import { Box, CircularProgress } from '@mui/material';
import { SectionsAPIData, TOCElem, getDocumentSections } from '@stex-react/api';
import { BG_COLOR, shouldUseDrawer } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ContentDashboard } from './ContentDashboard';
import { getLocaleObject } from './lang/utils';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { PerSectionQuiz } from './PerSectionQuiz';

function shortenDocSections(coveredSectionIds: string[], docSections?: SectionsAPIData) {
  if (!coveredSectionIds.length || !docSections) return docSections;
  const newChildren: SectionsAPIData[] = [];
  for (const child of docSections.children || []) {
    const shortenedChild = shortenDocSections(coveredSectionIds, child);
    if (shortenedChild) newChildren.push(shortenedChild);
  }
  if (!newChildren.length && !coveredSectionIds.includes(docSections.id ?? '')) {
    return undefined;
  }
  const shortenedDocSections: SectionsAPIData = { ...docSections };
  shortenedDocSections.children = newChildren;

  return shortenedDocSections;
}

export function DocProblemBrowser({
  notesDocUri,
  courseId,
  topOffset = 0,
  noFrills = false,
  startSecNameExcl,
  endSecNameIncl,
}: {
  notesDocUri: string;
  courseId?: string;
  startSecNameExcl?: string;
  endSecNameIncl?: string;
  topOffset?: number;
  noFrills?: boolean;
}) {
  const { practiceProblems: t } = getLocaleObject(useRouter());
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [selectedSection, setSelectedSection] = useState<{ id: string; uri: string }>({
    id: '',
    uri: '',
  });
  const [problemCounts, setProblemCounts] = useState<{ [id: string]: number }>({});
  const [toc, setToc] = useState<TOCElem[]>([]);

  //const ancestors = getAncestors(undefined, undefined, selectedSection, docSections);
  // const sectionParentInfo = lastFileNode(ancestors);

  // const coveredSectionIds =
  //   startSecNameExcl && endSecNameIncl
  //     ? getCoveredSections(startSecNameExcl, endSecNameIncl, docSections).coveredSectionIds
  //     : [];
  //   const shortenedDocSections = shortenDocSections(coveredSectionIds, docSections);

  useEffect(() => {
    if (!notesDocUri) return;
    getDocumentSections(notesDocUri).then(([_, toc]) => {
      setToc(toc);
    });
  }, [notesDocUri]);

  useEffect(() => {
    if (!courseId) return;

    axios.get(`/api/get-course-problem-counts/${courseId}`).then((resp) => {
      console.log(resp.data);
      setProblemCounts(resp.data);
    });
  }, [courseId, notesDocUri]);
  if (!toc?.length) return <CircularProgress />;

  return (
    <LayoutWithFixedMenu
      menu={
        <ContentDashboard
          key={courseId}
          courseId={courseId}
          toc={toc}
          selectedSection={selectedSection.id}
          onClose={() => setShowDashboard(false)}
          onSectionClick={(sectionId, sectionUri) => {
            setSelectedSection({ id: sectionId, uri: sectionUri });
          }}
          preAdornment={(sectionId) => {
            const numProblems = problemCounts[sectionId];
            if (numProblems === undefined) return <></>;
            return <i>({problemCounts[sectionId] || 'None'})&nbsp;</i>;
          }}
        />
      }
      topOffset={topOffset}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      noFrills={noFrills}
    >
      <Box px="10px" bgcolor={BG_COLOR}>
        {/*ancestors?.length && (
          <h3>
            <span style={{ color: 'gray' }}>{t.problemsFor}</span> // TODO ALEA4-P1
            // mmtHTMLToReact(ancestors[ancestors.length - 1].title ?? '') 
          </h3>
        )}*/}
        {!selectedSection && (
          <>
            <br />
            <i>{t.clickSection}</i>
          </>
        )}
        {selectedSection?.uri && (
          <PerSectionQuiz
            sectionUri={selectedSection.uri}
            showButtonFirst={false}
          />
        )}
        <br />
        <b style={{ color: 'red' }}>{t.warning}</b>
      </Box>
    </LayoutWithFixedMenu>
  );
}
