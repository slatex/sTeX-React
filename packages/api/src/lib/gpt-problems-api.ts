import axios from 'axios';
import {
  
  CreateGptProblemsRequest,
  CreateGptProblemsResponse,
  Problem,
  ResponseData,
  Template,
  TemplateData,
} from './gpt-problems';
import { getAuthHeaders } from './lms';



export async function checkTemplateExists(templateName: string) {
  const response = await axios.get('http://127.0.0.1:5000/api/templates/check', {
    params: { name: templateName },
  });
  return response.data;
}


export async function createTemplate(templateCreationData:any){
  const resp= await axios.post('http://127.0.0.1:5000/api/templates',templateCreationData,
{headers: getAuthHeaders()});
return resp.data
}


export async function getTemplates() {
    const resp = await axios.get('http://127.0.0.1:5000/api/templates',{
    headers: getAuthHeaders()
  });
    return resp.data as Template[]; 
  } 

export async function createGeneration(formData:CreateGptProblemsRequest ) {
  const response = await axios.post(
    'http://localhost:5000/api/generation_api',
    formData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data as CreateGptProblemsResponse;
}

export async function getGenerationsHistory(templateType: string) {
  const response = await axios.get(
    'http://localhost:5000/api/generations_history',
    {
      params: { templateType },
      headers: getAuthHeaders(),
    }
  );
  return response.data.generationList }


  export async function fetchTemplateDetails(templateId: number): Promise<TemplateData> {
    const response = await axios.get(`http://127.0.0.1:5000/api/templates/${templateId}`,
      { headers: getAuthHeaders()},
    );
    return {
      templateName: response.data.templateName,
      templateVersion: response.data.templateVersion,
    };
  } 



  export async function extractQuestions  (extractedJson:Problem[], generationObj:ResponseData) {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/question_extraction',
        {
          
          extractedJson: extractedJson,
          generationObj: generationObj,
        },
        { headers: getAuthHeaders() },
      );
    return response.data;
  };

export async function fetchAllVersions(generationId:number){
    
      const response = await axios.post('http://127.0.0.1:5000/api/get_all_versions', {
        generationId,
      }, { headers: getAuthHeaders() },);
      return response.data;
   
  };

export async function addReferences (currentProblem:Problem,generationId:number){
    
      const response = await axios.post('http://127.0.0.1:5000/api/add-references', {
        currentProblem,
        generationId,
      } ,{ headers: getAuthHeaders() });
      return response.data;
    
  };

  export async function fixDistractor (currentProblem:Problem,generationId:number){

      const response = await axios.post('http://127.0.0.1:5000/api/fix-distractors', {
        currentProblem,
        generationId,
      } ,{ headers: getAuthHeaders() });
      return response.data;
    
  };

    export async function removeAmbiguity (currentProblem:Problem,generationId:number){

      const response = await axios.post('http://127.0.0.1:5000/api/remove-ambiguity', {
        currentProblem,
        generationId,
      } ,{ headers: getAuthHeaders() });
      return response.data;
   
  };