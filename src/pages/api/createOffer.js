import SoftoneProduct from "../../../server/models/newProductModel";
import connectMongo from "../../../server/config"
import { ImpaCodes } from "../../../server/models/impaSchema"
import Clients from "../../../server/models/modelClients";
import Holders from "../../../server/models/holderModel";
import SingleOffer from "../../../server/models/singleOfferModel";
import createCSVfile from "@/utils/createCSVfile";
import { sendEmail } from "@/utils/offersEmailConfig";
import { getSaldoc, getFinDoc } from "./singleOffer";

function generateOfferNum(length) {
    const max = Math.pow(10, length) - 1; // Generates a number like 999999 for length = 6
    const min = Math.pow(10, length - 1); // Generates a number like 100000 for length = 6
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}




export default async function handler(req, res) {
    const action = req.body.action



    if (action === 'startOffer') {
        console.log('start-offer')
        const { selectedClient, user } = req.body;
        let TRDR = selectedClient.TRDR;
        let clientName = selectedClient.NAME;
        let clientEmail = selectedClient.EMAIL;
        let clientPhone = selectedClient.PHONE01;
        const num = generateOfferNum(6);


        try {
          

            await connectMongo();

            let create = await Holders.create({
                clientName: clientName,
                clientEmail: clientEmail,
                clientPhone: clientPhone,
                TRDR: TRDR,
                createdFrom: user,
                status: 'created',
                num: num
            })
            
            return res.status(200).json({ success: true, result: create })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }


    }

    if (action === "createImpaHolder") {
        const { products, impa, holderId } = req.body;
        try {


            const subString = impa?.greekDescription || impa?.englishDescriptio
            const fullName = impa?.code + ': ' + subString
            const checkimpa = await Holders.findOne({ _id: holderId, 'holders.impaCode': impa.code })
            if (checkimpa) {
                return res.status(200).json({ success: false, result: null, message: `Υπάρχει ήδη Holder για τον impa ${impa.code}` })
            }
            const update = await Holders.findOneAndUpdate(
                { _id: holderId },
                {
                    $push: {
                        holders: {
                            name: fullName,
                            isImpa: true,
                            impaCode: impa.code,
                            products: products
                        }
                    }
                },
                { new: true }
            );
            console.log(update)
            return res.status(200).json({ success: true, result: update, message: null })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "createHolder") {
        const { products, name, holderId } = req.body;
        try {

            const update = await Holders.findOneAndUpdate(
                { _id: holderId },
                {
                    $push: {
                        holders: {
                            name: name,
                            isImpa: false,
                            products: products
                        }
                    }
                },
                { new: true } // This option returns the modified document after the update
            );
            return res.status(200).json({ success: true })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "addMoreToHolder") {
        const { holderId, products } = req.body;

        const _products = [];
        const _existing = [];
        await connectMongo();

        try {
            let findImpaProducts = await Holders.findOne({ 'holders._id': holderId }, { 'holders.$': 1, _id: 0 })
            let existingProducts = findImpaProducts.holders[0].products
            products.filter((product) => {
                let found = existingProducts.find((item) => item.MTRL === product.MTRL)
                if (!found) {
                    _products.push(product)
                } else {
                    _existing.push(product.NAME)
                }
            })

            if (_existing.length > 0) {
                return res.status(200).json({ success: true, result: null, existing: _existing })
            }

            if (_products.length > 0) {
                await Holders.findOneAndUpdate({
                    'holders._id': holderId
                }, {
                    $push: {
                        'holders.$.products': { $each: _products }
                    }
                })
                return res.status(200).json({ success: true, existing: _existing })
            }

            return res.status(200).json({ success: false })
        } catch (e) {
            return res.status(200).json({ success: true, result: null, existing: [] })

        }
    }


    if (action === "updateQuantity") {
        const { quantity, holderId, MTRL, holderID, documentID, price, discountedPrice } = req.body;
        let newPrice = discountedPrice ? discountedPrice : price;
        let newTotalPrice = quantity * newPrice;
        let _new = parseFloat(newTotalPrice).toFixed(2);
        try {
            await connectMongo();
            async function updateProductQuantity(documentID, holderID, MTRL, newQuantity) {
                try {
                    const update = await Holders.findOneAndUpdate(
                        {
                            '_id': documentID,
                        },
                        {
                            $set: {
                                'holders.$[holder].products.$[product].QTY1': newQuantity,
                                'holders.$[holder].products.$[product].TOTAL_PRICE': _new
                            }
                        },
                        {
                            arrayFilters: [
                                { 'holder._id': holderID },
                                { 'product.MTRL': MTRL }
                            ],
                            new: true
                        }
                    );

                    console.log(update);
                    return update;
                } catch (error) {

                }
            }

            updateProductQuantity(documentID, holderID, MTRL, quantity);

            return res.status(200).json({ success: true })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "updateDiscount") {
        const { discount, PRICE, QTY1, MTRL, holderID, documentID, TRDR } = req.body;

        const mtrLine = [{
            MTRL: MTRL,
            QTY1: QTY1,
            PRICE: PRICE
        }]


        let salesdoc = await getNewSalesDoc(TRDR, mtrLine, discount)
        console.log(salesdoc)
        if (!salesdoc.success) {
            return res.status(200).json({ success: false, result: null, message: 'softone discount error' })
        }
        const newPrice = PRICE - (PRICE * discount / 100);
        const newTotal = newPrice * QTY1;

        try {
            const update = await Holders.findOneAndUpdate(
                {
                    '_id': documentID,
                },
                {
                    $set: {
                        'holders.$[holder].products.$[product].DISCOUNTED_PRICE': newPrice,
                        'holders.$[holder].products.$[product].DISCOUNT': discount,
                        'holders.$[holder].products.$[product].TOTAL_PRICE': newTotal
                    }
                },
                {
                    arrayFilters: [
                        { 'holder._id': holderID },
                        { 'product.MTRL': MTRL }
                    ],
                    new: true
                }
            );
            return res.status(200).json({ success: true })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })

        }




    }
    if (action === "findImpaProducts") {
        let { code } = req.body
        try {
            await connectMongo();
            const impas = await ImpaCodes.find({ code: code })
                .populate('products', 'MTRL CODE COST PRICER _id NAME');
            let products = impas[0].products

            return res.status(200).json({ success: true, result: products })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }

    }



    if (action === "findHolderProducts") {
        const { documentID, holderID } = req.body;
        try {
            await connectMongo();
            const holder = await Holders.findOne({ _id: documentID, 'holders._id': holderID }, { "holders.$": 1 })

            return res.status(200).json({ success: true, result: holder })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }



    if (action == "saveNewEmail") {
        try {
            await connectMongo();
            const { id, email } = req.body;
            console.log('email')
            console.log(id, email)

            let update = await Clients.updateOne({ _id: id }, {
                $set: {
                    EMAIL: email
                }
            })
            console.log(update)
            return res.status(200).json({ success: true, result: update })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })

        }
    }


    if (action === "updateStatus") {
        const { status, id, TRDR, data } = req.body;
        let saldoc;

        if (status === 'done') {
            const mtrlArr = data.flatMap(holder => {
                let arr = holder.products.map(product => {
                    const MTRL = parseInt(product.MTRL);
                    const QTY1 = parseInt(product.QTY1);
                    return { MTRL, QTY1 };
                })
                return arr
            })

            async function getSaldoc() {
                let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.utilities/getSalesDoc`;
                const response = await fetch(URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        username: "Service",
                        password: "Service",
                        SERIES: 7001,
                        COMPANY: 1001,
                        TRDR: TRDR,
                        MTRLINES: mtrlArr
                    })
                });

                let responseJSON = await response.json();
                return responseJSON;
            }

            let softResponse = await getSaldoc();
            if (!softResponse.success) {
                saldoc = 'saldoc error'
            } else {
                saldoc = softResponse.SALDOCNUM
            }
        }


        try {
            await connectMongo();
            let update = await Holders.updateOne({ _id: id }, {
                $set: {
                    status: status,
                    SALDOCNUM: saldoc,
                }
            })
            console.log(update)
            return res.status(200).json({ success: true, result: update })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }

    }


    if (action === "addOfferDatabase") {
        const { holders, client, email, id, num, createdFrom } = req.body;


        try {
            await connectMongo();
            let insert = await Holders.create({
                clientName: client.NAME,
                clientEmail: email,
                clientPhone: client.PHONE01 || '',
                TRDR: client.TRDR,
                holders: holders,
                createdFrom: createdFrom,
                status: 'created',
                num: num
            })
            console.log('insert')
            console.log(insert)

            await Clients.updateOne({ NAME: client.NAME }, {
                $set: {
                    OFFERSTATUS: true
                }
            })
            return res.status(200).json({ success: true, result: insert })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }


    }
    if (action === "sendEmail") {
        // const {  products, cc, clientEmail, id,  subject, message, fileName, includeFile } = req.body;
        const {formData, products, id} = req.body;
        const {email, subject, cc, message, fileName} = formData;
      
        try {
            await connectMongo();
            const csv = await createCSVfile(products)
            const send = await sendEmail(email, cc, subject, message, fileName, csv );
            console.log({send})
            if(send.status) {
                try {
                  const update =  await Holders.updateOne({ _id: id }, {
                        $set: {
                            status: "sent"
                        }
                    })
                    console.log({update})
                } 
                catch(e) {
                    console.log(e)
                }
            }
            return res.status(200).json({ success: true, message: send.message })
        } catch (e) {
            return res.status(500).json({ success: false, message:e.message })
        }


    }

    if (action === "addProductsToImpa") {
        const { products, impa } = req.body;
        console.log('PRODUCTS')

        const ids = products.map((item) => item._id)
        try {
            await connectMongo();
            let find = await ImpaCodes.updateOne(
                { code: impa },
                { $addToSet: { products: { $each: ids } } }

            )


            return res.status(200).json({ success: true, result: find })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "removeHolderItems") {
        const { mtrl, documentID, holderID } = req.body;
        console.log(holderID)
        console.log(documentID)
        try {
            await connectMongo();
            let removeItem = await Holders.findOneAndUpdate(
                { _id: documentID, 'holders._id': holderID },
                {
                    $pull: {
                        'holders.$.products': { MTRL: mtrl.toString() }
                    }
                }
            )
            console.log(removeItem)
            return res.status(200).json({ success: true, result: removeItem })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }
    if (action === "findClientHolder") {
        const { clientName } = req.body;

        try {
            let holder;
            await connectMongo();
            if (clientName) {
                holder = await Holders.find({ clientName: clientName })
            }
            if (!clientName || clientName === '') {
                holder = await Holders.find({}).sort({ createdAt: -1 })
            }

            return res.status(200).json({ success: true, result: holder })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === 'countOffers') {
        const { clientName } = req.body;
        try {
            await connectMongo();
            const totalRecords = await Holders.countDocuments({ clientName: clientName });
            const totalRecords2 = await SingleOffer.countDocuments({ clientName: clientName });
            const newRecords = totalRecords + totalRecords2
            console.log(totalRecords)
            console.log(newRecords)
            return res.status(200).json({ success: true, result: newRecords })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === 'deleteOffer') {
        const { id, TRDR } = req.body;
        //client shcema has a boolean field OFFERSTATUS, if there are no offers or holders, OFFERSTATUS is set to false

        try {
            await connectMongo();
            const deleted = await Holders.deleteOne({ _id: id });
            let offers = await SingleOffer.find({TRDR: TRDR});
            let holders = await Holders.find({TRDR: TRDR});
            if(offers.length === 0 && holders.length === 0) {
                await Clients.updateOne({ TRDR: TRDR }, {
                    $set: {
                        OFFERSTATUS: false
                    }
                })
            }
            return res.status(200).json({ success: true, result: deleted })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "deleteHolder") {
        const { holderId, documentID } = req.body;
        console.log(holderId)
        console.log(documentID)
        try {
            await connectMongo();
            const deleted = await Holders.findOneAndUpdate({ _id: documentID }, {
                $pull: {
                    holders: { _id: holderId }
                }
            });
            console.log('deleted')
            console.log(deleted)
            return res.status(200).json({ success: true, result: deleted })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === "holdersTotalPrice") {
        const { documentID } = req.body;
        try {
            await connectMongo();
            const holder = await Holders.findOne({ _id: documentID }, { holders: 1 })
            let totalPrice = 0;
            for (let item of holder.holders) {
                for (let product of item.products) {
                    totalPrice += product.TOTAL_PRICE
                }
            }
            console.log(totalPrice)
            let update = await Holders.updateOne({ _id: documentID }, {
                $set: {
                    totalPrice: totalPrice
                }
            })
            return res.status(200).json({ success: true, result: totalPrice })
        } catch (e) {
            return res.status(500).json({ success: false, result: null })
        }
    }

    if (action === 'totalDiscount') {
        const { documentID, discount, totalPrice } = req.body;
        let discountedPrice = (totalPrice - totalPrice * discount / 100).toFixed(2);
        try {
            let update = await Holders.updateOne({ _id: documentID }, {
                $set: {
                    discount: discount,
                    discountedTotal: discountedPrice
                }
            })

            return res.status(200).json({ success: true })

        } catch (e) {
            return res.status(500).json({ success: false })
        }
    }
    if (action === 'createFinDoc') {
        const { id, TRDR } = req.body;
        console.log(id)
        console.log(TRDR)
        try {
            await connectMongo();
            let products = await Holders.findOne({ _id: id })
            let mtrLines = [];
            let totalDiscount = products.discount ? products.discount : 0;
            for (let item of products.holders) {
                for (let product of item.products) {
                    let obj = {
                        MTRL: product.MTRL,
                        QTY1: product.QTY1,
                        PRICE: product.PRICE,
                        DISC1PRC: product.DISCOUNT ? product.DISCOUNT : 0,
                    }
                    mtrLines.push(obj)
                }
            }


            let salcoc = await getNewSalesDoc(TRDR, mtrLines, totalDiscount)
            if (!salcoc.success) {
                return res.status(200).json({ success: false, error: "softone disc1prc error" })
            }

            let fincode = await getFinDoc(salcoc.SALDOCNUM)
            if (!fincode.success) {
                return res.status(200).json({ success: false, error: "softone findoc error" })
            }
            let update = await Holders.findOneAndUpdate({ _id: id }, {
                $set: {
                    FINCODE: fincode.result[0].FINCODE
                }
            }, { new: true})
            return res.status(200).json({ success: true })
        } catch (e) { }
        return res.status(200).json({ success: true })
    }
}



async function getNewSalesDoc(TRDR, MTRLINES, totalDiscount) {
    let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.parastatika/newSalesDoc`;
    const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
            username: "Service",
            password: "Service",
            COMPANY: 1001,
            SERIES: 7021,
            PAYMENT: 1012,
            TRDR: TRDR,
            SOCARRIER: 238,
            DISC1PRC: totalDiscount,
            MTRLINES: MTRLINES
        })
    });

    let responseJSON = await response.json();
    console.log(responseJSON)
    return responseJSON;
}


