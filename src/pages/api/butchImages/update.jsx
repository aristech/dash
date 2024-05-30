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
        for (let product of data) {
            let result = {};
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
            }
            console.log({filter})
            const productData = await SoftoneProduct.findOneAndUpdate(
                filter,
                update,
                { new: true }
            );
            console.log({productData})
            if (productData) {
                result.success = true;
                result.NAME = productData.NAME;
                result.imageName = images;
                result.message = "UPDATED";
            } else {
                result.success = false;
                result.NAME = product.NAME;
                result.imageName = images;
                result.message = "NOT FOUND";
            }
            response.success = true;
            response.message = 'Τα προϊόντας ενημερώθηκαν επιτυχώς'
            response.result.push(result);
        }
        return res.status(200).json(response);
    } catch (e) {
        console.error("Error updating products:", error);
        response.error = e.message;
        return res.status(500).json(response);
    }
}
