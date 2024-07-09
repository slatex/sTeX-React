import { NextPage } from "next";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@mui/material";
import { recomputeMemberships } from "@stex-react/api";
import { useRouter } from "next/router";


const SysAdmin : NextPage = () => {
    const router = useRouter();
    async function handleRecomputeClick(){
        try{
            await recomputeMemberships();
            router.push('/');
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
              >
                Recompute Memberships
              </Button>
        </MainLayout>
    )
}

export default SysAdmin;