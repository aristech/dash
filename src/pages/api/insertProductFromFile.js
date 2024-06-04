import connectMongo from "../../../server/config";
import SoftoneProduct from "../../../server/models/newProductModel";
import { removeEmptyObjectFields } from "@/utils/removeEmptyObjectFields";

export default async function handler(req, res) {
  const { data } = req.body;
  const response = {
    success: false,
    error: null,
    data: null,
  };

  await connectMongo();
  // const { SOFTONE_DATA, PRODUCT_DATA } = createData(data);

  // return res.status(200).json({ success: false });

  const results = {
    updated_system: [],
    updated_softone: [],
    created: [],
    all: [],
  };


  const SOFTONE_ARRAY = [];
  for (let product of data) {

    let result = {};
    const { SOFTONE_DATA, PRODUCT_DATA } = createData(product);

    //FIND PRODUCT IN DATABASE:
    const find = await findProduct(PRODUCT_DATA);
    if (find) {
      //IF THE PRODUCT EXISTS IN SOFTONE (HAS MTRL) THEN UPDATE THE PRODUCT BOTH IN SOFTONE AND IN THE SYSTEM:
      if (find && find.MTRL) {
        //UPDATE THE PRODUCT IN OUR SYSTEM:
        let updatedProduct= await updateProduct();
        if(updatedProduct) {
          //PUT THE MTRL KEY TO UPDATE SOFTONE:
          SOFTONE_DATA.MTRL = find.MTRL
          SOFTONE_ARRAY.push(SOFTONE_DATA)
          //CREATE THE RESULT PAYLOAD:
          result.updated = true;
          result.message = "Product updated successfully"
        } else {
          result.updated = false;
          result.message = "Failed to update product in the system."
        }
        result.product = updatedProduct;
        results.updated.push(result);
        
      }
    } else {
      //IF THE PRODUCT DOES NOT EXIST AT ALL CREATE IT IN OUR SYSTEM, AND ADD THE TAG: //SOFTONESTATUS: FALSE//
      let createdProduct = await SoftoneProduct.create(product);
      if(createdProduct) {
        //CREATE THE RESULT PAYLOAD:
        result.created = true;
        result.message = "Product created successfully"

        results.created.push(product);

      }
    }

  }
    
  let softoneUpdateResponse = await updateSoftone(SOFTONE_ARRAY)
  console.log({softoneUpdateResponse})
  return res.status(200).json({ success: true });

  // try {
  //   //STEP 1: IDENTIFY IF THE PRODUCT EXISTS AND IF IT HAS MTRL:

  //   for (let product of PRODUCT_DATA) {
  //     const result = {
  //       CODE2: product.CODE2,
  //       MTRL: null,
  //       SOFTONE_UPDATE: false,
  //       SYSTEM_UPDATE: false,
  //     };

  //     try {
  //       const find = await SoftoneProduct.findOne(
  //         { CODE2: product.CODE2 },
  //         { _id: 1, MTRL: 1, NAME: 1, ISACTIVE: 1 }
  //       );

  //       //IF THE PRODUCT EXISTS IN SOFTONE (HAS MTRL) THEN UPDATE THE PRODUCT BOTH IN SOFTONE AND IN THE SYSTEM:
  //       if (find && find.MTRL) {
  //         let MTRL = find.MTRL;
  //       let ISACTIVE = find.ISACTIVE ? "1" : "0";
  //       console.log({ISACTIVE})

  //         //UPDATE THE PRODUCT IN OUR SYSTEM:

  //         result.MTRL = MTRL;
  //         result.SYSTEM_UPDATE = !!updatedProduct;

  //         if (updatedProduct) {
  //           //PUSH THE UPDATED PRODUCT TO THE ARRAY:
  //           results.updated_system.push(result);

  //           //UPDATE THE PRODUCT IN SOFTONE:
  //           const softoneUpdateResponse = await updateSoftone(
  //             MTRL,
  //             ISACTIVE,
  //             SOFTONE_DATA.find((d) => d.CODE2 === product.CODE2)
  //           );
  //           console.log({ softoneUpdateResponse });
  //           result.SOFTONE_UPDATE = !!softoneUpdateResponse.success;
  //           console.log(result.SOFTONE_UPDATE)
  //           if (result.SOFTONE_UPDATE) {
  //             results.updated_softone.push(result);
  //           } else {
  //             result.error = "Failed to update product in softone.";
  //           }
  //         }
  //       } else {
  //         //IF THE PRODUCT DOES NOT EXIST AT ALL CREATE IT IN OUR SYSTEM, AND ADD THE TAG: //SOFTONESTATUS: FALSE//
  //         let createdProduct = await SoftoneProduct.create(product);
  //         result.MTRL = null;
  //         result.SYSTEM_CREATE = !!createdProduct;

  //         if (createdProduct) {
  //           results.created.push(result);
  //         } else {
  //           result.error = "Failed to create product in the system.";
  //         }
  //       }
  //       results.all.push(result);
  //     } catch (e) {
  //       console.error(e.message);
  //       result.error = e.message;
  //       results.all.push(result);
  //     }
  //   }

  //   response.success = true;
  //   response.data = results;
  //   res.status(200).json(response);
  // } catch (e) {
  //   console.log(e.message);
  //   response.error = "Failed to process request.";
  //   return res.status(500).json(response);
  // }
}

function createData(item) {
  const common = {
    NAME: item?.NAME,
    VAT: item?.VAT,
    //CODES:
    CODE: item?.CODE?.toString(),
    CODE1: item?.CODE1?.toString(),
    CODE2: item?.CODE2.toString(),
    //DIMENSIONS:
    GWEIGHT: item?.GWEIGHT,
    DIM1: item?.WIDTH,
    DIM1: item?.HEIGHT,
    DIM1: item?.LENGTH,
    PRICER: item?.PRICER,
    PRICEW: item?.PRICEW,
    PRICE02: item?.PRICE02,
    INTRASTAT: item?.INTRASTAT,
    VAT: item?.VAT,
  };

  const softone = {
    ...common,
    WEIGHT: item?.WEIGHT,
    SKROUTZ: item?.isSkroutz,
  };

  const product = {
    ...common,
    NAME_ENG: item?.NAME_ENG,
    DESCRIPTION: item?.DESCRIPTION,
    DESCRIPTION_ENG: item?.DESCRIPTION_ENG,
    SOFTONESTATUS: false,
    isSkroutz: item?.isSkroutz,
    COST: item?.COST,
  };

  //remove null fields
  const PRODUCT_DATA = removeEmptyObjectFields(product);
  const SOFTONE_DATA = removeEmptyObjectFields(softone);
  return { PRODUCT_DATA, SOFTONE_DATA };
}

async function findProduct(product) {
  try {
    const find = await SoftoneProduct.findOne(
      { CODE2: product.CODE2 },
      { _id: 1, MTRL: 1, NAME: 1, ISACTIVE: 1 }
    );
    return find;
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
}

async function updateProduct() {
  try {
    let update = await SoftoneProduct.findOneAndUpdate(
      { CODE2: product.CODE2 },
      {
        $set: product,
      },
      { new: true }
    );
    console.log({update})
    return update;
  } catch (e) {
    console.log(e);
    throw new Error(e.message);
  }
}


async function updateSoftone(data) {
  let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl2/update`;
      let result = await fetch(URL, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              username: "Service",
              password: "Service",
              data: data
          })
      })
    
     let resJson = await result.json()
     console.log({resJson}) 
    return  resJson
      
}