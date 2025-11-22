import { fetchHubspot } from "../headers/fetchHubspot.js";

export async function getAllCompanies() {
  const companySearchUrl = "https://api.hubapi.com/crm/v3/objects/companies";
  const companySearchUrlOptions = fetchHubspot("GET");
  try {
    const response = await fetch(companySearchUrl, companySearchUrlOptions);
    const responseData = await response.json();
    return responseData.results || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

//Create Batch Companies
export async function createBatchCompany(createData) {
  const createBatchCompanyURL =
    "https://api.hubapi.com/crm/v3/objects/companies/batch/create";
  const createBatchCompanyOptions = fetchHubspot("POST", createData);
  try {
    const response = await fetch(
      createBatchCompanyURL,
      createBatchCompanyOptions
    );
    const resData = await response.json();
    return resData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//Update Batch Company
export async function updateBatchCompany(updateData) {
  const updateUrl = `https://api.hubapi.com/crm/v3/objects/companies/batch/update`;
  const updateOptions = fetchHubspot("POST", updateData);
  try {
    const response = await fetch(updateUrl, updateOptions);
    const resData = await response.json();
    return resData;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteBatchCompany(deleteData) {
  const deleteUrl ="https://api.hubapi.com/crm/v3/objects/companies/batch/archive";
  const deleteOptions = fetchHubspot("POST", deleteData);

  try {
    const response = await fetch(deleteUrl, deleteOptions);
    const resData = await response.json();
    console.log(resData);
  } catch (error) {
    console.error(error);
  }
}
