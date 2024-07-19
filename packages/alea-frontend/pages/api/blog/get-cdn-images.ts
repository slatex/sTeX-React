import { CdnImageMetadata } from "@stex-react/api";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { executeDontEndSet500OnError } from "../comment-utils";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const cdnImages: CdnImageMetadata[] = await executeDontEndSet500OnError(
        `SELECT metadata
        FROM CdnImages`,
        [],
        res
      );
    
      res.status(200).json(cdnImages);
  
  }