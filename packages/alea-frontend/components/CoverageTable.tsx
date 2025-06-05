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


function calculateLectureProgress(entries: CoverageEntry[], sectionList: Array<{ title: string; uri: string }>) {
  const normalize = (s: string) => s?.trim().toLowerCase() || '';
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  // Map section names to order in sectionList
  const sectionToOrder = new Map<string, number>();
  sectionList.forEach((section, index) => {
    sectionToOrder.set(normalize(section.title), index);
  });
  
  const completedSections: Array<{ order: number; sectionName: string; date: string }> = [];
  const targetSections: Array<{ order: number; sectionName: string; date: string }> = [];
  const pendingUpdates: Array<{ order: number; sectionName: string; targetSectionName: string; date: string; status: string }> = [];
  
  entries.forEach(entry => {
    const completedName = normalize(entry.sectionName);
    const targetName = normalize(entry.targetSectionName);
    const entryDate = new Date(entry.timestamp_ms);
    const dateString = entryDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    console.log(`Processing entry: "${entry.sectionName}" -> "${entry.targetSectionName}" (${dateString})`);
    
    // Check if this is an "Update pending" or incomplete entry
    const isUpdatePending = !entry.sectionName?.trim() || 
                           entry.sectionName?.toLowerCase().includes('update') ||
                           entry.sectionName?.toLowerCase().includes('pending') ||
                           entry.sectionName === 'Update pending' ||
                           // If sectionName doesn't match any known section but targetSection does
                           (entry.sectionName?.trim() && !sectionToOrder.has(completedName) && sectionToOrder.has(targetName));
    
    if (isUpdatePending && entry.targetSectionName?.trim()) {
      console.log(`Detected pending update: "${entry.sectionName}" for target "${entry.targetSectionName}"`);
      // This is a pending update - check if target matches our section list
      if (sectionToOrder.has(targetName)) {
        const order = sectionToOrder.get(targetName)!;
        pendingUpdates.push({
          order,
          sectionName: entry.sectionName || 'Update pending',
          targetSectionName: entry.targetSectionName,
          date: dateString,
          status: 'pending'
        });
      } else {
        pendingUpdates.push({
          order: -1,
          sectionName: entry.sectionName || 'Update pending',
          targetSectionName: entry.targetSectionName,
          date: dateString,
          status: 'target not matched'
        });
      }
    } else {
      // Handle completed sections
      if (entry.sectionName?.trim() && sectionToOrder.has(completedName)) {
        const order = sectionToOrder.get(completedName)!;
        if (!completedSections.find(c => c.order === order)) {
          completedSections.push({
            order,
            sectionName: entry.sectionName,
            date: dateString
          });
        }
      }
    }
    
    // Handle target sections
    if (entry.targetSectionName?.trim() && sectionToOrder.has(targetName)) {
      const order = sectionToOrder.get(targetName)!;
      if (!targetSections.find(t => t.order === order)) {
        targetSections.push({
          order,
          sectionName: entry.targetSectionName,
          date: dateString
        });
      }
    }
  });
  
  // Identify overdue pending updates
  const overduePending = pendingUpdates.filter(pending => {
    const pendingDate = new Date(pending.date);
    pendingDate.setHours(0, 0, 0, 0);
    return pendingDate <= today && pending.status === 'pending';
  });
  
  completedSections.sort((a, b) => a.order - b.order);
  targetSections.sort((a, b) => a.order - b.order);
  pendingUpdates.sort((a, b) => a.order - b.order);
  
  console.log('Completed Sections:', completedSections.map(c => `${c.order}: ${c.sectionName}`));
  console.log('Target Sections:', targetSections.map(t => `${t.order}: ${t.sectionName}`));
  console.log('Pending Updates:', pendingUpdates.map(p => `${p.order}: ${p.targetSectionName} (${p.status}) - ${p.date}`));
  console.log('Overdue Pending:', overduePending.map(p => `${p.order}: ${p.targetSectionName} - ${p.date}`));
  
  if (completedSections.length === 0 && pendingUpdates.length === 0) {
    console.log('No completed lectures found.');
    return {
      status: 'No completed lectures',
      currentLecture: -1,
      completedSections,
      targetSections,
      pendingUpdates,
      overduePending
    };
  }

  // Get the latest entry (either completed or pending)
  const latestCompleted = completedSections.length > 0 ? completedSections[completedSections.length - 1] : null;
  const latestPending = pendingUpdates.length > 0 ? pendingUpdates[pendingUpdates.length - 1] : null;
  
  // Determine current status based on latest entry and overdue items
  let status = 'on-track';
  let currentLecture = -1;
  let progressDifferenceByIndex = 0;
  let comments: string[] = [];
  
  // Check if we're ahead by comparing each completed section with target sections using for loop
  let maxAheadCount = 0;
  let aheadSections: Array<{ completedSection: string; targetIndex: number; completedIndex: number; aheadBy: number }> = [];
  
  // Loop through each completed section to check if it appears ahead in target sections
  for (let i = 0; i < completedSections.length; i++) {
    const completedSection = completedSections[i];
    
    // Find this completed section in the target sections array
    for (let j = 0; j < targetSections.length; j++) {
      const targetSection = targetSections[j];
      
      // If section names match (normalized comparison)
      if (normalize(completedSection.sectionName) === normalize(targetSection.sectionName)) {
        // Check if completed section index is less than target section index (we're ahead)
        if (i < j) {
          const aheadBy = j - i; // How many positions ahead
          aheadSections.push({
            completedSection: completedSection.sectionName,
            targetIndex: j,
            completedIndex: i,
            aheadBy: aheadBy
          });
          
          // Track the maximum ahead count
          if (aheadBy > maxAheadCount) {
            maxAheadCount = aheadBy;
          }
        }
        break; // Found the match, no need to continue inner loop
      }
    }
  }
  
  // Set ahead status if we found any ahead sections
  if (maxAheadCount > 0) {
    status = `${maxAheadCount} lecture${maxAheadCount > 1 ? 's' : ''} ahead`;
    progressDifferenceByIndex = -maxAheadCount; // Negative for ahead
    comments.push(`Ahead sections: ${aheadSections.map(a => `${a.completedSection} (${a.aheadBy} ahead)`).join(', ')}`);
  }
  
  // Set current lecture if we have completed sections
  if (latestCompleted) {
    currentLecture = latestCompleted.order;
  }
  
  // ALSO check for pending updates logic (check both conditions)
  if (overduePending.length > 0) {
    currentLecture = latestCompleted ? latestCompleted.order : -1;
    
    // Count how many lectures behind based on overdue pending updates
    const lecturesBehind = overduePending.length;
    
    // If we're ahead but also have overdue items, combine the status
    if (maxAheadCount > 0) {
      status = `${maxAheadCount} lecture${maxAheadCount > 1 ? 's' : ''} ahead but ${lecturesBehind} overdue`;
    } else {
      status = `${lecturesBehind} lecture${lecturesBehind > 1 ? 's' : ''} behind`;
    }
    
    const overdueNames = overduePending.map(p => p.targetSectionName);
    comments.push(`Overdue: ${overdueNames.join(', ')}`);
    
    // Adjust progress difference to account for overdue items
    if (maxAheadCount > 0) {
      progressDifferenceByIndex = -maxAheadCount + lecturesBehind; // Reduce the ahead count by overdue items
    } else {
      progressDifferenceByIndex = lecturesBehind;
    }
    
  } else if (latestPending && (!latestCompleted || new Date(latestPending.date) >= new Date(latestCompleted.date))) {
    // Latest entry is a pending update but not overdue
    currentLecture = latestCompleted ? latestCompleted.order : -1;
    
    if (latestPending.status === 'target not matched') {
      // If we're ahead but target not matched, keep ahead status but add comment
      if (maxAheadCount === 0) {
        status = 'target not matched';
      }
      comments.push(`Latest entry "${latestPending.targetSectionName}" does not match any section in the curriculum`);
    } else {
      // Check if we're on track for future targets
      const targetDate = new Date(latestPending.date);
      if (targetDate > today && maxAheadCount === 0) {
        status = 'on-track';
        comments.push(`Next target: "${latestPending.targetSectionName}" due ${latestPending.date}`);
      } else if (maxAheadCount > 0) {
        comments.push(`Next target: "${latestPending.targetSectionName}" due ${latestPending.date}`);
      }
    }
  }
  
  console.log('Progress Status:', status);
  if (comments.length > 0) {
    console.log('Comments:', comments.join('; '));
  }
  
  return {
    status,
    currentLecture,
    completedSections,
    targetSections,
    pendingUpdates,
    overduePending,
    latestCompleted: latestCompleted ? {
      name: latestCompleted.sectionName,
      order: latestCompleted.order,
      date: latestCompleted.date
    } : null,
    latestPending: latestPending ? {
      targetName: latestPending.targetSectionName,
      order: latestPending.order,
      date: latestPending.date,
      status: latestPending.status
    } : null,
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