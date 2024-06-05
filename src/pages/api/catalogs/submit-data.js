import connectMongo from "../../../../server/config";
import SoftoneProduct from "../../../../server/models/newProductModel";
import { removeEmptyObjectFields } from "@/utils/removeEmptyObjectFields";
export default async function handler(req, res) {
  const { data } = req.body;
  await connectMongo();

  const results = {
    system_data: [],
    softoneStatus: false,
    should_update_softone: 0,
    should_update_system: 0,
    should_create: 0,
    update_system: 0,
    create_system: 0,
  };

  const SOFTONE_ARRAY = [];
  for (let product of data) {
    let result = {};
    const { SOFTONE_DATA, PRODUCT_DATA } = createData(product);
    const find = await findProduct(PRODUCT_DATA);

    if (find) {
      results.should_update_system++;
	  result.status = "update";
      let updatedProduct = await updateProduct(product);
      if (updatedProduct) {
        results.update_system++;
        result.success = true;
        result.message = "System updated successfully";
        if (find.MTRL) {
		result.MTRL = find.MTRL;
		result.softone = "updated";
		result.message = "System updated successfully / Softone updated successfully";
          SOFTONE_DATA.MTRL = find.MTRL;
          SOFTONE_ARRAY.push(SOFTONE_DATA);
          results.should_update_softone++;
        }
      } else {
        result.success = false;
        result.message = "Failed to update product in the system.";
      }
      result.name = find.NAME || product.NAME;
      result.code = product.CODE2;
    } else {
      results.should_create++;
    
      let createdProduct = await SoftoneProduct.create(product);
		result.status = "create";
      if (createdProduct) {
        results.create_system++;
        result.success = true;
        result.message = "Product created successfully";
      } else {

        result.success = false;
        result.message = "Failed to create product in the system.";
      }
    } 
    results.system_data.push(result);
  }

  let softoneUpdateResponse = await updateSoftone(SOFTONE_ARRAY);
  results.softoneStatus = softoneUpdateResponse.success;
  return res.status(200).json(results);
}

async function findProduct(product) {
  try {
    return await SoftoneProduct.findOne(
      { CODE2: product.CODE2 },
      { _id: 1, MTRL: 1, NAME: 1, ISACTIVE: 1 }
    );
  } catch (e) {
    console.error(`Error finding product: ${e.message}`);
    throw new Error(`Error finding product: ${e.message}`);
  }
}

async function updateProduct(product) {
  try {
    return await SoftoneProduct.findOneAndUpdate(
      { CODE2: product.CODE2 },
      { $set: product },
      { new: true }
    );
  } catch (e) {
    console.error(`Error updating product: ${e.message}`);
    throw new Error(`Error updating product: ${e.message}`);
  }
}

async function updateSoftone(data) {
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
    console.log({ resJson });
    return resJson;
  } catch (error) {
    console.error(`Error updating Softone: ${error.message}`);
    throw new Error(`Error updating Softone: ${error.message}`);
  }
}

function createData(item) {
  const common = {
    NAME: item?.NAME,
    VAT: item?.VAT,
    CODE: item?.CODE?.toString(),
    CODE1: item?.CODE1?.toString(),
    CODE2: item?.CODE2.toString(),
    GWEIGHT: item?.GWEIGHT,
    DIM1: item?.WIDTH,
    DIM2: item?.HEIGHT,
    DIM3: item?.LENGTH,
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
    SOFTONESTATUS: false,
    isSkroutz: item?.isSkroutz,
    COST: item?.COST,
  
  };

  return { PRODUCT_DATA: removeEmptyObjectFields(product), SOFTONE_DATA: removeEmptyObjectFields(softone) };
}
