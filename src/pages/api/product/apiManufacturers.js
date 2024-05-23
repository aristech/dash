import axios from "axios";
import mongoose from "mongoose";
import connectMongo from "../../../../server/config";
import Manufacturers from "../../../../server/models/manufacturersModel";
import translateData from "@/utils/translateDataIconv";


export default async function handler(req, res) {

    let action = req.body.action;
    if (action === 'findAll') {
        try {
            await connectMongo();
            const items = await Manufacturers.find({})
            return res.status(200).json({ success: true, result: items });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }

    if (action === 'create') {
        try {
            let { data } = req.body
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrManufacture/createManufacture`;
            let addedSoftone = await axios.post(URL, {
                username: "Service",
                password: "Service",
                name: data.NAME
            })


            if (!addedSoftone.data.success) return res.status(400).json({ success: false, result: null })
            await connectMongo();
            let insert = await Manufacturers.create({
                MTRMANFCTR: addedSoftone.data.kollerisPim.mtrmanfctr,
                CODE: addedSoftone.data.kollerisPim.mtrmanfctr,
                NAME: data.NAME,
                ISACTIVE: 1,
                COMPANY: "1001",
             
            })
       
            return res.status(200).json({ success: true, result: insert });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }

    if (action === 'update') {
        const { NAME, MTRMANFCTR, id, updatedFrom } = req.body;

        try {
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrManufacture/updateMtrManufacture`;
            let updateSoftone = await axios.post(URL, {
                username: "Service",
                password: "Service",
                company: 1001,
                name: NAME,
                mtrmanfctr: MTRMANFCTR.toString()
            })

      
            if (!updateSoftone.data.success) return res.status(400).json({ success: false, result: null })
            await connectMongo();


            const updatedManufacturers = await Manufacturers.updateOne(
                { _id: id },
                {$set: {
                    NAME: NAME
                }}
            );
        
            return res.status(200).json({ success: true, result: updatedManufacturers, error: null });

        } catch (e) {
            return res.status(400).json({ success: false, result: null, error: 'Αποτυχία ενημέρωσης βάσης' });
        }




    }

    if (action === 'delete') {
        try {
            let id = req.body.id;
            const manufacturers = await Manufacturers.findOneAndUpdate(
                { _id: id },
                { status: false },
                { new: true }
            );
            return res.status(200).json({ success: true, result: manufacturers, error: null });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }

    }

    if (action === 'populateDatabase') {
        try {
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.MtrManufacture/getMtrManufactures`;
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    username: "Service",
                    password: "Service",
                })
            });

            
         
            let buffer = await translateData(response)
           await connectMongo();
            let insert = await Manufacturers.insertMany(buffer.result)

            return res.status(200).json({ success: true, result: insert  });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }
    if (action === 'syncManufacturers') {
        try {
            await connectMongo();
            const mongoArray = await Manufacturers.find();
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.MtrManufacture/getMtrManufactures`;
            let { data } = await axios.post(URL, {
                username: "Service",
                password: "Service",
            })


            let notFound = data.result.filter(o1 => {
                return !mongoArray.some((o2) => {
                    return o1.MTRMANFCTR == o2.softOne.MTRMANFCTR; // return the ones with equal id
                });
            });
            if (!notFound) {
                return res.status(200).json({ success: false, result: [] });

            }
       
            return res.status(200).json({ success: true, result: notFound });

        } catch (e) {
            return res.status(200).json({ success: false, result: [] });
        }

    }

    if (action === 'createMany') {
        const { data, createdFrom } = req.body;

        let newData = data.map(obj => ({softOne: obj, createdFrom: createdFrom, status: true}))
        try {
            await connectMongo();
            const manufacturers = await Manufacturers.insertMany(newData);
            if (!manufacturers) {
                return res.status(200).json({ success: false, result: null });
            }
            console.log('Softone Inserted Successfully', JSON.stringify(manufacturers))
            return res.status(200).json({ success: true, result: manufacturers });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }


}
