import { Box, CircularProgress } from '@mui/material';
import { SectionsAPIData, getAncestors, lastFileNode } from '@stex-react/api';
import { BG_COLOR, shouldUseDrawer } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { ContentDashboard } from './ContentDashboard';
import { LayoutWithFixedMenu } from './LayoutWithFixedMenu';
import { PerSectionQuiz } from './PerSectionQuiz';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext } from './stex-react-renderer';

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
  contentUrl,
  courseId,
  topOffset = 0,
  noFrills = false,
  startSecNameExcl,
  endSecNameIncl,
}: {
  contentUrl: string;
  courseId?: string;
  startSecNameExcl?: string;
  endSecNameIncl?: string;
  topOffset?: number;
  noFrills?: boolean;
}) {
  const { practiceProblems: t } = getLocaleObject(useRouter());
  const [showDashboard, setShowDashboard] = useState(!shouldUseDrawer());
  const [docSections, setDocSections] = useState<SectionsAPIData | undefined>(undefined);
  const { mmtUrl } = useContext(ServerLinksContext);
  const [selectedSection, setSelectedSection] = useState('');
  const ancestors = getAncestors(undefined, undefined, selectedSection, docSections);
  const [problemCounts, setProblemCounts] = useState<{ [id: string]: number }>({});

  const sectionParentInfo = lastFileNode(ancestors);
  // TODO alea-4
  // const coveredSectionIds =
  //   startSecNameExcl && endSecNameIncl
  //     ? getCoveredSections(startSecNameExcl, endSecNameIncl, docSections).coveredSectionIds
  //     : [];
  //   const shortenedDocSections = shortenDocSections(coveredSectionIds, docSections);

  useEffect(() => {
    //Todo alea-4
    // const { archive, filepath } = getSectionInfo(contentUrl);
    
    // getDocumentSections(mmtUrl, archive, filepath).then(setDocSections);
  }, [mmtUrl, contentUrl]);

  useEffect(() => {
    if (!courseId) return;
    axios.get(`/api/get-course-problem-counts/${courseId}`).then((resp) => {
      console.log(resp.data);
      setProblemCounts(resp.data);
    });
  }, [courseId]);
  if (!docSections) return <CircularProgress />;

  return (
    <LayoutWithFixedMenu
      menu={
        <ContentDashboard
          //TODO alea-4 coveredSectionIds={coveredSectionIds}
          courseId={courseId}
          toc={[]} //TODO alea-4
          onClose={() => setShowDashboard(false)}
          preAdornment={(sectionId) => {
            const numProblems = problemCounts[sectionId];
            if (numProblems === undefined) return <></>;
            return <i>({problemCounts[sectionId] || 'None'})&nbsp;</i>;
          }}
          selectedSection={selectedSection}
          onSectionClick={(section) => setSelectedSection(section)}
        />
      }
      topOffset={topOffset}
      showDashboard={showDashboard}
      setShowDashboard={setShowDashboard}
      noFrills={noFrills}
    >
      <Box px="10px" bgcolor={BG_COLOR}>
        {ancestors?.length && (
          <h3>
            <span style={{ color: 'gray' }}>{t.problemsFor}</span>{' '}
            {/* TODO ALEA-4 */}
            {/* mmtHTMLToReact(ancestors[ancestors.length - 1].title ?? '') */}
          </h3>
        )}
        {!selectedSection && (
          <>
            <br />
            <i>{t.clickSection}</i>
          </>
        )}
        {sectionParentInfo?.archive && sectionParentInfo?.filepath && (
          <PerSectionQuiz
            key={sectionParentInfo.filepath} // Use a key to avoid race-conditions on section change
            archive={sectionParentInfo.archive}
            filepath={sectionParentInfo.filepath}
            showButtonFirst={false}
          />
        )}
        <br />
        <b style={{ color: 'red' }}>{t.warning}</b>
      </Box>
    </LayoutWithFixedMenu>
  );
}
