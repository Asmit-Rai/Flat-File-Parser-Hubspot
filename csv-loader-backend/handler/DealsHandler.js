import dotenv from "dotenv";
import { 
  getAllDeals, 
  createBatchDeals, 
  updateBatchDeals, 
  deleteBatchDeals 
} from "../functions/dealFunctions.js";
import { getAllContacts } from "../functions/contactFunctions.js";
import { getAllCompanies } from "../functions/companyFunctions.js";
dotenv.config();

const SECRET = process.env.SECRET;

export async function dealsHandler(header, data) {
  let contactIndex = -1;
  let companyIndex = -1;
  const promises = [];

  for (let i = 0; i < header.length; i++) {
    if (header[i] == "contact") {
      contactIndex = i;
    }
    if (header[i] == "company") {
      companyIndex = i;
    }
  }

  // Find all deals
  let allDealsList = [];
  allDealsList = await getAllDeals();

  let newDealsList = [];
  let existingDealsList = [];
  for (let j = 0; j < data.length; j++) {
    let isExisting = false;
    for (let i = 0; i < allDealsList.length; i++) {
      if (allDealsList[i].properties.dealname === data[j][0]) {
        isExisting = true;
        existingDealsList.push({
          data: data[j],
          id: allDealsList[i].id,
        });
        break;
      }
    }

    if (!isExisting) {
      newDealsList.push(data[j]);
    }
  }

  // Find all contacts
  let allContactList = [];
  allContactList = await getAllContacts();

  // Find all companies
  let allCompanyList = [];
  allCompanyList = await getAllCompanies();

  // Function to find id from Contact
  function getContactId(contactName) {
    if (!contactName) {
      return null;
    }
    for (let i = 0; i < allContactList.length; i++) {
      const name =
        allContactList[i].properties.firstname + " " + allContactList[i].properties.lastname;
      if (name == contactName) {
        return allContactList[i].id;
      }
    }
    return null;
  }

  // Function to find id from Company
  function getCompanyId(companyName) {
    if (!companyName) {
      return null;
    }
    for (let i = 0; i < allCompanyList.length; i++) {
      if (allCompanyList[i].properties.name == companyName) {
        return allCompanyList[i].id;
      }
    }
    return null;
  }

  // Checking deals which exist on HubSpot but not in CSV
  let notExistingDealsList = [];
  for (let j = 0; j < allDealsList.length; j++) {
    let existsInCSV = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === allDealsList[j].properties.dealname) {
        existsInCSV = true;
        break;
      }
    }
    if (!existsInCSV) {
      notExistingDealsList.push({
        id: allDealsList[j].id,
        name: allDealsList[j].properties.dealname,
      });
    }
  }

  // Delete deals not in CSV
  if (notExistingDealsList.length > 0) {
    const inputs = notExistingDealsList.map((item) => ({
      id: item.id
    }));
    promises.push(deleteBatchDeals({ inputs }));
  }

  // Creating new deals
  if (newDealsList.length > 0) {
    const dealsData = newDealsList.map((row) => {
      const contactId = getContactId(row[contactIndex]);
      let companyId;
      if (companyIndex !== -1) {
        companyId = getCompanyId(row[companyIndex]);
      } else {
        companyId = null;
      }
      const dealObject = {
        properties: {
          dealname: row[0],
          amount: row[1],
          dealstage: row[2],
          description: row[3],
        },
        associations: []
      };

      if (companyId) {
        dealObject.associations.push({
          to: { id: companyId },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 341 },
          ],
        });
      }

      if (contactId) {
        dealObject.associations.push({
          to: { id: contactId },
          types: [
            { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 },
          ],
        });
      }

      if (dealObject.associations.length === 0) {
        delete dealObject.associations;
      }

      return dealObject;
    });

    promises.push(createBatchDeals({ inputs: dealsData }));
  }

  // Updating Existing Deals
  if (existingDealsList.length > 0) {
    const dealsData = existingDealsList.map((item) => ({
      id: String(item.id),
      properties: {
        dealname: item.data[0],
        amount: item.data[1],
        dealstage: item.data[2],
        description: item.data[3],
      },
    }));

    promises.push(updateBatchDeals({ inputs: dealsData }));
  }

 try {
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}
