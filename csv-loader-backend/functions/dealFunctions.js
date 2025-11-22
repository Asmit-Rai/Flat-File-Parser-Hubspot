import { fetchHubspot } from "../headers/fetchHubspot.js";


export async function getAllDeals() {
  const dealSearchUrl = "https://api.hubapi.com/crm/v3/objects/deals";
  const dealSearchUrlOptions = fetchHubspot("GET");
  try {
    const response = await fetch(dealSearchUrl, dealSearchUrlOptions);
    const responseData = await response.json();
    return responseData.results || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}


export async function createBatchDeals(createData) {
  const createBatchDealsURL ="https://api.hubapi.com/crm/v3/objects/deals/batch/create";
  const createBatchDealsOptions = fetchHubspot("POST", createData);
  try {
    const response = await fetch(createBatchDealsURL,createBatchDealsOptions
    );
    const resData = await response.json();
    return resData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateBatchDeals(updateData){
    const updateDealsUrl = `https://api.hubapi.com/crm/v3/objects/deals/batch/update`;
    const updateBatchDealsOptions = fetchHubspot("POST", updateData);
    try {
      const response = await fetch(updateDealsUrl, updateBatchDealsOptions);
      const resData = await response.json();
      return resData;
    } catch (error) {
      console.log(error);
    }
}

//Delete Batch Deals
export async function deleteBatchDeals(deleteData) {
  const deleteUrl ="https://api.hubapi.com/crm/v3/objects/deals/batch/archive";
  const deleteOptions = fetchHubspot("POST", deleteData);

  try {
    const response = await fetch(deleteUrl, deleteOptions);
    const resData = await response.json();
    console.log(resData);
  } catch (error) {
    console.error(error);
  }
}