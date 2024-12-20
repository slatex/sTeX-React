import { Delete, Edit, Groups } from "@mui/icons-material";
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import {  getJobPost, getRecruiterProfile, JobPostInfo } from "@stex-react/api";
import { useEffect, useState } from "react";
import JobPostInformation from "./JobPostInformation";

export function CreatedJobs() {
    const[loading,setLoading] = useState(false);
    const[totalJobPosts,setTotalJobPosts] = useState<JobPostInfo[]>([]);
    
    const fetchJobPostData = async () => {
        try {
          setLoading(true); 
          const recruiterProfileData = await getRecruiterProfile(); 
          const organizationId = recruiterProfileData[0]?.organizationId; 
      
          if (!organizationId) {
            console.error("Organization ID is undefined.");
            return;
          }
          const res = await getJobPost(organizationId); 
          setTotalJobPosts(res);
        } catch (error) {
          console.error("Error fetching job post data:", error); 
        } finally {
          setLoading(false); 
        }
      };
      
    useEffect(() => {
        fetchJobPostData();
      }, []);
      const handleEdit = (job) => {
console.log("hdhdhd");
      }
      const deleteJob =(job)=> {
 console.log("hdhdhdh");
      }
    //   const renderActions = (job) => (
    //     <>
    //       <IconButton onClick={() => handleEdit} color="primary">
    //         <Edit />
    //       </IconButton>
    //       <IconButton onClick={() => deleteJob} color="error">
    //         <Delete />
    //       </IconButton>
    //       <IconButton onClick={() => deleteJob} color="primary">
    //         <Groups />
    //       </IconButton>
    //     </>
    //   );
 

const renderActions = (job) => (
  <>
    <Tooltip title="Edit">
      <IconButton onClick={() => handleEdit(job)} color="primary">
        <Edit />
      </IconButton>
    </Tooltip>
    <Tooltip title="Delete">
      <IconButton onClick={() => deleteJob(job)} color="error">
        <Delete />
      </IconButton>
    </Tooltip>
    <Tooltip title="Applicants">
      <IconButton onClick={() => viewApplicants(job)} color="primary">
        <Groups />
      </IconButton>
    </Tooltip>
  </>
);

    return (
        <TableContainer component={Paper}>
        {/* <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session</TableCell>
              <TableCell>JobTitle</TableCell>
              <TableCell >Actions</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
    Session
  </TableCell>
  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
    Job Title
  </TableCell>
  <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
    Actions
  </TableCell>
</TableRow>

          </TableHead>
           <TableBody>
            {totalJobPosts.length > 0 ? (
              totalJobPosts.map((job, index) => (
                <TableRow key={index}>
                  <TableCell>{job.session}</TableCell>
                  <TableCell>{job.jobTitle}</TableCell>
                  <TableCell>{renderActions(job)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No jobs created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table> */}

<Table>
  <TableHead>
    <TableRow sx={{ backgroundColor: 'primary.main', color: 'white' }}>
      <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
        Session
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
        Job Title
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
        Actions
      </TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {totalJobPosts.length > 0 ? (
      totalJobPosts.map((job, index) => (
        <TableRow key={index}>
          <TableCell sx={{ textAlign: 'center' }}>{job.session}</TableCell>
          <TableCell sx={{ textAlign: 'center' }}>{job.jobTitle}</TableCell>
          <TableCell sx={{ textAlign: 'center' }}>{renderActions(job)}</TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
          No jobs created yet.
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

      </TableContainer>
    );
  }