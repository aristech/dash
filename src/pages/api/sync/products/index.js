import SoftoneProduct from "../../../../../server/models/newProductModel";
import Markes from "../../../../../server/models/markesModel";
import connectMongo from "../../../../../server/config";
import { MtrCategory, MtrGroup, SubMtrGroup } from "../../../../../server/models/categoriesModel";
import Manufacturers from "../../../../../server/models/manufacturersModel";
export const config = {
  api: {
    responseLimit: false,
  },
}
export default async function handler(req, res) {
  await connectMongo();
  let response = {
    count: 0,
    error: null,
    success: false,
    message: 'request did not work',
    result: [],
  }
  let action = req.body.action;


  if (req.method === 'POST' && action === 'getProducts' ) {
    await connectMongo();


    let {category, brand, manufacturer, group, subgroup, name, erpcode, eancode,factorycode } = req.body;

    //Create and obj to filter for spesific conditions:
    let filterConditions = {};

    if(name) {
      filterConditions.NAME = new RegExp("^" + name, 'i');
    }
    //FILTER BY CATEGORY:
    if (category) {
      filterConditions.CATEGORY_NAME = category;
    }

    //FILTER BY GROUP:
    if (group) {
      filterConditions.GROUP_NAME = group;
    }
    if(subgroup) {
      filterConditions.SUBGROUP_NAME = subgroup;
    }
    //FILTER BY MANUFACTURER:
    if (manufacturer) {
      filterConditions.MMTRMANFCTR_NAME = manufacturer;
    }
    //FILTER BY ERP CODE:
    if (erpcode) {
      filterConditions.CODE= erpcode;
    }
    //FILTER BY EAN CODE:
    if (eancode) {
      filterConditions.CODE1 = eancode;
    }
    //FILTER BY CODE2:
    if (factorycode) {
      filterConditions.CODE2 = factorycode;
    }

    //FILTER BY BRAND:
    if(brand) {
      let brandData = await Markes.findOne({"softOne.NAME": brand}, {"softOne.MTRMARK": 1, _id: 0}).lean();
      let mark= brandData.softOne.MTRMARK
      filterConditions.MTRMARK = mark;
    } 


    try {
      let products = await SoftoneProduct.find(filterConditions);
      console.log(products.length)
      console.log(products)
      if(!products.length) {
        response.result = products;
       
        response.success = true;
        response.message = 'No products where found with the given conditions';
      } else {
        response.result = products;
        response.count = products.length
        response.success = true;
        response.message = 'Products fetched successfully';
      }
  
     
    } catch (e) {
      response.error = e;
      response.success = false;
    
    }

    return res.status(200).json(response)
  }

  if (req.method === 'POST' && action === 'createProduct') {
    let response = {
      count: 0,
      error: null,
      success: false,
      message: 'request did not work',
      result: [],
    }

    let product = req.body.product;
    if(conditions(product, response)) {
      return res.status(400).json(response)
    }
    try {
     
    
      console.log('product')
      console.log(product)
      let newProduct = await SoftoneProduct.create(product);
      response.result = newProduct;
      response.success = true;
      response.message = 'Product created successfully';
    } catch (e) {
      response.error = e;
      response.success = false;
      return res.status(500).json(response)
    }
    return res.status(200).json(response)
  }

  if (req.method === 'PUT') {
    let response = {
      error: null,
      success: false,
      message: 'Update did not work',
      result: [],
    };
  
    let { findByMTRL, findByID, product } = req.body;
    try { 
      let updateFields = {...product};
  
      const fetchNameFromDatabase = async (model, field) => {
        if (product[field]) {
          let data = await model.findOne({ ['softOne.' + field]: product[field] }, { 'softOne.NAME': 1, _id: 0 }).lean();
          return data ? data.softOne.NAME : null;
        }
        return null;
      };
      
      if(product.MTRCATEGORY) {
        updateFields.CATEGORY_NAME = await fetchNameFromDatabase(MtrCategory, 'MTRCATEGORY');

      }
      if(product.MTRGROUP) {
        updateFields.GROUP_NAME = await fetchNameFromDatabase(MtrGroup, 'MTRGROUP');
      }

      if(product.MTRSUBGROUP) {
        updateFields.SUBGROUP_NAME = await fetchNameFromDatabase(SubMtrGroup, 'MTRSUBGROUP');
      }

      if(product.MTRMARK) {
        updateFields.MTRMARK_NAME = await fetchNameFromDatabase(Markes, 'MTRMARK');
      }

      //MONGO STRUCTURE IS DIFFERENT:
      if(product.MTRMANFCTR) {
        let {NAME} = await Manufacturers.findOne({ MTRMANFCTR: product.MTRMANFCTR }, { NAME: 1, _id: 0 }).lean();
        updateFields.MANUFACTURER_NAME = NAME ;
      }
      
      
      let update = await SoftoneProduct.findOneAndUpdate(
        { $or: [{ MTRL: findByMTRL }, { _id: findByID }] },
        { $set: updateFields },
        { new: true }
      );
      console.log({update})
      if (update) {
        response.success = true;
        response.message = 'Product updated successfully';
        response.result = update;
      } else {
        response.message = 'Product not found';
      }
    } catch (e) {
      console.error(e.message)
      response.error = e;
    }
  
    return res.status(200).json(response);
  }


}


function conditions(product, response) {
//RETURN CONDITIONS:
let error = false;
if(product.MTRCATEGORY && !product.CATEGORY_NAME) {
  response.message = 'If your provide MTRCATEGORY, CATEGORY_NAME is required',
  error = true
}
if(product.MTRGROUP && !product.GROUP_NAME) {
  response.message = 'If your provide MTRGROUP, GROUP_NAME is required'
  error = true

}
if(product.MTRSUBGROUP && !product.SUBGROUP_NAME) {
  response.message = 'If your provide MTRSUBGROUP, SUBGROUP_NAME is required'
  error = true

}
if(product.MTRMANFCTR && !product.MMTRMANFCTR_NAME) {
  response.message = 'If your provide MTRMANFCTR, MMTRMANFCTR_NAME is required'
  error = true
}
return error;
}