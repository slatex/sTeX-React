import { Box, Button } from "@mui/material";
import { BrowserAutocomplete } from "components/BrowserAutocomplete";
import { ToursAutocomplete } from "components/ToursAutocomplete";
import MainLayout from "layouts/MainLayout";
import type { NextPage } from "next";
import Image from "next/image";
import { localStore } from "utils";

const Home: NextPage = () => {
  return (
    <MainLayout title="VoLL-KI Home">
      <Box textAlign="center" m="20px">
        <Image src="/voll-ki.png" alt="VoLL-KI Logo" width={650} height={300} />
      </Box>
      <div>
        <main style={{ margin: "10px" }}>
          <BrowserAutocomplete />
          <Box m="10px auto" maxWidth="600px" textAlign="center">
            <ToursAutocomplete />
          </Box>
          <br />
          <br />
          <br />
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (localStore?.getItem("no-responsive")) localStore.removeItem("no-responsive");
              else localStore?.setItem("no-responsive", "yes");
            }}
          >
            {(localStore?.getItem("no-responsive") ? "Use" : "Remove") + " Responsive Hack"}
          </Button>
        </main>
      </div>
    </MainLayout>
  );
};

export default Home;
