import { removeEmptyObjectFields } from "@/utils/removeEmptyObjectFields"
import SoftoneProduct from "../../../../server/models/newProductModel"


export default async function handler(req, res) {
  
    if(req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"})
    }

    let response = {}
        const {data } = req.body
        try {
            let strings = {
                NAME: data?.NAME,
                MTRCATEGORY:  data?.MTRCATEGORY?.softOne?.MTRCATEGORY?.toString(),
                MTRGROUP: data?.MTRGROUP?.softOne?.MTRGROUP?.toString(),
                CCCSUBGROUP2:  data?.CCCSUBGROUP2?.softOne?.cccSubgroup2?.toString(),
                MTRMANFCTR:  data?.MTRMANFCTR?.MTRMANFCTR,
                MTRMARK: data?.MTRMARK?.MTRMARK?.toString(),
                ISACTIVE: data?.ISACTIVE ? "1" : "0",
                SKROUTZ: data?.isSkroutz ? "1" : "0",
                PRICER: data?.PRICER?.toString(),
                PRICEW: data?.PRICEW?.toString(),
                CODE: data?.CODE,
                CODE1: data?.CODE1,
                COUNTRY: data?.COUNTRY?.COUNTRY?.toString(),
                CODE2: data?.CODE2,
                PRICER02: data?.PRICER02?.toString(),
                GWEIGHT: data?.GWEIGHT?.toString(),
                HEIGHT: data?.HEIGHT?.toString(),
                LENGTH: data?.LENGTH?.toString(),
                WIDTH: data?.WIDTH?.toString(),
                VAT: data.VAT?.VAT?.toString(),
                INTRASTAT: data?.INTRASTAT?.INTRASTAT?.toString(),
                VOLUME: data?.VOLUME?.toString(),
            }
            console.log({strings})
            let newData = removeEmptyObjectFields(strings);
            console.log(({newData}))
            // return res.status(200).json({message: "Το προϊόν προστέθηκε επιτυχώς στο SoftOne", status: true})
            let softone = await newMTRL(newData);
            console.log({softone})
            if(softone.success) {
              let system = await updateSystem(softone.MTRL, data._id, strings)
              if(system) {
                response.message = "Το προϊόν προστέθηκε επιτυχώς στο SoftOne"
                response.status = true
                return res.status(200).json(response)
              } else {
                response.message = "Υπήρξε Πρόβλημα στην Ενημέρωση του Προϊόντος στο Σύστημα"
                response.status = false
                return res.status(500).json(response)
              }
            } else {
                response.message = "Υπήρξε Πρόβλημα στην Προσθήκη του Προϊόντος στο SoftOne"
                response.status = false
                return res.status(500).json(response)
            }
           

        } catch (e) {
            console.log(e.message)
            response.message = e.message
            response.success = false
           
        }

       
        

}

async function updateSystem(softoneId, id, data) {
    let update = await SoftoneProduct.findOneAndUpdate({
        _id: id
    }, {
        $set: {
            MTRL: softoneId,
            SOFTONESTATUS: true,
            ...data
        }
    }, {new: true})
    console.log(update)
    return update
}


async function newMTRL(data) {
    let response = {};
    let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrl/NewMtrl`;
    try {
        let result = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: "Service",
                password: "Service",
                SODTYPE: 52,
                COMPANY: "1001",
                MU31: "1",
                MTRUNIT1: "101",
                MTRUNIT3: "101",
                MTRUNIT4: "101",
                ...data,
            })
        })
   
       let resJson = await result.json()
         return  resJson
        
        
    }
    catch (e) {
        response.error = e.message
        response.success = false
        return response
    }

}