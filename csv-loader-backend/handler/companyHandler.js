import dotenv from "dotenv";
import {
  createBatchCompany,
  deleteBatchCompany,
  getAllCompanies,
  updateBatchCompany,
} from "../functions/companyFunctions.js";

dotenv.config();
const SECRET = process.env.SECRET;
export async function companyHandler(header, data) {
  console.log(header);
  const promises = [];
  let allCompanyList = [];
  allCompanyList = await getAllCompanies();

  let newCompaniesList = [];
  let existingCompanyList = [];

  for (let j = 0; j < data.length; j++) {
    let isExisting = false;
    let companyId = null;
    let companyName = data[j][0];

    for (let i = 0; i < allCompanyList.length; i++) {
      if (allCompanyList[i].properties.name === companyName) {
        isExisting = true;
        companyId = allCompanyList[i].id;
        break;
      }
    }

    if (isExisting) {
      existingCompanyList.push({
        companyId,
        companyData: data[j],
      });
    } else {
      newCompaniesList.push(data[j]);
    }
  }

  let notExistingCompanyList = [];
  for (let j = 0; j < allCompanyList.length; j++) {
    let existsInCSV = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === allCompanyList[j].properties.name) {
        existsInCSV = true;
        break;
      }
    }
    if (!existsInCSV) {
      notExistingCompanyList.push({
        id: allCompanyList[j].id,
        name: allCompanyList[j].properties.name,
      });
    }
  }

  if (notExistingCompanyList.length > 0) {
    const inputs = notExistingCompanyList.map((item) => ({
      id: item.id,
    }));
    promises.push(deleteBatchCompany({ inputs }));
  }

  if (newCompaniesList.length > 0) {
    const inputs = newCompaniesList.map((row) => ({
      properties: {
        name: row[0],
        domain: row[1],
        city: row[2],
        phone: row[3],
      },
    }));
    promises.push(createBatchCompany({ inputs }));
  }

  if (existingCompanyList.length > 0) {
    const exitCompanyData = existingCompanyList.map((item) => ({
      id: item.companyId,
      properties: {
        name: item.companyData[0],
        domain: item.companyData[1],
        city: item.companyData[2],
        phone: item.companyData[3],
      },
    }));
    promises.push(updateBatchCompany({ inputs: exitCompanyData }));
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}
