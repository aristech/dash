

import axios from "axios";
import format from "date-fns/format";
import translateData from "@/utils/translateDataIconv";
import connectMongo from "../../../../server/config";
import SoftoneProduct from "../../../../server/models/newProductModel"
import { Product } from "../../../../server/models/newProductModel";
import { removeEmptyObjectFields } from "@/utils/removeEmptyObjectFields";



export const config = {
    api: {
        responseLimit: false,
    },
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=10');
    const action = req.body.action;
  
    if (action === "create") {
        const { data } = req.body;
        let response = {
            success: false,
            result: null,
            error: "",
            message: ""
        };
    
        const transformData = (data) => {
            const {
                MTRCATEGORY, MTRGROUP, CCCSUBGROUP2, MTRMARK, MTRMANFCTR,
                INTRASTAT, VAT, COUNTRY, PRICER,
                WIDTH, LENGTH, HEIGHT, GWEIGHT, VOLUME,
                DIATHESIMA, SEPARAGELIA, DESVMEVMENA
            } = data;
    
            return {
                ...data,
                // CATEGORY
                MTRCATEGORY: MTRCATEGORY?.softOne?.MTRCATEGORY,
                CATEGORY_NAME: MTRCATEGORY?.categoryName,
                // GROUP
                MTRGROUP: MTRGROUP?.softOne?.MTRGROUP,
                GROUP_NAME: MTRGROUP?.groupName,
                // SUBGROUP
                CCCSUBGROUP2: CCCSUBGROUP2?.softOne?.cccSubgroup2,
                SUBGROUP_NAME: CCCSUBGROUP2?.subGroupName,
                // BRAND
                MTRMARK: MTRMARK?.softOne?.MTRMARK,
                MTRMARK_NAME: MTRMARK?.softOne?.NAME,
                // MANUFACTURER
                MTRMANFCTR: MTRMANFCTR?.MTRMANFCTR?.toString(),
                MMTRMANFCTR_NAME: MTRMANFCTR?.NAME,
                // REST
                INTRASTAT: INTRASTAT?.INTRASTAT,
                VAT: VAT?.VAT,
                COUNTRY: COUNTRY?.COUNTRY,
                PRICER: PRICER,
                // TURN TO STRING
                WIDTH: WIDTH?.toString(),
                LENGTH: LENGTH?.toString(),
                HEIGHT: HEIGHT?.toString(),
                GWEIGHT: GWEIGHT?.toString(),
                VOLUME: VOLUME?.toString(),
                availability: {
                    DIATHESIMA: DIATHESIMA?.toString() || "0",
                    SEPARAGELIA: SEPARAGELIA?.toString() || "0",
                    DESVMEVMENA: DESVMEVMENA?.toString() || "0",
                    date: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
                },
                ISACTIVE: true,
                SOFTONESTATUS: false
            };
        };
    
        const filterNull = (obj) => {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                if (value !== null && value !== undefined && value !== "" &&
                    key !== "DIATHESIMA" && key !== "SEPARAGELIA" && key !== "DESVMEVMENA") {
                    acc[key] = value;
                }
                return acc;
            }, {});
        };
    
        const newData = transformData(data);
        const filteredData = filterNull(newData);
    
        try {
            await connectMongo();
            let product = await SoftoneProduct.create(filteredData);
            if (!product) {
                response.message = 'Δεν δημιουργήθηκε το προϊόν';
                return res.status(400).json(response);
            }
            console.log(product)
            response.success = true;
            response.result = product;
            return res.status(200).json(response);
        } catch (error) {
            response.error = error.message || error;
            response.message = "Error creating product in the system";
            return res.status(400).json(response);
        }
    }
    if (action === 'update') {
        const { data } = req.body;
        let response = {
            success: false,
            result: null,
            error: "",
            message: ""
        }

        // if(data.MTRL) {
        //    let softone = await putSoftone(data)
        //    if(!softone.success) {
        //         response.success = false,
        //         response.message = "Αποτυχία ενημέρωσης του SOFTONE"
        //         return res.status(400).json(response)
        //    }
        //    response.message = "Επιτυχής ενημέρωση Softone"
        // }

        //Due to the format of the data from the dropdowns if the data change when the user edits we will receive and object. 
        //If the data remains unchanged during edit it will evaluate to the right of the ternary operator
        const systemData = {
            NAME: data?.NAME,
            NAME_ENG: data?.NAME_ENG,
            DESCRIPTION: data?.DESCRIPTION,
            DESCRIPTION_ENG: data?.DESCRIPTION_ENG,
            //CATEGORIZATION:
            MTRCATEGORY: data?.MTRCATEGORY?.softOne?.MTRCATEGORY,
            CATEGORY_NAME: data?.MTRCATEGORY?.categoryName,
            MTRGROUP: data?.MTRGROUP?.softOne?.MTRGROUP,
            GROUP_NAME: data?.MTRGROUP?.groupName,
            CCCSUBGROUP2: data?.CCCSUBGROUP2?.softOne?.cccSubgroup2,
            SUBGROUP_NAME: data?.CCCSUBGROUP2?.subGroupName,
            MTRMARK: data?.MTRMARK?.softOne?.MTRMARK,
            MTRMARK_NAME: data?.MTRMARK?.softOne?.NAME,
            MTRMANFCTR: data?.MTRMANFCTR?.MTRMANFCTR?.toString(),
            MMTRMANFCTR_NAME: data?.MTRMANFCTR?.NAME,
            //PRICES:
            PRICER: data?.PRICER,
            PRICEW: data?.PRICEW,
            PRICER02: data?.PRICER02,
            //CODES: 
            CODE: data?.CODE,
            CODE1: data?.CODE1,
            CODE2: data?.CODE2,
            //DETAILS:
            INTRASTAT: data?.INTRASTAT?.INTRASTAT,
            VAT: data?.VAT?.VAT?.toString(),
            COUNTRY: data?.COUNTRY?.COUNTRY?.toString(),
            //REST:
            WIDTH: data?.WIDTH?.toString(),
            LENGTH: data?.LENGTH?.toString(),
            HEIGHT: data?.HEIGHT?.toString(),
            GWEIGHT: data?.GWEIGHT?.toString(),
            VOLUME: data?.VOLUME?.toString(),
            ISACTIVE: data?.ISACTIVE,
            // SOFTONESTATUS: data?.SOFTONESTATUS,
        }
        let _systemData = removeEmptyObjectFields(systemData);
        try {
            await connectMongo();
            let update = await SoftoneProduct.findOneAndUpdate({
                _id: data._id
            }, {
                $set: _systemData
            }, { new: true})
            response.success = true;
            response.result = update;
            response.message += " Επιτυχής Eνημέρωση Συστήματος"
            return res.status(200).json(response);
        } catch (e) {
            console.log(e)
            response.error = e.message ;
            response.message = "Error updating product in the system";
            return res.status(400).json(response);
        }
     

       

    async function putSoftone(data) {
        let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/putMtrl`;
        let softoneData = {
          username: "Service",
          password: "Service",
          MTRL: parseInt(data.MTRL),
          COMPANY: 1001,
          ISACTIVE: data.ISACTIVE,
          NAME: data?.NAME,
          CODE: data?.CODE,
          CODE1: data?.CODE1,
          CODE2: data?.CODE2,
          MTRCATEGORY: data?.MTRCATEGORY?.softOne?.MTRCATEGORY?.toString(),
          MTRGROUP: data?.MTRGROUP?.softOne?.MTRGROUP?.toString(),
          CCCSUBGROUP2: data?.CCCSUBGROUP2?.softOne?.cccSubgroup2?.toString(),
          MTRMARK: data?.MTRMARK?.softOne?.MTRMARK?.toString(),
          MTRMANFCTR:data?.MTRMANFCTR?.MTRMANFCTR?.toString(),
          INTRASTAT: data?.INTRASTAT?.INTRASTAT?.toString(),
          VAT: data?.VAT?.VAT?.toString(),
          COUNTRY: data?.COUNTRY?.COUNTRY?.toString(),
          //PRICES:
          PRICER: data?.PRICER?.toString(),
          PRICEW: data?.PRICEW?.toString(),
          PRICER02: data?.PRICER02?.toString(),
          //REST:
          ISACTIVE: data?.ISACTIVE ? "1" : "0",
          VOLUME: data?.VOLUME?.toString(),
          GWEIGHT: data?.GWEIGHT?.toString(),
        
        };
        let _softoneData = removeEmptyObjectFields(softoneData);
        console.log({_softoneData})
        try {
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify(_softoneData)
            });
            let buffer = await translateData(response)
            console.log(buffer)
            return buffer;
        } catch(e) {
            console.error(e)
            return null;
        }
     }


    }

   
   

    if (action === 'updateClass') {
        
        let { categoryid, groupid, subgroupid, gridData, categoryName, groupName, subGroupName } = req.body;
        let OBJ = {
            MTRGROUP: groupid,
            GROUP_NAME: groupName,
            MTRCATEGORY: categoryid,
            CATEGORY_NAME: categoryName,
            CCCSUBGROUP2: subgroupid,
            SUBGROUP_NAME: subGroupName,
            CCCSUBGROUP3: ""
        }

        await connectMongo()

        async function updateSoft(item) {
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/updateMtrlCat`;
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    username: "Service",
                    password: "Service",
                    MTRL: item.MTRL,
                    MTRCATEGORY: categoryid,
                    MTRGROUP: groupid,
                    CCCSUBGOUP2: subgroupid,
                })
            });

            let respJSON = await response.json()

            return respJSON;
        }

        try {
            let results = [];
            if (gridData) {

                for (let item of gridData) {
                    if (!item.hasOwnProperty('MTRL')) {
                        results.push({ name: item?.NAME, updated: false, mtrl: false })
                    }
                    let MTRLID = item.MTRL;
                    let result = await SoftoneProduct.updateOne({
                        MTRL: MTRLID
                    }, {
                        ...OBJ
                    })
                 
                    
                    if (result.modifiedCount > 0 && item.hasOwnProperty('MTRL')) {
                        results.push({ name: item.NAME, updated: true, mtrl: true })
                    }
                    if (result.modifiedCount < 1) {
                        results.push({ MTRLID: MTRLID, updated: false, mtrl: true })
                    }

                    updateSoft(item)



                }
            }
            return res.status(200).json({ success: true, result: results });

        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }


    }



    if (action === 'warehouse') {
        const { exportWarehouse, importWarehouse, diathesimotita } = req.body;

        console.log({exportWarehouse, importWarehouse, diathesimotita})
        const now = new Date();
        const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');

        const updates = diathesimotita.map(item => ({
            updateOne: {
                filter: { MTRL: item.MTRL },
                update: {
                    $set: {
                        "availability.DIATHESIMA": item.available,
                        "availability.date": formattedDateTime.toString(),
                    }
                },
                upsert: false  // optional: set to true if you want to create a new document when no document matches the filter
            }
        }));
        SoftoneProduct.bulkWrite(updates)
            .then(result => {
            })
            .catch(err => {
                console.error(err);
            });

        let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.utilities/getItemDoc`;
        async function modifySoftonePost(SERIES, data) {
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    username: "Service",
                    password: "Service",
                    COMPANY: 1001,
                    WHOUSE: 1000,
                    SERIES: SERIES,
                    WHOUSESEC: 1000,
                    MTRLINES: data
                })
            });
            let resJSON = await response.json();

            return resJSON;
        }

        try {
            let importRes;
            let exportRes;
            if (exportWarehouse && exportWarehouse.length > 0) {
                importRes = await modifySoftonePost(1011, exportWarehouse)
            }
            if (importWarehouse && importWarehouse.length > 0) {
                exportRes = await modifySoftonePost(1010, importWarehouse)
            }


            return res.status(200).json({ success: true, resultImport: importRes, resultExport: exportRes });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }

    }

    if (action === "updateActiveMtrl") {
        const { ISACTIVE, MTRL, id } = req.body;
        let _ISACTIVE = ISACTIVE ? 1 : 0;
        // const mtrl = 94273

        let message;
        try {
            await connectMongo();
            let update = await SoftoneProduct.findOneAndUpdate({
                MTRL: MTRL,
                _id: id
            }, {
                $set: {
                    ISACTIVE: !ISACTIVE
                }
            })
            message = 'System update success.'
        } catch (e) {
            return res.status(200).json({ success: false, result: null, error: 'System update error' });
        }
        try {
            async function updateSoftone() {
                if (!MTRL) return;
                let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/updateMtrlActive`;
                const response = await fetch(URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        username: "Service",
                        password: "Service",
                        MTRL: MTRL,
                        ISACTIVE: _ISACTIVE
                    })
                });

                let buffer = await translateData(response)
                return message += ` ${buffer.result}`
            }
            let message = await updateSoftone();

        } catch (e) {
            return res.status(200).json({ success: false, result: null, error: 'Softone update error' });
        }

        return res.status(200).json({ success: true, message: message });
    }

    if (action === "updateSkroutz") {
        const { isSkroutz, MTRL, id } = req.body;
        //Softone accepts 1 or 0
        let _isSkroutz = isSkroutz ? 1 : 0;
        let message;

        try {
            async function updateSoftone() {
                if (!MTRL) return;
                let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/updateSkroutz`;
                const response = await fetch(URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        username: "Service",
                        password: "Service",
                        STATUS: _isSkroutz,
                        MTRL: MTRL,
                    })
                });
                let buffer = await translateData(response)
                return buffer.result
            }
            message = await updateSoftone();


        } catch (e) {
            return res.status(200).json({ success: false, result: null, error: 'Softone update error' });
        }

        try {
            await connectMongo();
            let update = await SoftoneProduct.findOneAndUpdate({
                MTRL: MTRL,
                _id: id
            }, {
                $set: {
                    isSkroutz: !isSkroutz
                }
            }, { new: true })
            message += ' System skroutz update success.'
        } catch (e) {
            return res.status(200).json({ success: false, result: null, error: 'System update error' });
        }


        return res.status(200).json({ success: true, message: message });
    }

    
    if (action === "addToSoftone") {
        const { data ,id} = req.body;
        let response = {
            success: false,
            result: null,
            error: "",
            message: ""
        }



        try {

            // async function createSoftone() {
            //     let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/NewMtrl`;
            //     const response = await fetch(URL, {
            //         method: 'POST',
            //         body: JSON.stringify({
            //             username: "Service",
            //             password: "Service",
            //             ...data
            //         })
            //     });
            //     let buffer = await translateData(response)
            //     return buffer;
            // }
            // let response = await createSoftone();
            // if (!response.success) {
            //     return res.status(200).json({ success: false, error: 'Δεν προστέθηκε στο softOne' });
            // }
            // if (response.success) {
            //     let update = await SoftoneProduct.findOneAndUpdate({ _id: id },
            //         {
            //             $set: {
            //                 SOFTONESTATUS: true,
            //                 MTRL: response.MTRL,
            //                 // ...mongoData
            //             }
            //         },
            //         { new: true }
            //     )
            //
            // }


            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }

    if (action === 'checkStatus') {
        const { products } = req.body;
        try {
            await connectMongo();
            const productsArray = []
            for (let item of products) {
                let product = await SoftoneProduct.findOne({ SOFTONESTATUS: false, _id: item._id })
                if (product) {
                    productsArray.push(product)

                }
            }
            return res.status(200).json({ success: true, result: productsArray });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }


    //IMAGES
    if (action === "addImages") {
        const { imagesURL, id } = req.body;


        try {
            await connectMongo();
            const updatedProduct = await SoftoneProduct.findOneAndUpdate(
                { _id: id }, // Using the passed 'id' variable
                {
                    $set: { hasImage: true },
                    $addToSet: { images: { $each: imagesURL } } // Push only the new URLs
                },
                { new: true } // To return the updated document
            );
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ success: false, result: null });
        }



    }

    if (action === 'getImages') {
        const { id } = req.body;

        await connectMongo()
        try {
            let product = await SoftoneProduct.findOne({ _id: id }, { images: 1 });
            return res.status(200).json({ message: "success", result: product?.images })
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }

    }
    if (action === "deleteImage") {
        const { parentId, imageId, name } = req.body;
        try {
            await connectMongo();
            const updatedProduct = await SoftoneProduct.findOneAndUpdate(
                { _id: parentId }, // Using the passed 'id' variable
                {
                    $pull: {
                        images: {
                            _id: imageId,
                            name: name
                        }
                    }
                },// Push only the new URLs
                { new: true } // To return the updated document
            );
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }

    if (action === "csvImages") {
        const { data, index, total } = req.body;


        let erp = data['Erp Code'];
        let image = data['Image Name'];

        try {
            const updatedDocument = await SoftoneProduct.findOneAndUpdate(
                { CODE: `${erp}` },
                {
                    $push: {
                        images: [{ name: image }]
                    },
                    $set: {
                        hasImage: true
                    }
                },
                { new: true, projection: { _id: 0, NAME: 1, CODE: 1, updatedAt: 1, images: { $slice: -1 } } }
            );
         
            let _newdoc = {
                NAME: updatedDocument.NAME,
                CODE: updatedDocument.CODE,
                updatedAt: updatedDocument.updatedAt,
                images: updatedDocument.images,
                updatedToTotal: `${index}/${total}`
            }

            return res.status(200).json({ success: true, result: _newdoc });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ success: false, result: null });
        }
    }
    


    // used by Kozyris:
    if (action === "update_service") {
        const { data } = req.body;

        try {
            await connectMongo();
            const errors = [];
            const result = [];
            for (let item of data) {
                const now = new Date();
                const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');

                let res = await updateSystem(item, formattedDateTime)
               
                if(!res) {
                    errors.push({
                        MTRL: item.MTRL,
                        error: 'Δεν βρέθηκε το προϊόν'
                    })
                }
                if(res) {
                    result.push({
                        success: 'Επιτυχής ενημέρωση',
                        MTRL: res._doc.MTRL,
                        PRICER: res._doc.PRICER,
                        PRICER01: res._doc.PRICER01,
                        PRICEW: res._doc.PRICEW,
                        COST: res._doc.COST,
                        isSkroutz: res._doc.isSkroutz,
                        availability: {
                            DIATHESIMA: res._doc.availability.DIATHESIMA,
                            SEPARAGELIA: res._doc.availability.SEPARAGELIA,
                            DESVMEVMENA: res._doc.availability.DESVMEVMENA,
                            date: res._doc.availability.date
                        }
                    })
                }
            }
           
            async function updateSystem(data, date) {
                let update = await SoftoneProduct.findOneAndUpdate({
                    MTRL: data.MTRL.toString()
                }, {
                    $set: {
                        PRICER: data.PRICER,
                        PRICER01: data.PRICER01,
                        PRICEW: data.PRICEW,
                        COST: data.COST,
                        isSkroutz: parseInt(data.isSkroutz) === 1 ? true : false,
                        availability: {
                            DIATHESIMA: data.DIATHESIMA.toString(),
                            SEPARAGELIA: data.SEPARAGELIA.toString(),
                            DESVMEVMENA: data.DESVMEVMENA.toString(),
                            date: date.toString()
                        }
                    }
                }, {new: true})
                return update;
            }
          
          
            return res.status(200).json({ success: true, errors: errors, result: result });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }

    if(action === 'update_service_cost') {
            const  {data} = req.body;
            await connectMongo();
            const errors = [];
            const result = [];
          
            try {
                for (let item of data) {
                    let res = await updateSystem(item)
                    if(!res) {
                        errors.push({
                            MTRL: item.MTRL,
                            error: 'Δεν βρέθηκε το προϊόν'
                        })
                    }
                    if(res) {
                        result.push({
                            success: 'Επιτυχής ενημέρωση',
                            COST: res._doc.COST,
                        })
                    }
                }
                async function updateSystem(data) {
                    let update = await SoftoneProduct.findOneAndUpdate({
                        MTRL: data.MTRL.toString()
                    }, {
                        $set: {
                            COST: data.COST,
                        }
                    }, {new: true})

                    return update;
                }
                return res.status(200).json({ success: true, errors: errors, result: result });
            } catch (e) {
                return res.status(400).json({ success: false, result: null });
            }
           

          
    }
}



