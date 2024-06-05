import Supplier from "../../../server/models/suppliersSchema";
import connectMongo from "../../../server/config";
import SupplierOrders from "../../../server/models/supplierOrders";
import PendingOrders from "../../../server/models/pendingOrders";
import CompletedOrders from "../../../server/models/completedOrdes";
import createCSVfile from "@/utils/createCSVfile";
import { sendEmail } from "@/utils/offersEmailConfig";

export function calculateCompletion(products) {
    let total = 0;
    for (let item of products) {
        total += item.COST * item.QTY1;
    }
    console.log('total')
    console.log(total)
    return parseFloat(total.toFixed(2));
}


export default async function handler(req, res) {

    const action = req.body.action;
    if (action === 'findOrders') {
        const { skip, limit } = req.body;
        try {
            await connectMongo();
            let totalRecords = await SupplierOrders.countDocuments({});
            let orders = await SupplierOrders.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit)
            return res.status(200).json({ success: true, result: orders, totalRecords: totalRecords })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

  

    if (action === "saveNewEmail") {
        let { email, id } = req.body;

        await connectMongo();
        try {
            console.log(email, id)
            let update = await Supplier.updateOne({ _id: id }, {
                $set: {
                    EMAIL: email
                }
            })
            return res.status(200).json({ success: true, result: update })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "createBucket") {
        const { products, email, TRDR, NAME, minOrderValue } = req.body;
        

        try {
            await connectMongo();
          
            //CHECK IF THERE IS ALREADY AN ORDER WITH THIS TRDR
            let find = await PendingOrders.findOne({ TRDR: TRDR });
            if (find) {
                return res.status(200).json({ success: false, result: "Υπάρχει ήδη ενεργή παραγγελία στον προμηθευτή" })
            }
            let completion = calculateCompletion(products);
           
            let obj = {
                supplierName: NAME,
                supplierEmail: email || '',
                status: "pending",
                products: products,
                TRDR: TRDR,
                minOrderValue: minOrderValue,
                orderCompletionValue: completion,
            }
        

            let insert = await PendingOrders.create(obj)
            let suppliersupdate = await Supplier.updateOne({ TRDR: TRDR }, {
                $set: {
                    ORDERSTATUS: true,
                }
            })

            return res.status(200).json({ success: true })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }


    }

    if (action === 'updateBucket') {
        const { products, TRDR } = req.body;
       
        try {
            await connectMongo();
            let find = await PendingOrders.findOne({ TRDR: TRDR })
            //find products in the database with this TRDR
            let dbproducts = find?.products;
            let newordercompletion = parseFloat(find.orderCompletionValue) + calculateCompletion(products);
         
          
          
            let _products = [];
            for (let item of products) {
                let itemDB = dbproducts.find(dbItem => dbItem.MTRL === item.MTRL);
                if(!itemDB) {
                    _products.push(item)
                }
            }

           
            let update = await PendingOrders.updateOne({ TRDR: TRDR }, {
                $set: {
                    orderCompletionValue: newordercompletion
                 },
                $push: {
                    products: _products
                },
                
            })
          
         
            await Supplier.updateOne({ TRDR: TRDR }, {
                $set: {
                    orderCompletionValue: newordercompletion
                }
            })
            return res.status(200).json({ success: true })

        } catch (e) {
            return res.status(500).json({ success: false })
        }





    }

    if (action === 'findPending') {
        const { TRDR } = req.body;
        try {
            await connectMongo();
            const order = await PendingOrders.find({ TRDR: TRDR })
            return res.status(200).json({ success: true, result: order })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "findCompleted") {
        const { TRDR } = req.body;
        try {
            await connectMongo();
            let complete = await CompletedOrders.find({ TRDR: TRDR }).sort({ createdAt: -1 })
            return res.status(200).json({ success: true, result: complete })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if(action === "issuePurdoc") {
        const {id, TRDR} = req.body;


        try {
            await connectMongo();
            let find = await PendingOrders.findOne({ _id: id });
            console.log('find')
            console.log(find)
            const products = find.products;
            const mtrlArr = products.map(item => {
                const MTRL = parseInt(item.MTRL);
                const QTY1 = parseInt(item.QTY1);
                return { MTRL, QTY1 };
            });
            console.log('mtrlArr')
            console.log(mtrlArr)

            const PURDOC = await getPurdoc(mtrlArr, TRDR)
            console.log({PURDOC})
            if (!PURDOC) {
                throw new Error('purdcocum not created')
            }

            let obj = {
                supplierName: find?.supplierName,
                supplierEmail: find?.supplierEmail,
                status: "issued",
                products: products,
                TRDR: TRDR,
                PURDOCNUM: PURDOC,
            }
           
            try {
                let create = await CompletedOrders.create(obj);
                console.log('create')
                console.log(create)
            } catch (e) {
                console.log('create error')
                console.log(e)
                return res.status(200).json({ success: false, result: null, message: 'order not transfered to completed' })

            }
           
            
            let deleteOne = await PendingOrders.deleteOne({ TRDR: TRDR });
            console.log('deleteOne')
            console.log(deleteOne)
            let updateSupplier = await Supplier.updateOne({ TRDR: TRDR }, {
                $set: {
                    ORDERSTATUS: false,
                }
            })
            console.log('updateSupplier')
            console.log(updateSupplier)
            return res.status(200).json({success: true, message: null})
        } catch (e) {
            return res.status(500).json({success: false})
        }
    }
    if (action === "sentEmail") {
        const {formData, id} = req.body;
        const {email, subject, cc, message, fileName} = formData;
      
        let csv;
        try {
            let find = await CompletedOrders.findOne({ _id: id });
            const products = find?.products;
            const _products = products.map((item, index) => {
                return {
                    "Όνομα Προϊόντος": item.NAME,
                    "Κόστος": item.COST,
                    "Ποσότητα": item.QTY1,
                    "Συνολικό Κόστος": item.TOTAL_COST
                }
            })
            csv = await createCSVfile(_products)
        } catch(e) {
            return res.status(500).json({ success: true,  message: e.message })
        }
        try {
            const send = await sendEmail(email, cc, subject, message, fileName, csv );
            if(send.status) {
                let update = await CompletedOrders.findOneAndUpdate({ _id: id }, {
                    $set: {
                        status: "sent"
                    }
                }, { new: true
                })
                console.log({update})
            }
         
            return res.status(200).json({ success: true,  message: send.message, status: send.status })

        } catch (e) {
            return res.status(500).json({ success: false, message:e.message, status: false })
        }

    }
    if (action === "deleteCompletedOrder") {
        const {id, TRDR} = req.body;
        try {
            await connectMongo();
            let deleted = await CompletedOrders.deleteOne({_id: id})
            let completed = await CompletedOrders.findOne({TRDR: TRDR});
            let pending = await PendingOrders.findOne({TRDR: TRDR});
            if(!completed && !pending) {
                await Supplier.updateOne({ TRDR: TRDR }, {
                    $set: {
                        ORDERSTATUS: false
                    }
                })
            }
            return res.status(200).json({success: true, result: deleted})
        } catch (e) {
            return res.status(500).json({success: false, result: null})
        }
    }
    if (action === "deletePendingOrder") {
        const {id, TRDR} = req.body;
        try {
            await connectMongo();
            let deleted = await PendingOrders.deleteOne({_id: id});
            let completed = await CompletedOrders.findOne({TRDR: TRDR});
            let pending = await PendingOrders.findOne({TRDR: TRDR});
            if(!completed && !pending) {
                await Supplier.updateOne({ TRDR: TRDR }, {
                    $set: {
                        ORDERSTATUS: false
                    }
                })
            }
            return res.status(200).json({success: true, result: deleted})
        } catch (e) {
            return res.status(500).json({success: false, result: null})
        }
    }

    if(action === "updateQuantity") {
        const {id, QTY1, MTRL, TRDR} = req.body;
        
        
        try {
            await connectMongo();
            let find = await PendingOrders.findOne({_id: id});

            let products = find.products;
            //find the products that the quantity doesnt change
            let rest_products = products.filter(item => item.MTRL !== MTRL);
            //The item that we change the QUANTITY
            let product = products.find(item => item.MTRL === MTRL);

            //ESTIMATE THE NEW TOTAL:
            let total = 0;
            for(let item of rest_products) {
                total += item.TOTAL_COST;
            }
            let itemTotal = QTY1 * product.COST;
            itemTotal = parseFloat(itemTotal.toFixed(2));
            total += itemTotal;
            total = parseFloat(total.toFixed(2));

            let update = await PendingOrders.findOneAndUpdate({_id: id, 'products.MTRL': MTRL}, {
                $set: {
                    'orderCompletionValue': total,
                    'products.$.QTY1': QTY1,
                    'products.$.TOTAL_COST': itemTotal
                }
            }, {new: true})
            
            await Supplier.updateOne({ TRDR: TRDR }, {
                $set: {
                    orderCompletionValue:  total
                }
            })
            return res.status(200).json({success: true})

        } catch (e) {
            return res.status(500).json({success: false})
        }

    }

    if(action ==="deleteProduct") {
        const {id, MTRL} = req.body;
        console.log(id, MTRL)
        try {
            await connectMongo();
            let find = await PendingOrders.findOne({_id: id, 'products.MTRL': MTRL});
            let products = find.products;
         
            let remaining = products.filter(item => item.MTRL !== MTRL);
          
            let total = 0;
            for(let item of remaining) {
                total += item.COST * item.QTY1;
            }

            
            let update = await PendingOrders.findOneAndUpdate({_id: id, 'products.MTRL': MTRL}, {
                $set: {
                    orderCompletionValue: total
                },
                $pull: {
                    products: {
                        MTRL: MTRL
                    }
                }
            }, {new: true})
            console.log(update);
            return res.status(200).json({success: true})
        } catch (e) {
            return res.status(500).json({success: false})
        }
    }

}





export const getPurdoc = async (data, TRDR) => {
    console.log({data})
    let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.utilities/getPurDoc`;
    const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            username: "Service",
            password: "Service",
            COMPANY: "1001",
            SERIES: 2021,
            TRDR: TRDR,
            MTRLINES: data
        })
    });
    let resJson = await response.json();
    console.log({resJson})
    return resJson.PURDOCNUM;
}


