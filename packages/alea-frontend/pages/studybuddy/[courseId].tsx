import { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../layouts/MainLayout';
import { BG_COLOR } from '@stex-react/utils';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Days, Languages, Presence, getAuthHeaders } from '@stex-react/api';
import { CourseHeader } from '../course-home/[courseId]';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';

const StudyBudyPage: NextPage = () => {
  const router = useRouter();
  const courseId = router.query.courseId as string;
  const [userInfo, setUserInfo] = useState(null);
  const [userLanguages, setUserLanguages] = useState([]);
  const [userDays, setUserDays] = useState([]);
  const [studybuddies, setStudyBuddies] = useState(null);
  const [userInfoChanged, setUserInfoChanged] = useState(false);

  const getData = (courseId: string) => {
    const apiCalls = [
      `/api/studybuddy/get-user-info/${courseId}`,
      `/api/studybuddy/get-studybuddies/${courseId}`,
    ];
    Promise.all(
      apiCalls.map((apiCall) =>
        axios.get(apiCall, { headers: getAuthHeaders() })
      )
    )
      .then(([{ data: user }, { data: buddies }]) => {
        setUserInfo(user);
        const lang: string[] = user.languages.split('/');
        lang.forEach((element) => {
          setUserLanguages([...userLanguages, element]);
        });
        const da: string[] = user.time.split('/');
        da.forEach((element) => {
          setUserDays([...userDays, element]);
        });
        console.log('lang' + userLanguages);
        console.log(user);
        setStudyBuddies(buddies);
        console.log(buddies);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    if (!courseId) return;
    getData(courseId);
  }, [courseId]);


  /**
   * TODO: Create the header to show course information
   * @returns header
   */
  function StudyBudyHeader() {
    return <Box></Box>;
  }

  const handleLanguage = (event: SelectChangeEvent<typeof userLanguages>) => {
    const {
      target: { value },
    } = event;
    setUserInfoChanged(true);
    setUserLanguages(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDay = (event: SelectChangeEvent<typeof userDays>) => {
    const {
      target: { value },
    } = event;
    setUserInfoChanged(true);
    setUserDays(typeof value === 'string' ? value.split(',') : value);
  };

  /**
   * TODO: Add requirements and checks to all fields, Remove bug with onChange where element gets rerendered and therefore deselected when writing
   * @returns 
   */
  function StudyBudyInfoTemplate() {
      return (
        <Box>
          <h1>About you</h1>
          <Box width="900px" border={1} borderColor="gray">
            <Grid container spacing={1} columns={15}>
              <Grid item xs={3}>
                <span>Intro</span>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="outlined-basic"
                  defaultValue={userInfo ? userInfo.intro : "Write something about yourself (max 60. chars)"}
                  variant="outlined"
                  onChange={(event) => {setUserInfoChanged(true); setUserInfo({...userInfo, intro: event.target.value})}}
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <span>Study program</span>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="outlined-basic"
                  defaultValue={userInfo ? userInfo.studyProgram : "e.g. computer science"}
                  variant="outlined"
                  onChange={(event) => {setUserInfoChanged(true); setUserInfo({...userInfo, studyProgram: event.target.value})}}
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <span>Semester#</span>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  id="outlined-basic"
                  defaultValue={userInfo ? userInfo.semester : 0}
                  variant="outlined"
                  type="number"
                  onChange={(event) => {setUserInfoChanged(true); setUserInfo({...userInfo, semester: event.target.value})}}
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <span>E-Mail</span>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="outlined-basic"
                  defaultValue={userInfo ? userInfo.email : "e.g. example@fau.de"}
                  variant="outlined"
                  onChange={(event) =>  {setUserInfoChanged(true); setUserInfo({...userInfo, email: event.target.value})}}
                  fullWidth
                />
              </Grid>
              <Grid item xs={3}>
                <span>Presence</span>
              </Grid>
              <Grid item xs={3}>
                <Select
                  id="outlined-basic"
                  value={userInfo ? userInfo.presence : ""}
                  variant="outlined"
                  onChange={(event) => {setUserInfoChanged(true); setUserInfo({...userInfo, presence: event.target.value})}}
                  fullWidth
                >
                  {Object.keys(Presence).map((key) => (
                    <MenuItem key={key} value={key}>
                      {Presence[key]}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={3}>
                <span>Time</span>
              </Grid>
              <Grid item xs={6}>
                <Select
                  id="outlined-basic"
                  value={userInfo ? userDays : []}
                  multiple
                  variant="outlined"
                  onChange={handleDay}
                  renderValue={(selected) => selected.join(', ')}
                  fullWidth
                >
                  {Object.keys(Days).map((key) => (
                    <MenuItem key={key} value={key}>
                      <Checkbox checked={userDays.indexOf(key) > -1} />
                      <ListItemText primary={Days[key]} />
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={3}>
                <span>Languages</span>
              </Grid>
              <Grid item xs={3}>
                <Select
                  id="outlined-basic"
                  value={userInfo ? userLanguages : []}
                  multiple
                  variant="outlined"
                  onChange={handleLanguage}
                  renderValue={(selected) => selected.join(', ')}
                  fullWidth
                >
                  {Object.keys(Languages).map((key) => (
                    <MenuItem key={key} value={key}>
                      <Checkbox checked={userLanguages.indexOf(key) > -1} />
                      <ListItemText primary={Languages[key]} />
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={1}>
                <Checkbox></Checkbox>
              </Grid>
              <Grid item xs={11}>
                <span>
                  I understand that these informations will be used to find and
                  connect to other study buddy connect users
                </span>
              </Grid>
              <Grid item xs={3}>
                {infoButtonRender()}
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
  }

  /**
   * Add post requests
   * @returns 
   */
  function infoButtonRender() {
    if (!userInfo || !userInfo.active) {
      return (
        <Button variant="contained" onClick={updateUser} fullWidth>
          Start searching
        </Button>
      );
    }
    else if (userInfoChanged) {
      return (
        <Button variant="contained" fullWidth>
          Update info
        </Button>
      );
    } else if (userInfo && userInfo.active) {
      return (
        <Button variant="contained" fullWidth>
          Stop searching
        </Button>
      );
    } else {
      <Button variant="contained" fullWidth>
      Start searching
    </Button>
    }
  }

  /**
   * Create post request
   * @returns 
   */
  const updateUser = async () => {
    return ;
  }

  /**
   * TODO Add request initialization and revoking for study partners
   * @param param0 
   * @returns 
   */
  function StudyBudyListing({ listType, list }) {
    if (studybuddies)
      return (
        <Box>
          <h1>{listType}</h1>
          <Paper style={{ height: '500px', overflow: 'auto' }}>
            <List>
              {list.map((studybuddy) => (
                <ListItem key={studybuddy.userId}>
                  <Grid container spacing={1} columns={12}>
                    <Grid item xs={2}>
                      {studybuddy.userId}
                    </Grid>
                    <Grid item xs={3}>
                      email
                    </Grid>
                    <Grid item xs={3}>
                      Computer Science
                    </Grid>
                    <Grid item xs={3}>
                      Semester 3
                    </Grid>
                    <Grid item xs={1}>
                      <Cancel></Cancel>
                    </Grid>
                    <Grid item xs={2}>
                      Time
                    </Grid>
                    <Grid item xs={3}>
                      Mon/Wen
                    </Grid>
                    <Grid item xs={3}>
                      Languages
                    </Grid>
                    <Grid item xs={3}>
                      de/en
                    </Grid>
                    <Grid item xs={8}>
                      I am searching for a study budy
                    </Grid>
                    <Grid item xs={3}>
                      presence online
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      );
  }

  return (
    <MainLayout
      title={(courseId || '').toUpperCase() + `VoLL-KI`}
      bgColor={BG_COLOR}
    >
      <Box
        maxWidth="900px"
        m="auto"
        px="10px"
        display="flex"
        flexDirection="column"
      >
        <StudyBudyHeader />

        <StudyBudyInfoTemplate />
        <StudyBudyListing
          listType={'Matches'}
          list={studybuddies ? studybuddies.connected : null}
        />
        <StudyBudyListing
          listType={'You liked'}
          list={studybuddies ? studybuddies.requestSent : null}
        />
        <StudyBudyListing
          listType={'Other potential study buddies'}
          list={studybuddies ? studybuddies.other : null}
        />
      </Box>
    </MainLayout>
  );
};
export default StudyBudyPage;
