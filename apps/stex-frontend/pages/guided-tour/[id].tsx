import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import axios from "axios";
import { getOuterHTML } from "domutils";
import { parseDocument } from "htmlparser2";
import MainLayout from "../../layouts/MainLayout";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TourDisplay, TourItem } from "../../components/TourDisplay";
import { ToursAutocomplete } from "../../components/ToursAutocomplete";
import { BASE_URL, BG_COLOR } from "../../constants";

function filterByName(nodes: any[], name: string): any[] {
  return nodes.filter((node) => (node as any).name === name);
}

function getTourItems(tourResponse: string) {
  const tourItems = [];
  const items = parseDocument(tourResponse).children;
  const trNodes = filterByName(items, "tr");
  for (const trNode of trNodes) {
    const tdNode = filterByName((trNode as any).childNodes, "td")[0];
    const aNode = filterByName((tdNode as any).childNodes, "a")[0];
    const display = getOuterHTML(aNode.childNodes[0].childNodes[1]);
    const href: string = aNode.attribs?.href?.substring();
    const uri = href.substring(21, href.length - 2);
    tourItems.push({ uri, display });
  }
  return tourItems;
}
// HACK: Get this from MMT server.
const USER_MODELS = ["professor", "testuser1", "nulluser"];

const GuidedTourPage: NextPage = () => {
  const [tourItems, setTourItems] = useState([] as TourItem[]);
  const [userModel, setUserModel] = useState(USER_MODELS[2]);
  const [language, setLanguage] = useState("en");
  const router = useRouter();
  const id = router.query.id as string;

  useEffect(() => {
    // https://mmt.beta.vollki.kwarc.info/:vollki?path=http://mathhub.info/sTeX/ComputerScience/Software/mod/systems/tex?sTeX
    // https://mmt.beta.vollki.kwarc.info/:vollki/tour?path=http://mathhub.info/sTeX/Algebra/General/mod/props?Absorption&user=nulluser&lang=en
    setTourItems([]);
    if (!router.isReady) return;
    const decoded = decodeURI(id);
    const url = `${BASE_URL}/:vollki/tour?path=${decoded}&user=${userModel}&lang=${language}`;
    axios.get(url).then((r) => setTourItems(getTourItems(r.data)));
  }, [id, userModel, language, router.isReady]);

  return (
    <MainLayout title="Guided Tour">
      <Box m="10px">
        <ToursAutocomplete />
        <FormControl style={{ minWidth: "100px", margin: "10px 20px 10px 0" }}>
          <InputLabel id="user-select-label">User Model</InputLabel>
          <Select
            labelId="user-select-label"
            id="user-select"
            name="userModel"
            label="User Model"
            value={userModel}
            onChange={(e) => setUserModel(e.target.value)}
          >
            {USER_MODELS.map((userModel) => (
              <MenuItem key={userModel} value={userModel}>
                {userModel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: "100px", margin: "10px 0" }}>
          <InputLabel id="lang-select-label">Language</InputLabel>
          <Select
            labelId="lang-select-label"
            id="lang-select"
            name="language"
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="de">German</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex">
          <Box flexGrow={1} bgcolor={BG_COLOR}>
            <TourDisplay items={tourItems} lang={language} />
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default GuidedTourPage;
