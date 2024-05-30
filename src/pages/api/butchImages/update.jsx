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
        let countNotFound = 0;
        let countError = 0;
        for (let product of data) {
            let result = {};
            
            let field;
            const { images,  ...rest } = product;
            const filter = {};
            const update = { 
                $push: {
                    images: {
                        name: images.toString()
                    }
                }
            };

            for (const key in rest) {
                filter[key] = rest[key];
                field = rest[key];
            }
            console.log({filter})
            const productData = await SoftoneProduct.findOneAndUpdate(
                filter,
                update,
                { new: true }
            );
                //COMMON DATA:
                result.NAME = productData?.NAME || 'Δεν βρέθηκε προϊόν με τον Κωδικό:'
                result.code = field;
                result.imageName = images;
            if (productData) {
                //PRODUCT FOUND:
                countSuccess++;
                result.success = true;
                result.message = "UPDATED";
            } else {
                //PRODUCT NOT FOUND:
                countError++;
                result.imageName = images;
                result.message = "NOT FOUND";
            }
            response.success = true;
            response.countSuccess = countSuccess;
            response.countNotFound = countNotFound;
            response.message = 'Τα προϊόντας ενημερώθηκαν επιτυχώς'
            response.result.push(result);
        }
        return res.status(200).json(response);
    } catch (e) {
        console.error("Error updating products:", e);
        response.error = e.message;
        return res.status(500).json(response);
    }
}
