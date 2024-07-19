import { NextPage } from "next";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@mui/material";
import { recomputeMemberships } from "@stex-react/api";
import { useRouter } from "next/router";
import { useState } from "react";


const SysAdmin : NextPage = () => {
    const [recomputingMemberships, setRecomputingMemberships] = useState(false);
    const router = useRouter();
    async function handleRecomputeClick(){
        try{

            setRecomputingMemberships(true);
            await recomputeMemberships();
            setRecomputingMemberships(false);
        }
        catch(e){
            console.log(e);
        }
    }

    return(
        <MainLayout>
            <Button
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '50px auto',
                }}
                variant="contained"
                color="primary"
                onClick={() =>handleRecomputeClick()}
                disabled={recomputingMemberships}
              >
                Recompute Memberships
              </Button>
        </MainLayout>
    )
}

export default SysAdmin;