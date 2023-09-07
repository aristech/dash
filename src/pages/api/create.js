import axios from "axios";
import mongoose from "mongoose";
import translateData from "@/utils/translateDataIconv";
import { MtrCategory, MtrGroup, SubMtrGroup } from "../../../server/models/categoriesModel";
import connectMongo from "../../../server/config";
import Categories from "../dashboard/product/mtrcategories";
import Markes from "../../../server/models/markesModel";
export default async function handler(req, res) {
    let action = req.body.action;
    


    if(action === "createBrands") {
        try {
            let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrMark/getMtrMark`
        const response = await fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                username: "Service",
                password: "Service",
                company: 1001,
                sodtype: 51,

            })
        });
        let buffer = await translateData(response)
        await connectMongo();

        let result = await Markes.insertMany(buffer.result)
        console.log(result)
        return res.status(200).json({ success: true, result: result});
        } catch (e) {
            return res.status(400).json({ success: false, result: null});
        }
    }
    if(action === "createCategories") {
        let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrCategory/getMtrCategory`;
        console.log('createCategories')
        
        try {
            const response = await fetch(URL, {
                method: 'POST',
                body: JSON.stringify({
                    username: "Service",
                    password: "Service",
                    company: 1001,
                    sodtype: 51,

                })
            });
            let buffer = await translateData(response)
            await connectMongo();
            let newArray = [];
            buffer.result.map((item) => {
               let obj = {
                categoryName: item.NAME,
                categoryIcon: "",
                categoryImage: "",
                status: true,
                softOne: {
                    MTRCATEGORY: item.MTRCATEGORY,
                    CODE: item.CODE,
                    NAME: item.NAME,
                    ISACTIVE: item.ISACTIVE,
                }
               }
               newArray.push(obj)
            })
            console.log(newArray)
            let insert = await MtrCategory.insertMany(newArray, {upsert: true})
            console.log(insert)


        } catch (e) {
            console.log(e)
        }


    }
    if(action === "createGroups") {
        console.log('createCategories')
      try {
        let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrGroup/getMtrGroup`
       
        const response = await fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                username: "Service",
                password: "Service",
                company: 1001,
                sodtype: 51,

            })
        });
        let buffer = await translateData(response)
        console.log(buffer);

        await connectMongo();
        let newArray = [];
        buffer.result.map((item) => {
           let obj = {
            groupName: item.NAME,
            groupIcon: "",
            groupImage: "",
            status: true,
            softOne: {
                MTRGROUP: item.MTRGROUP,
                CODE: item.CODE,
                NAME: item.NAME,
                ISACTIVE: item.ISACTIVE,
                MTRCATEGORY: item.cccMTRCATEGORY,
            }
           }
           newArray.push(obj)
        })
        let insert = await MtrGroup.insertMany(newArray, {upsert: true})
        console.log(insert)
        return res.status(200).json({ success: true});
      } catch (e) {
        return res.status(400).json({ success: false});
      }
    }

    if(action === "createSubGroups") {
        let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.cccGroup/getCccGroup`
        const response = await fetch(URL, {
            method: 'POST',
            body: JSON.stringify({
                username: "Service",
                password: "Service",
                company: 1001,
                sodtype: 51,

            })
        });
        let buffer = await translateData(response)
        await connectMongo();
        
        let newArray = [];
        buffer.result.map((item) => {
              let obj = {
                subGroupName: item.name,
                subGroupIcon: "",
                subGroupImage: "",
                status: true,
                softOne: {
                 cccSubgroup2: item.cccSubgroup2,
                 short: item.short,
                 name: item.name,
                 MTRGROUP: item.MTRGROUP,
                }
              }
              newArray.push(obj)

        })
        let insert = await SubMtrGroup.insertMany(newArray, {upsert: true})
        console.log(insert)
        return res.status(200).json({ success: true});
    }

    if(action === "createRelationships") {
        await connectMongo();
       
       
        let findGroups = await SubMtrGroup.find({})
        for(let item of findGroups) {
            let id = item.softOne.MTRGROUP;
            let findCategory = await MtrGroup.findOne({'softOne.MTRGROUP': id})
         
            const updateCategories = await MtrGroup.findOneAndUpdate(
                {_id: findCategory._id},
                { $push: { 
                    subGroups : [item._id]
                }}
            )
        }
        console.log(updateCategories)
        
        return res.status(200).json({ success: true});
        
    
    
    }

    if(action === "groupsToCategories") {
        await connectMongo();
       
       
        let find = await MtrGroup.find({})

        for(let item of find) {
            let id = item.softOne.MTRCATEGORY;
            const updates = await MtrCategory.findOneAndUpdate(
                {'softOne.MTRCATEGORY': id},
                { $push: { 
                    groups : [item._id]
                }}
            )
        }
        
        return res.status(200).json({ success: true});
    }


}   

