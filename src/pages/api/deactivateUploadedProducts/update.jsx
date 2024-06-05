import SoftoneProduct from "../../../../server/models/newProductModel";
import connectMongo from "../../../../server/config";
import { deleteBunny } from "@/utils/bunny_cdn";
export default async function handler(req, res) {
  const response = {
    result: [],
    softoneResponse: null,
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
  try {
    const SOFTONE_PRODUCT_QUEUE = [];
    for (let product of data) {
      let result = {};
      result.code = product[mongoKeys.mappingKey.key];
  
      const productExists = await findProduct(product, mongoKeys.mappingKey.key);
      //PRODUCT IS NOT FOUND:
      if (!productExists) {
        result.name = "Προϊόν δεν βρέθηκε";
        result.success = false;
        result.MTRL = "-----"
        result.deleted = false;
        result.error = `Το προϊόν με κωδικό ${
          product[mongoKeys.mappingKey.key]
        } δεν βρέθηκε.`;
      }
  
      //PRODUCT EXISTS AND AVAILABILITY IS ZERO: -> DEACTIVATE ON BOTH SYSTEMS:
      if (productExists && productExists.availability?.DIATHESIMA === "0") {
        result.name = productExists.NAME;

        
        //DELETE IMAGES FROM BUNNY CDN:
        if (productExists.images && productExists.images.length > 0) {
          const deleteImagesResponse = await deleteImages(productExists.images);
          // if (deleteImagesResponse.success) {
          //   result.images = productExists.images;
          //   result.imagesDeleted = true;
          // } else {
          //   result.images = productExists.images;
          //   result.imagesDeleted = false;
          //   result.error = `Οι εικόνες του προϊόντος με κωδικό ${
          //     product[mongoKeys.mappingKey.key]
          //   } δεν διαγράφηκαν.`;
          // }
        }
        //THEN DELETE THE WHOLE PRODUCT:
        const deleteOnSystem = await deleteSystem(productExists._id);

        if (deleteOnSystem) {
          result.success = `Το προϊόν με κωδικό ${
            product[mongoKeys.mappingKey.key]
          } διαγράφηκε από το σύστημα.`;
          result.deleted = true;
          
        } else {
          result.deleted = false;
          result.error = `Το προϊόν με κωδικό ${
            product[mongoKeys.mappingKey.key]
          } δεν διαγράφηκε από το σύστημα.`;
          // response.deletedSystem.push(result);
        }
        //IF PRODUCT EXISTS ON SOFTONE ADD IT TO THE QUEUE TO DELETE LATER:
        if (productExists.MTRL) {
          result.MTRL = productExists.MTRL;
          result.deactivated = true;
          //DEACTIVATE ON SOFTONE:
          SOFTONE_PRODUCT_QUEUE.push({
            MTRL: productExists.MTRL,
            ISACTIVE: false,
          });
        }
       
      } else {
        result.name = productExists.NAME;
        result.success = `Το προϊόν με κωδικό ${
          product[mongoKeys.mappingKey.key]
        } δεν έχει διαθέσιμο stock.`;
        result.deleted = false;
        result.error = `Το προϊόν με κωδικό ${
          product[mongoKeys.mappingKey.key]
        } δεν διαγράφηκε από το σύστημα.`;
      }

      //UPDATE RESULTS:
      response.result.push(result);
    } //END OF LOOP FOR PRODUCT:

    //SEND ALL PRODUCTS TO SOFTONE FOR DEACTIVATION:
    const deactivate= await deactivateSoftone(SOFTONE_PRODUCT_QUEUE);
    response.softoneResponse = deactivate;
    response.success = true
    return res.status(200).json(response);
  } catch(e) {
    response.error = e.message;
    response.success = false;
    console.log("error: " + e.message);
    return res.status(500).json(response);
  }
}

async function findProduct(product, code) {
  try {
    return await SoftoneProduct.findOne(
      { [code]: product[code] },
      {
        availability: 1,
        MTRL: 1,
        _id: 1,
        NAME: 1,
        images: 1,
      }
    );
  } catch (e) {
    console.log(e.message);
    throw new Error("findProduct error: " + e.message);
  }
}

async function deleteSystem(id) {
  try {
    let updateSystem = await SoftoneProduct.deleteOne(id);
    if (updateSystem && updateSystem.deletedCount > 0) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
  }
}

async function deactivateSoftone(data) {
  let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl2/update`;
  try {
    let result = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Service",
        password: "Service",
        data: data,
      }),
    });

    let resJson = await result.json();
    return resJson;
  } catch (error) {
    console.error(`Error updating Softone: ${error.message}`);
    throw new Error(`Error updating Softone: ${error.message}`);
  }
}


async function deleteImages(images) {

    try {
      for (let image of images) {
        let bunny = await deleteBunny(image?.name)
     }
     return {
        success: true,
        message: "Images deleted from Bunny CDN"
     }
    } catch (e) {
        console.log(e.message)
        return {
            success: false,
            message: e.message
        }
    }
    
}
