import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';

interface CoverageEntry {
  id: string;
  timestamp_ms: number;
  sectionName: string;
  sectionUri: string;
  targetSectionName: string;
  targetSectionUri: string;
  clipId: string;
  isQuizScheduled: boolean;
  slideUri: string;
  slideNumber?: number;
}

interface CoverageTableProps {
  entries: CoverageEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  sectionList: Array<{ id: string; title: string; uri: string }>;
}

interface CoverageRowProps {
  item: CoverageEntry;
  originalIndex: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const formatSectionWithSlide = (sectionName: string, slideNumber?: number, slideUri?: string) => {
  if (!sectionName) return <i>-</i>;

  if (slideNumber && slideUri) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SlideshowIcon sx={{ fontSize: 16, color: 'success.main' }} />
        <Typography variant="body2">
          <strong>Slide {slideNumber}</strong> of {sectionName}
        </Typography>
      </Box>
    );
  } else {
    return <Typography variant="body2">{sectionName}</Typography>;
  }
};

function CoverageRow({ item, originalIndex, onEdit, onDelete }: CoverageRowProps) {
  const now = dayjs();
  const itemDate = dayjs(item.timestamp_ms);
  const isPast = itemDate.isBefore(now, 'day');
  const isFuture = itemDate.isAfter(now, 'day');
  const isToday = itemDate.isSame(now, 'day');
  const isNoSection = !item.sectionName || item.sectionName.trim() === '';
  const shouldHighlightNoSection = isNoSection && (isPast || isToday);

  let backgroundColor = 'inherit';
  let hoverBackgroundColor = 'action.hover';
  if (shouldHighlightNoSection) {
    backgroundColor = 'rgba(244, 67, 54, 0.15)';
    hoverBackgroundColor = 'rgba(244, 67, 54, 0.20)';
  } else if (isPast) {
    backgroundColor = 'rgba(237, 247, 237, 0.5)';
    hoverBackgroundColor = 'rgba(237, 247, 237, 0.7)';
  } else if (isFuture) {
    backgroundColor = 'rgba(255, 243, 224, 0.5)';
    hoverBackgroundColor = 'rgba(255, 243, 224, 0.7)';
  }

  return (
    <TableRow
      sx={{
        backgroundColor,
        '&:hover': {
          backgroundColor: hoverBackgroundColor,
        },
      }}
    >
      <TableCell>
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{
            color: isPast ? 'success.main' : isFuture ? 'warning.main' : 'text.primary',
            fontWeight: 'bold',
          }}
        >
          {itemDate.format('YYYY-MM-DD')}
        </Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={item.sectionName || (shouldHighlightNoSection ? 'No Section - Please fill this field' : 'No Section')}>
          {shouldHighlightNoSection ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'error.main', fontStyle: 'italic', fontWeight: 'bold' }}>
                Update pending
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', animation: 'blink 1.5s infinite' }}>
                ⚠️
              </Typography>
            </Box>
          ) : (
            formatSectionWithSlide(item.sectionName, item.slideNumber, item.slideUri)
          )}
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={item.targetSectionName || 'No Target'}>
          <Typography variant="body2">{item.targetSectionName || <i>-</i>}</Typography>
        </Tooltip>
      </TableCell>
      <TableCell>
        {item.clipId?.length ? (
          <Button
            variant="outlined"
            size="small"
            href={`https://fau.tv/clip/id/${item.clipId}`}
            target="_blank"
            rel="noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{ textTransform: 'none' }}
          >
            {item.clipId}
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            <i>-</i>
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {item.isQuizScheduled ? (
          <Chip icon={<QuizIcon />} label="Scheduled" size="small" color="warning" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            <i>No Quiz</i>
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(originalIndex)}
            sx={{
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(originalIndex)}
            sx={{
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}

interface CoverageEntry {
  sectionName: string;
  targetSectionName: string;
  date: string;
}

// function calculateLectureProgress(entries: CoverageEntry[], sectionList: Array<{ title: string; uri: string }>) {
//   const normalize = (s: string) => s?.trim().toLowerCase() || '';

//   // Map section names to order in sectionList
//   const sectionToOrder = new Map<string, number>();
//   sectionList.forEach((section, index) => {
//     sectionToOrder.set(normalize(section.title), index);
//   });

//   const completedSections: Array<{ order: number; sectionName: string; date: string }> = [];
//   const targetSections: Array<{ order: number; sectionName: string; date: string }> = [];

//   entries.forEach(entry => {
//     const completedName = normalize(entry.sectionName);
//     const targetName = normalize(entry.targetSectionName);

//     if (entry.sectionName.trim() && sectionToOrder.has(completedName)) {
//       const order = sectionToOrder.get(completedName)!;
//       if (!completedSections.find(c => c.order === order)) {
//         completedSections.push({
//           order,
//           sectionName: entry.sectionName,
//           date: entry.date
//         });
//       }
//     }

//     if (entry.targetSectionName.trim() && sectionToOrder.has(targetName)) {
//       const order = sectionToOrder.get(targetName)!;
//       if (!targetSections.find(t => t.order === order)) {
//         targetSections.push({
//           order,
//           sectionName: entry.targetSectionName,
//           date: entry.date
//         });
//       }
//     }
//   });

//   completedSections.sort((a, b) => a.order - b.order);
//   targetSections.sort((a, b) => a.order - b.order);

//   console.log('Completed Sections:', completedSections.map(c => `${c.order}: ${c.sectionName}`));
//   console.log('Target Sections:', targetSections.map(t => `${t.order}: ${t.sectionName}`));

//   if (completedSections.length === 0) {
//     console.log('No completed lectures found.');
//     return {
//       status: 'No completed lectures',
//       currentLecture: -1,
//       completedSections,
//       targetSections,
//     };
//   }

//   const latestCompleted = completedSections[completedSections.length - 1];
//   console.log('Latest Completed Section:', latestCompleted.sectionName, `(order: ${latestCompleted.order})`);

//   // Find indices of latest completed section in both arrays by normalized name
//   const completedIndex = completedSections.findIndex(
//     c => normalize(c.sectionName) === normalize(latestCompleted.sectionName)
//   );
//   const targetIndex = targetSections.findIndex(
//     t => normalize(t.sectionName) === normalize(latestCompleted.sectionName)
//   );

//   console.log(`Index of latest completed section in completedSections: ${completedIndex}`);
//   console.log(`Index of latest completed section in targetSections: ${targetIndex}`);

//   // If latest completed section is NOT in targetSections, fallback to order comparison
//   let indexDiff: number;
//   if (targetIndex !== -1 && completedIndex !== -1) {
//     indexDiff = completedIndex - targetIndex; // positive if completed is behind target, negative if ahead
//   } else {
//     console.warn('Latest completed section not found in target sections or completed sections.');
//     indexDiff = 0; // or some fallback value you prefer
//   }

//   let status = 'on-track';
//   if (indexDiff > 0) {
//     status = `${indexDiff} lecture${indexDiff > 1 ? 's' : ''} behind`; // target is ahead in targetSections
//   } else if (indexDiff < 0) {
//     status = `${Math.abs(indexDiff)} lecture${Math.abs(indexDiff) > 1 ? 's' : ''} ahead`; // completed is ahead in completedSections
//   }

//   console.log('Progress Status:', status);

//   return {
//     status,
//     currentLecture: latestCompleted.order,
//     completedSections,
//     targetSections,
//     latestCompleted: {
//       name: latestCompleted.sectionName,
//       order: latestCompleted.order,
//       date: latestCompleted.date
//     },
//     progressDifferenceByIndex: indexDiff
//   };
// }






// Usage: Just call with your actual data
// const result = calculateLectureProgress(yourEntries, yourSectionList);


function calculateLectureProgress(
  entries: CoverageEntry[],
  sectionList: Array<{ title: string; uri: string }>
) {
  const normalize = (s: string) => s?.trim().toLowerCase() || '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Map section titles to their order index
  const sectionToOrder = new Map(sectionList.map((s, i) => [normalize(s.title), i]));

  // Helper to push unique sections by order
  function pushUnique(arr: any[], item: any, orderKey = 'order') {
    if (!arr.some(x => x[orderKey] === item[orderKey])) arr.push(item);
  }

  // Helper: find surrounding target sections for a given completed section order
  function findSurroundingTargetIndexes(
    completedOrder: number,
    targets: { order: number; sectionName: string }[]
  ) {
    let prevTarget: { order: number; sectionName: string } | null = null;
    let nextTarget: { order: number; sectionName: string } | null = null;

    for (const target of targets) {
      if (target.order < completedOrder) {
        if (!prevTarget || target.order > prevTarget.order) prevTarget = target;
      } else if (target.order > completedOrder) {
        if (!nextTarget || target.order < nextTarget.order) nextTarget = target;
      }
    }
    return { prevTarget, nextTarget };
  }

  const completedSections: { order: number; sectionName: string; date: string }[] = [];
  const targetSections: { order: number; sectionName: string; date: string }[] = [];
  const pendingUpdates: {
    order: number;
    sectionName: string;
    targetSectionName: string;
    date: string;
    status: string;
  }[] = [];

  // Classify entries into completed, target, and pending
  entries.forEach(({ sectionName, targetSectionName, timestamp_ms }) => {
    const completedName = normalize(sectionName);
    const targetName = normalize(targetSectionName);
    const entryDate = new Date(timestamp_ms);
    const dateString = entryDate.toISOString().split('T')[0];

    const isUpdatePending =
      !sectionName?.trim() ||
      sectionName.toLowerCase().includes('update') ||
      sectionName.toLowerCase().includes('pending') ||
      sectionName === 'Update pending' ||
      (sectionName?.trim() && !sectionToOrder.has(completedName) && sectionToOrder.has(targetName));

    if (isUpdatePending && targetSectionName?.trim()) {
      const order = sectionToOrder.get(targetName) ?? -1;
      const status = order === -1 ? 'target not matched' : 'pending';

      pendingUpdates.push({ order, sectionName: sectionName || 'Update pending', targetSectionName, date: dateString, status });
    } else {
      if (sectionName?.trim() && sectionToOrder.has(completedName)) {
        pushUnique(completedSections, { order: sectionToOrder.get(completedName)!, sectionName, date: dateString });
      }
    }

    if (targetSectionName?.trim() && sectionToOrder.has(targetName)) {
      pushUnique(targetSections, { order: sectionToOrder.get(targetName)!, sectionName: targetSectionName, date: dateString });
    }
  });

  // Sort all arrays by order
  [completedSections, targetSections, pendingUpdates].forEach(arr => arr.sort((a, b) => a.order - b.order));

  // Filter overdue pending updates
  const overduePending = pendingUpdates.filter(p => {
    const pDate = new Date(p.date);
    pDate.setHours(0, 0, 0, 0);
    return p.status === 'pending' && pDate <= today;
  });

  if (completedSections.length === 0 && pendingUpdates.length === 0) {
    return {
      status: 'No completed lectures',
      currentLecture: -1,
      completedSections,
      targetSections,
      pendingUpdates,
      overduePending
    };
  }

  const latestCompleted = completedSections.at(-1) ?? null;
  const latestPending = pendingUpdates.at(-1) ?? null;

  // Check ahead status by comparing completed to target, including slightly ahead/behind
  let maxAheadCount = 0;
  const aheadSections: Array<{ sectionName: string; aheadBy: number }> = [];
  const comments: string[] = [];
  let status = 'on-track';

  for (let i = 0; i < completedSections.length; i++) {
    const comp = completedSections[i];
    const compOrder = comp.order;
    const targetIndex = targetSections.findIndex(t => normalize(t.sectionName) === normalize(comp.sectionName));

    if (targetIndex !== -1) {
      // Completed section is directly in targetSections
      if (i < targetIndex) {
        const aheadBy = targetIndex - i;
        if (aheadBy > 0) {
          aheadSections.push({ sectionName: comp.sectionName, aheadBy });
          if (aheadBy > maxAheadCount) maxAheadCount = aheadBy;
        }
      }
    } else {
      // Completed section NOT found in targetSections
      // Check if it falls between two target sections
      const { prevTarget, nextTarget } = findSurroundingTargetIndexes(compOrder, targetSections);

      if (prevTarget && nextTarget) {
        const distToPrev = compOrder - prevTarget.order;
        const distToNext = nextTarget.order - compOrder;

        if (distToPrev < distToNext) {
          comments.push(
            `Section "${comp.sectionName}" is slightly ahead between "${prevTarget.sectionName}" and "${nextTarget.sectionName}"`
          );
          if (status === 'on-track' || status.startsWith('slightly behind')) status = 'slightly ahead';
        } else {
          comments.push(
            `Section "${comp.sectionName}" is slightly behind between "${prevTarget.sectionName}" and "${nextTarget.sectionName}"`
          );
          if (status === 'on-track' || status.startsWith('slightly ahead')) status = 'slightly behind';
        }
      } else if (prevTarget && !nextTarget) {
        comments.push(`Section "${comp.sectionName}" is beyond last target "${prevTarget.sectionName}" - considered slightly ahead`);
        if (status === 'on-track' || status.startsWith('slightly behind')) status = 'slightly ahead';
      } else if (!prevTarget && nextTarget) {
        comments.push(`Section "${comp.sectionName}" is before first target "${nextTarget.sectionName}" - considered slightly behind`);
        if (status === 'on-track' || status.startsWith('slightly ahead')) status = 'slightly behind';
      } else {
        comments.push(`Section "${comp.sectionName}" does not match any known target section`);
        if (status === 'on-track') status = 'target not matched';
      }
    }
  }

  let progressDifferenceByIndex = 0;
  const currentLecture = latestCompleted?.order ?? -1;

  if (maxAheadCount > 0) {
    status = `${maxAheadCount} lecture${maxAheadCount > 1 ? 's' : ''} ahead`;
    progressDifferenceByIndex = -maxAheadCount;
    comments.push(`Ahead sections: ${aheadSections.map(a => `${a.sectionName} (${a.aheadBy} ahead)`).join(', ')}`);
  }

  if (overduePending.length > 0) {
    const lecturesBehind = overduePending.length;

    if (maxAheadCount > 0) {
      status = `${maxAheadCount} lecture${maxAheadCount > 1 ? 's' : ''} ahead but ${lecturesBehind} overdue`;
      progressDifferenceByIndex = -maxAheadCount + lecturesBehind;
    } else {
      status = `${lecturesBehind} lecture${lecturesBehind > 1 ? 's' : ''} behind`;
      progressDifferenceByIndex = lecturesBehind;
    }

    comments.push(`Overdue: ${overduePending.map(p => p.targetSectionName).join(', ')}`);
  } else if (latestPending && (!latestCompleted || new Date(latestPending.date) >= new Date(latestCompleted.date))) {
    if (latestPending.status === 'target not matched') {
      if (status === 'on-track') status = 'target not matched';
      comments.push(`Latest entry "${latestPending.targetSectionName}" does not match any section in the curriculum`);
    } else {
      const targetDate = new Date(latestPending.date);
      if (targetDate > today && status === 'on-track') {
        status = 'on-track';
      }
      comments.push(`Next target: "${latestPending.targetSectionName}" due ${latestPending.date}`);
    }
  }

  // === ADDITIONAL "over X lectures ahead/behind" LOGIC ===
  if (latestCompleted && targetSections.length > 0) {
    const targetOrders = targetSections.map(t => t.order);
    const firstTargetOrder = Math.min(...targetOrders);
    const lastTargetOrder = Math.max(...targetOrders);
    const completedOrder = latestCompleted.order;

    if (completedOrder > lastTargetOrder) {
      const overAheadBy = completedOrder - lastTargetOrder;
      status = `over ${overAheadBy} lecture${overAheadBy > 1 ? 's' : ''} ahead`;
      progressDifferenceByIndex = -overAheadBy;
      comments.push(`Latest completed "${latestCompleted.sectionName}" is ${overAheadBy} beyond the last target "${targetSections.at(-1)?.sectionName}"`);
    } else if (completedOrder < firstTargetOrder) {
      const overBehindBy = firstTargetOrder - completedOrder;
      status = `over ${overBehindBy} lecture${overBehindBy > 1 ? 's' : ''} behind`;
      progressDifferenceByIndex = overBehindBy;
      comments.push(`Latest completed "${latestCompleted.sectionName}" is ${overBehindBy} before the first target "${targetSections.at(0)?.sectionName}"`);
    }
  }

  return {
    status,
    currentLecture,
    completedSections,
    targetSections,
    pendingUpdates,
    overduePending,
    latestCompleted: latestCompleted
      ? { name: latestCompleted.sectionName, order: latestCompleted.order, date: latestCompleted.date }
      : null,
    latestPending: latestPending
      ? {
          targetName: latestPending.targetSectionName,
          order: latestPending.order,
          date: latestPending.date,
          status: latestPending.status
        }
      : null,
    progressDifferenceByIndex,
    comments
  };
}









export function CoverageTable({ entries, onEdit, onDelete, sectionList }: CoverageTableProps) {
  const sortedEntries = [...entries].sort((a, b) => a.timestamp_ms - b.timestamp_ms);
  const progress = calculateLectureProgress(entries, sectionList);
  console.log(progress.status); // e.g., "2 lectures ahead of target"
  console.log(progress.currentLecture); // index in targetSections array
  // e.g., 3 (if section name was "Lecture 3")

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lecture Progress: {progress.status}
      </Typography>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <style>
          {`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0.3; }
            }
          `}
        </style>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Section Completed</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Target Section</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Clip</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quiz</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEntries.map((item, idx) => {
              const originalIndex = entries.findIndex(entry => entry.id === item.id);
              return <CoverageRow key={`${item.timestamp_ms}-${idx}`} item={item} originalIndex={originalIndex} onEdit={onEdit} onDelete={onDelete} />;
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CoverageTable;