import dotenv from "dotenv";
import { createBatchContacts, deleteBatchContacts, getAllContacts, updateBatchContacts } from "../functions/contactFunctions.js";
import { getAllCompanies, updateBatchCompany } from "../functions/companyFunctions.js";
dotenv.config();

const SECRET = process.env.SECRET;

export async function contactHandler(header, data) {
  console.log("I am in contact handlear");
  let isCompanyAssociated = false;
  const promises = [];

  //Find all the contacts from hubspot
  let allContactList = [];
  allContactList = await getAllContacts();

  // Separating new contact to old contact
  let newContactList = [];
  let existingContactList = [];

  for (let j = 0; j < data.length; j++) {
    let isExisting = false;
    let contactEmail = data[j][2];
    let contactId = null;
    for (let i = 0; i < allContactList.length; i++) {
      if (allContactList[i].properties.email == contactEmail) {
        isExisting = true;
        contactId = allContactList[i].id; 
        break;
      }
    }
    if (isExisting) {
      existingContactList.push({
        data: data[j],
        id: contactId,
      });
    } else {
      newContactList.push(data[j]);
    }
  }

  //Checking if contact associated with company
  for (let i = 0; i < header.length; i++) {
    if (header[i] == "company") {
      isCompanyAssociated = true;
      break;
    }
  }
  let allCompanyList = [];
  let getCompanyById = null;
  if (isCompanyAssociated == true) {
    allCompanyList = await getAllCompanies();

    function getCompanyById(companyName) {
      for (let i = 0; i < allCompanyList.length; i++) {
        if (allCompanyList[i].properties.name == companyName) {
          return allCompanyList[i].id;
        }
      }
      return null;
    }
  }
  //Create new contacts
  if (newContactList.length > 0) {
    const newContactData = newContactList.map((row) => {
      const contactObject = {
        properties: {
          firstname: row[0],
          lastname: row[1],
          email: row[2],
          phone: row[3],
        },
      };
      if (isCompanyAssociated && getCompanyById) {
        const companyId = getCompanyById(row[4]);
        if (companyId) {
          contactObject.associations = [
            {
              to: { id: companyId },
              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 }],
            },
          ];
        }
      }
      return contactObject;
    });

    promises.push(createBatchContacts({ inputs: newContactData }));
  }

  //Update existing contacts
  if (existingContactList.length > 0) {
    const existingContactData = existingContactList.map((item) => {
      const row = item.data;
      const existingContactObject = {
        id: item.id,
        properties: {
          firstname: row[0],
          lastname: row[1],
          phone: row[3],
        },
      };
      if (isCompanyAssociated && getCompanyById) {
        const companyId = getCompanyById(row[4]);
        if (companyId) {
          existingContactObject.associations = [
            {
              to: { id: companyId },
              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 1 }],
            },
          ];
        }
      }
      return existingContactObject;
    });

    promises.push(updateBatchContacts({ inputs: existingContactData }));
  }

  //Delete contacts not in CSV
  let notExistingContactList = [];
  for (let j = 0; j < allContactList.length; j++) {
    let existsInCSV = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][2] === allContactList[j].properties.email) {
        existsInCSV = true;
        break;
      }
    }
    if (!existsInCSV) {
      notExistingContactList.push({ id: allContactList[j].id, name: allContactList[j].properties.name });
    }
  }

  if (notExistingContactList.length > 0) {
    const inputs = notExistingContactList.map((item) => ({ id: item.id }));
    promises.push(deleteBatchContacts({ inputs }));
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }
}
