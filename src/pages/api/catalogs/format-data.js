

export default async function handler(req, res) {
        if(req.method !== "POST") return res.status(405).json({message: "Method not allowed"})
        const {data, mongoKeys, attributes} = req.body;

       try {
        const newData = data.map(product => {
                const newProduct = {};
                mongoKeys.forEach(key => {
                        newProduct[key.related] = product[key.oldKey];
                });
                const ATTRIBUTES = []
                attributes.forEach(attribute => {
                        ATTRIBUTES.push({
                            label: attribute.name,
                            value: product[attribute.oldKey]
                        })
                        newProduct['ATTRIBUTES'] = ATTRIBUTES;
                });
                return newProduct;
        })
        console.log(JSON.stringify(newData))
        return res.status(200).json({success: true, result: newData})
       } catch (e) {
        console.log(e.message);
        return res.status(500).json({error: "Failed to process request."})
       }
}