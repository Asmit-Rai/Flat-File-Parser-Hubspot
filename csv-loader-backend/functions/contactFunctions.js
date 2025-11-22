import { fetchHubspot } from "../headers/fetchHubspot.js";


export async function getAllContacts() {
  const contactSearchUrl = "https://api.hubapi.com/crm/v3/objects/contacts";
  const contactSearchUrlOptions = fetchHubspot("GET");
  try {
    const response = await fetch(contactSearchUrl, contactSearchUrlOptions);
    const responseData = await response.json();
    return responseData.results || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}


export async function createBatchContacts(createData) {
  const createBatchContactURL ="https://api.hubapi.com/crm/v3/objects/contacts/batch/create";
  const createBatchContactOptions = fetchHubspot("POST", createData);
  try {
    const response = await fetch(createBatchContactURL,createBatchContactOptions
    );
    const resData = await response.json();
    return resData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateBatchContacts(updateData){
    const updateContactUrl = `https://api.hubapi.com/crm/v3/objects/contacts/batch/update`;
    const updateBatchContactOptions = fetchHubspot("POST", updateData);
    try {
      const response = await fetch(updateContactUrl, updateBatchContactOptions);
      const resData = await response.json();
      return resData;
    } catch (error) {
      console.log(error);
    }
}

//Delete Batch Contacts 
export async function deleteBatchContacts(deleteData) {
  const deleteUrl ="https://api.hubapi.com/crm/v3/objects/contacts/batch/archive";
  const deleteOptions = fetchHubspot("POST", deleteData);

  try {
    const response = await fetch(deleteUrl, deleteOptions);
    const resData = await response.json();
    console.log(resData);
  } catch (error) {
    console.error(error);
  }
}