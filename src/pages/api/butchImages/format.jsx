
export default async function handler(req, res) {
    const response = {
        success: false,
        result: [],
        error: "",
        message: ""
    }
    if(req.method !== "POST") {
        response.message = "Method not allowed";
        return res.status(405).json(response)
    }
    //GET THE DATA:
    const {data, mongoKeys} = req.body;
    console.log({mongoKeys})
    console.log({data})
   try {
    const newData = data.map(product => {
            const newProduct = {};
            mongoKeys.forEach(key => {
                    newProduct[key.value] = product[key.oldKey];
            });
            return newProduct;
    })
    console.log({newData})
    response.result = newData
    response.success = true
    response.message = "Επιτυχής διαδικασία."
    return res.status(200).json(response)
   } catch (e) {
    console.log(e.message);
    response.error = e.message

    return res.status(500).json(response)
   }
}