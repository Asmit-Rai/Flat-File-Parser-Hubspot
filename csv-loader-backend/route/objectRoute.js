import { companyHandler } from "../handler/companyHandler.js";
import { contactHandler } from "../handler/contactHandler.js";
import { dealsHandler } from "../handler/DealsHandler.js";

export async function objectRoute(header , data){
    console.log("object route in");
    for(let i=0; i<header.length; i++){
        if(header[i]=="name"){
            //route to company name
            await companyHandler(header,data)
            break;
        }
        else if(header[i]=="firstname" || header[i] =="lastname"){
           //route to contact handler
            await contactHandler(header,data);
            break;
        }
        else if(header[i]=="dealname"){
            //route to deal handler
            await dealsHandler(header,data)
            break;
        }
        else{
            // the csv doesnt have name, contanct , deals
            console.log("Company, Contanct , Deal csv files not found");
            break;
        }
    }
}
