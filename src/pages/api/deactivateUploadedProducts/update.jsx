import SoftoneProduct from "../../../../server/models/newProductModel";
import connectMongo from "../../../../server/config";
import { connect } from "mongoose";
export default async function handler(req, res) {
  const response = {
    result: [],
    notFound: [],
    deactivated: [],
    error: null,
    message: "",
    success: false,
  };

  if (req.method !== "PUT") {
    response.message = "Method not allowed";
    return res.status(405).json(response);
  }
  await connectMongo();
  const { data, mongoKeys } = req.body;

  //1)CHECK FOR STOCK - AVAILABILITY:
  for (let product of data) {
    let result = {};

    try {
      const productExists = await SoftoneProduct.findOne({[mongoKeys.mappingKey.key]: product[mongoKeys.mappingKey.key]},{
        "availability": 1,
        MTRL: 1,
        _id: 1,
        NAME: 1,
      });
      //PRODUCT IS NOT FOUND:
      if (!productExists) {
        result.error = `Το προϊόν με κωδικό ${
          product[mongoKeys.mappingKey.key]
        } δεν βρέθηκε.`;
        response.notFound.push(result);
      }

      //PRODUCT EXISTS AND AVAILABILITY IS ZERO: -> DEACTIVATE ON BOTH SYSTEMS:
      if(productExists && productExists.availability?.DIATHESIMA === "0"){
        console.log("Deactivate product on both systems");
        if(productExists.MTRL) {
            //DEACTIVATE ON SOFTONE:
            let softone = await deactivateSoftone(productExists.MTRL);
        }
      }
      console.log({ productExists });
    } catch (e) {
      console.log(e.message);
      response.error = e.message;
      return res.status(500).json(response);
    }
  }
  return res.status(200).json(response);
}



async function deactivateSoftone(MTRL) {

    try {
      let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/putMtrl`;
      const response = await fetch(URL, {
        method: "POST",
        body: JSON.stringify({
          username: "Service",
          password: "Service",
          COMPANY: 1001,
          MTRL: MTRL,
          ISACTIVE: false,
        }),
      });
  
      let responseJSON = await response.json();
      return responseJSON;
    } catch (e) {
      console.error(e.message);
    }
  }