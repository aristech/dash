import SoftoneProduct from "../../../../server/models/newProductModel";

export default async function handler(req, res) {
    const response = {
        result: [],
        error: null,
        message: "",
        success: false
    };


    if (req.method !== "PUT") {
        response.message = "Method not allowed";
        return res.status(405).json(response);
    }

    const { data } = req.body;

    try {
        let countSuccess = 0;
        let countError = 0;
        for (let product of data) {
            let result = {};
            let field;
            const { images,  ...rest } = product;
            field = Object.values(rest)[0];
            console.log({field})
            const update = { 
                $push: {
                    images: images
                }
            };
            
            // 1) how many photos where updated
            // 2) how many products where updated, on each product how many photos where in total and how many where updated
          
            // return res.status(200).json({success: false})
            const productData = await SoftoneProduct.findOneAndUpdate(
                rest,
                update,
                { new: true }
            );
                //COMMON DATA:
                result.NAME = productData?.NAME || `Δεν βρέθηκε προϊόν με τον Κωδικό: ${field}`
                result.code = field;
            console.log({productData})
            if (productData) {
                //PRODUCT FOUND:
                ++countSuccess;
                result.success = true;
                result.message = "UPDATED";
            } else {
                //PRODUCT NOT FOUND:
                ++countError;
                result.success  = false;
                result.imageName = images;
                result.message = "NOT FOUND";
            }
            // Sort results based on success
            response.result.sort((a, b) => b.success - a.success);
           
            response.result.push(result);
        }
        response.success = true;
        response.countSuccess = countSuccess;
        response.totalProducts = data.length;
        response.countError = countError;
        response.message = 'Τα προϊόντα ενημερώθηκαν επιτυχώς'
        return res.status(200).json(response);
    } catch (e) {
        console.error("Error updating products:", e);
        response.error = e.message;
        return res.status(500).json(response);
    }
}
