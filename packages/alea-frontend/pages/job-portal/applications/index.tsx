// import { useState } from 'react';
// import {
//   Box,
//   Button,
//   Typography,
//   Chip,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Tooltip,
//   Select,
//   MenuItem,
// } from '@mui/material';
// import { CheckCircle, Cancel, PendingActions } from '@mui/icons-material';

// const defaultJobs = [
//   {
//     id: 1,
//     jobTitle: 'Frontend Developer',
//     companyName: 'Google',
//     applicationStatus: 'PENDING',
//     applicantAction: '',
//     appliedDate: '2024-06-10',
//   },
//   {
//     id: 2,
//     jobTitle: 'Backend Developer',
//     companyName: 'Amazon',
//     applicationStatus: 'OFFERED',
//     applicantAction: 'ACCEPT_OFFER',
//     appliedDate: '2024-06-12',
//   },
//   {
//     id: 3,
//     jobTitle: 'Full Stack Engineer',
//     companyName: 'Meta',
//     applicationStatus: 'REJECTED',
//     applicantAction: 'REJECT_OFFER',
//     appliedDate: '2024-06-15',
//   },
// ];

// const AppliedJobsPage = () => {
//   const [appliedJobs, setAppliedJobs] = useState(defaultJobs);
//   const [filter, setFilter] = useState('ALL');
//   const [sortOrder, setSortOrder] = useState('NEWEST');

//   const filteredJobs = appliedJobs.filter((job) =>
//     filter === 'ALL' ? true : job.applicationStatus === filter
//   );

//   const sortedJobs = [...filteredJobs].sort((a, b) =>
//     sortOrder === 'NEWEST'
//       ? new Date(b.appliedDate) - new Date(a.appliedDate)
//       : new Date(a.appliedDate) - new Date(b.appliedDate)
//   );

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           width: '100%',
//           maxWidth: 800,
//           mb: 3,
//         }}
//       >
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           {['ALL', 'PENDING', 'OFFERED', 'REJECTED'].map((status) => (
//             <Button
//               key={status}
//               variant={filter === status ? 'contained' : 'outlined'}
//               onClick={() => setFilter(status)}
//             >
//               {status}
//             </Button>
//           ))}
//         </Box>
//         <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
//           <MenuItem value="NEWEST">Newest First</MenuItem>
//           <MenuItem value="OLDEST">Oldest First</MenuItem>
//         </Select>
//       </Box>

//       {/* Jobs Table */}
//       <TableContainer
//         component={Paper}
//         sx={{
//           width: '100%',
//           maxWidth: 800,
//           backdropFilter: 'blur(10px)',
//           backgroundColor: 'rgba(255, 255, 255, 0.1)',
//           borderRadius: 3,
//           overflow: 'hidden',
//         }}
//       >
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Job Title</TableCell>
//               <TableCell>Company</TableCell>
//               <TableCell>Status</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sortedJobs.map((job) => (
//               <TableRow key={job.id} hover>
//                 <TableCell>{job.jobTitle}</TableCell>
//                 <TableCell>{job.companyName}</TableCell>
//                 <TableCell>
//                   <Chip
//                     label={
//                       job.applicationStatus === 'OFFERED'
//                         ? 'Offer Received'
//                         : job.applicationStatus === 'REJECTED'
//                         ? 'Rejected'
//                         : 'Pending'
//                     }
//                     color={
//                       job.applicationStatus === 'OFFERED'
//                         ? 'success'
//                         : job.applicationStatus === 'REJECTED'
//                         ? 'error'
//                         : 'warning'
//                     }
//                     icon={
//                       job.applicationStatus === 'OFFERED' ? (
//                         <CheckCircle />
//                       ) : job.applicationStatus === 'REJECTED' ? (
//                         <Cancel />
//                       ) : (
//                         <PendingActions />
//                       )
//                     }
//                   />
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default AppliedJobsPage;

import { FC, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from '@mui/material';
import { CheckCircle, Cancel, PendingActions } from '@mui/icons-material';
const defaultJobs = [
  {
    id: 1,
    jobTitle: 'Frontend Developer',
    companyName: 'Google',
    applicationStatus: 'PENDING',
    applicantAction: '',
    appliedDate: '2024-06-10',
  },
  {
    id: 2,
    jobTitle: 'Backend Developer',
    companyName: 'Amazon',
    applicationStatus: 'OFFERED',
    applicantAction: 'ACCEPT_OFFER',
    appliedDate: '2024-06-12',
  },
  {
    id: 3,
    jobTitle: 'Full Stack Engineer',
    companyName: 'Meta',
    applicationStatus: 'REJECTED',
    applicantAction: 'REJECT_OFFER',
    appliedDate: '2024-06-15',
  },
];

interface Job {
  id: number;
  jobTitle: string;
  companyName: string;
  applicationStatus: string;
  applicantAction: string;
  appliedDate: string;
}

interface AppliedJobsProps {
  appliedJobs: Job[];
  filter: string;
  sortOrder: string;
  setFilter: (status: string) => void;
  setSortOrder: (order: string) => void;
}

export function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState(defaultJobs);
  const [filter, setFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const filteredJobs = appliedJobs.filter((job) =>
    filter === 'ALL' ? true : job.applicationStatus === filter
  );

  const sortedJobs = [...filteredJobs].sort((a, b) =>
    sortOrder === 'NEWEST'
      ? new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      : new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      hlo
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 800,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {['ALL', 'PENDING', 'OFFERED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'contained' : 'outlined'}
              onClick={() => setFilter(status)}
            >
              {status}
            </Button>
          ))}
        </Box>
        <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <MenuItem value="NEWEST">Newest First</MenuItem>
          <MenuItem value="OLDEST">Oldest First</MenuItem>
        </Select>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          maxWidth: 800,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedJobs.map((job) => (
              <TableRow key={job.id} hover>
                <TableCell>{job.jobTitle}</TableCell>
                <TableCell>{job.companyName}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      job.applicationStatus === 'OFFERED'
                        ? 'Offer Received'
                        : job.applicationStatus === 'REJECTED'
                        ? 'Rejected'
                        : 'Pending'
                    }
                    color={
                      job.applicationStatus === 'OFFERED'
                        ? 'success'
                        : job.applicationStatus === 'REJECTED'
                        ? 'error'
                        : 'warning'
                    }
                    icon={
                      job.applicationStatus === 'OFFERED' ? (
                        <CheckCircle />
                      ) : job.applicationStatus === 'REJECTED' ? (
                        <Cancel />
                      ) : (
                        <PendingActions />
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
    </Box>
  );
}
