import { FileLocation } from "@stex-react/utils";
import axios from "axios";

export interface GetDocumentsRequest {
  docs: FileLocation[];
}

export async function getDocuments(docs: FileLocation[]) {
    const resp = await axios.post('/api/get-documents', { docs });
    return resp.data as string[];
}
