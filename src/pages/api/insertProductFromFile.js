import connectMongo from "../../../server/config";
import SoftoneProduct from "../../../server/models/newProductModel";
import UploadedProduct from "../../../server/models/uploadedProductsModel";
import { removeEmptyObjectFields } from "@/utils/removeEmptyObjectFields";

export default async function handler(req, res) {
  const { data } = req.body;
  const response = {
    success: false,
    error: null,
    data: null,
  };
  
  console.log({data})
  await connectMongo();
  const { SOFTONE_DATA, PRODUCT_DATA } = createData(data);

  const results = {
    updated_system: [],
    updated_softone: [],
    created: [],
    all: [],
  };
  try {
    //STEP 1: IDENTIFY IF THE PRODUCT EXISTS AND IF IT HAS MTRL:
    for (let product of PRODUCT_DATA) {
      const result = {
        CODE2: product.CODE2,
        MTRL: null,
        SOFTONE_UPDATE: false,
        SYSTEM_UPDATE: false,
      };
      try {
        const find = await SoftoneProduct.findOne(
          { CODE2: product.CODE2 },
          { _id: 1, MTRL: 1, NAME: 1, ISACTIVE: 1 }
        );
        console.log({ find });

        //IF THE PRODUCT EXISTS IN SOFTONE (HAS MTRL) THEN UPDATE THE PRODUCT BOTH IN SOFTONE AND IN THE SYSTEM:
        if (find && find.MTRL) {
          let MTRL = find.MTRL;
        let ISACTIVE = find.ISACTIVE ? "1" : "0";
        console.log({ISACTIVE})
            
          //UPDATE THE PRODUCT IN OUR SYSTEM:
          let updatedProduct = await SoftoneProduct.findOneAndUpdate(
            { CODE2: product.CODE2 },
            {
              $set: product,
            },
            { new: true }
          );
          result.MTRL = MTRL;
          result.SYSTEM_UPDATE = !!updatedProduct;

          if (updatedProduct) {
            //PUSH THE UPDATED PRODUCT TO THE ARRAY:
            results.updated_system.push(result);

            //UPDATE THE PRODUCT IN SOFTONE:
            const softoneUpdateResponse = await updateSoftone(
              MTRL,
              ISACTIVE,

              SOFTONE_DATA.find((d) => d.CODE2 === product.CODE2)
            );
            console.log({ softoneUpdateResponse });
            result.SOFTONE_UPDATE = !!softoneUpdateResponse.success;
            console.log(result.SOFTONE_UPDATE)
            if (result.SOFTONE_UPDATE) {
              results.updated_softone.push(result);
            } else {
              result.error = "Failed to update product in softone.";
            }
          }
        } else {
          //IF THE PRODUCT DOES NOT EXIST AT ALL CREATE IT IN OUR SYSTEM, AND ADD THE TAG: //SOFTONESTATUS: FALSE//
          let createdProduct = await SoftoneProduct.create(product);
          result.MTRL = null;
          result.SYSTEM_CREATE = !!createdProduct;

          if (createdProduct) {
            results.created.push(result);
          } else {
            result.error = "Failed to create product in the system.";
          }
        }
        results.all.push(result);
      } catch (e) {
        console.error(e.message);
        result.error = e.message;
        results.all.push(result);
      }
    }

    response.success = true;
    response.data = results;
    res.status(200).json(response);
  } catch (e) {
    console.log(e.message);
    response.error = "Failed to process request.";
    return res.status(500).json(response);
  }
}

function createData(data) {
  const SOFTONE_DATA = [],
    PRODUCT_DATA = [];

  for (let item of data) {
    let COMMON_DATA = {
      NAME: item?.NAME,
      VAT: item?.VAT,
      //CODES:
      CODE: item?.CODE?.toString(),
      CODE1: item?.CODE1.toString(),
      CODE2: item?.CODE2.toString(),
      //DIMENSIONS:
      GWEIGHT: item?.GWEIGHT,
      WIDTH: item?.WIDTH,
      HEIGHT: item?.HEIGHT,
      LENGTH: item?.LENGTH,
    };

    let softone_data = {
      ...COMMON_DATA,
      //PRICES:
      PRICER: item?.PRICER?.toString(),
      PRICEW: item?.PRICEW?.toString(),
    };
    let product_data = {
      ...COMMON_DATA,
      NAME_ENG: item?.NAME_ENG,
      DESCRIPTION: item?.DESCRIPTION,
      DESCRIPTION_ENG: item?.DESCRIPTION_ENG,
      SOFTONESTATUS: false,
      isSkroutz: item?.isSkroutz,
      //PRICES:
      PRICER: item?.PRICER && parseFloat(item.PRICER.toFixed(2)),
      PRICEW: item?.PRICEW && parseFloat(item.PRICEW.toFixed(2)),
      COST: item?.COST && parseFloat(item.COST.toFixed(2)),
    };

    //remove null fields
    let _newProductData = removeEmptyObjectFields(product_data);
    let _newSoftoneData = removeEmptyObjectFields(softone_data);

    SOFTONE_DATA.push(_newSoftoneData);
    PRODUCT_DATA.push(_newProductData);
  }
  return { SOFTONE_DATA, PRODUCT_DATA };
}

async function updateSoftone(MTRL, ISACTIVE, SOFTONE_DATA) {

  try {
    let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/putMtrl`;
    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({
        username: "Service",
        password: "Service",
        COMPANY: 1001,
        MTRL: MTRL,
        ISACTIVE: ISACTIVE,
        ...SOFTONE_DATA,
      }),
    });

    let responseJSON = await response.json();
    return responseJSON;
  } catch (e) {
    console.error(e.message);
  }
}
