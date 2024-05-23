import connectMongo from "../../../../server/config";
import axios from "axios";
import Markes from "../../../../server/models/markesModel";
import { format } from "path";
import Supplier from "../../../../server/models/suppliersSchema";

export default async function handler(req, res) {


	
	let action = req.body.action;
	if(!action) return res.status(400).json({ success: false, error: 'no action specified' });


	if (action === 'findOne') {
	
		try {
			await connectMongo();
			const markes = await Markes.find({ _id: req.body.id });
			if (markes) {
				return res.status(200).json({ success: true, markes: markes });
			}
			else {
				return res.status(200).json({ success: false, markes: null });
			}


		} catch (error) {
			return res.status(400).json({ success: false, error: 'failed to fetch Markes', markes: null });
		}
	}

	if (action === 'findAll') {
		try {
			await connectMongo();
			const markes = await Markes.find({}).populate('supplier');
			if (markes) {
				const arrayImages = []
				for(let item of markes) {
					for(let image of item?.photosPromoList ?? []) {
						if(image?.photosPromoUrl) {
							arrayImages.push(image?.photosPromoUrl)
						}
						
						
					}
				}
				
				return res.status(200).json({ success: true, markes: markes, images: arrayImages});

			}
			else {
				return res.status(200).json({ success: false, markes: null });
			}


		} catch (error) {
			return res.status(400).json({ success: false, error: 'failed to fetch user' });
		}

	}

	if (action === 'create') {
		let { data } = req.body
		let {createdFrom} = req.body
		try {
			let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrMark/createMtrMark`;
			let softoneResponse = await axios.post(URL, {
				username: 'Service',
				password: 'Service',
				company: '1001',
				sodtype: '51',
				name: data.name
			})
		
			if (!softoneResponse.data.success) {
				return res.status(200).json({ success: false, markes: null, error: 'Αποτυχία εισαγωγής στο softone', softoneError: softoneResponse.data.error });
			}
			
			const SOFTONE_MTRMARK = softoneResponse.data.kollerisPim.MTRMARK

			const object = {
				description: data.description,
				logo: data.logo,
				videoPromoList: data.videoPromoList,
				photosPromoList: data.photosPromoList,
				pimAccess: {
					pimUrl: data.pimUrl,
					pimUserName: data.pimUserName,
					pimPassword: data.pimPassword
				},
				webSiteUrl: data.webSiteUrl,
				officialCatalogueUrl: data.officialCatalogueUrl,
				facebookUrl: data.facebookUrl,
				instagramUrl: data.instagramUrl,
				softOne: {
					COMPANY: '1001',
					SODTYPE: '51',
					MTRMARK: parseInt(SOFTONE_MTRMARK),
					CODE: SOFTONE_MTRMARK.toString(),
					NAME: data.name,
					ISACTIVE: 1
				},
				status: true,
				minValueOrder: data.minValueOrder,
				minItemsOrder: data.minItemsOrder,
				minYearPurchases: data.minYearPurchases,
			}
	
			await connectMongo();
			const newMarkes = await Markes.create({...object});

			if (!newMarkes) return res.status(200).json({ success: false, markes: null, error: 'Αποτυχία εισαγωγής στη βάση δεδομένων' });
			return res.status(200).json({ success: true, markes: newMarkes, error: null });


		} catch (e) {
			return res.status(400).json({ success: false, error: 'Aποτυχία εισαγωγής', markes: null });
		}
			
			
		
	}
	if (action === 'createMany') {
		let { data } = req.body
		let {createdFrom} = req.body
		let newArray = [];
		for (let item of data) {
			const object = {
				name: item.NAME,
				description: '',
				logo: '',
				videoPromoList: [
					{
						name: '',
						videoPromoUrl: ''
					}
				],
				photoPromoList: [{
					name: '',
					photosPromoUrl: ''
				}],
				pimAccess: {
					pimUrl: '',
					pimUserName: '',
					pimPassword: ''
				},
				webSiteUrl: '',
				officialCatalogueUrl: '',
				facebookUrl: '',
				instagramUrl: '',
				softOne: {
					...item
				},
				status: true,
				createdFrom: createdFrom
			}

			newArray.push(object)
		}




		try {
			await connectMongo();
			const newMarkes = await Markes.insertMany(newArray);
			if (newMarkes) {
				return res.status(200).json({ success: true, result: newMarkes });

			} else {
				return res.status(200).json({ success: false, result: null });
			}
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}


	}

	if (action === 'update') {
	
		let mtrmark = req.body.mtrmark;
		let body = req.body.data;
		let id = req.body.id

		if(req.body.data?.name) {
			let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.mtrMark/updateMtrMark`;
			let softoneResponse = await axios.post(URL, {
				username: 'Service',
				password: 'Service',
				company: '1001',
				sodtype: '51',
				mtrmark: mtrmark,
				name: body.softOne.NAME
			})
		}
		
		try {
			await connectMongo();
			const result = await Markes.updateOne(
				{_id: id},
				{$set: {
					description: body.description,
					updatedFrom: body.updatedFrom,
					videoPromoList: body.videoPromoList,
					photosPromoList: body.photosPromoList,
					pimAccess: {
						pimUrl: body.pimUrl,
						pimUserName: body.pimUserName,
						pimPassword: body.pimPassword
					},
					webSiteUrl: body.webSiteUrl,
					officialCatalogueUrl: body.officialCatalogueUrl,
					facebookUrl: body.facebookUrl,
					instagramUrl: body.instagramUrl,
					softOne: {
						COMPANY: '1001',
						SODTYPE: '51',
						MTRMARK: parseInt(body.softOne.MTRMARK),
						CODE: body.softOne.CODE,
						NAME: body.softOne.NAME,
						ISACTIVE: 1
					},	

				}}
			);
			
			return res.status(200).json({ success: true, result: result });
		} catch (error) {
			return res.status(500).json({ success: false, error: 'Aποτυχία εισαγωγής', markes: null });
		}
    

	}

	if (action === 'delete') {
		await connectMongo();

		let id = req.body.id;
	
		const filter = { _id: id };
		const update = { $set: {
			status: false
		} };
		try {
			await connectMongo();
			const result = await Markes.updateOne(filter, update);
			return res.status(200).json({ success: true, result: result });
		} catch (error) {
			return res.status(500).json({ success: false, error: 'Aποτυχία εισαγωγής', result: null});
		}
	}

	if (action === "addImages") {
        const { imagesURL, id } = req.body;


        try {
            await connectMongo();


            const updatedProduct = await Markes.findOneAndUpdate(
                { _id: id }, // Using the passed 'id' variable
                {
                    $addToSet: { images: { $each: imagesURL } } // Push only the new URLs
                },
                { new: true } // To return the updated document
            );
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ success: false, result: null });
        }



    }

    if (action === 'getImages') {
        const { id } = req.body;

        await connectMongo()
        try {
            let result = await Markes.findOne({ _id: id }, { images: 1 });
            return res.status(200).json({ message: "success", result: result?.images })
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }

    }
    if (action === "deleteImage") {
        const {parentId, imageId, name } = req.body;
        try {
            await connectMongo();
            const updatedProduct = await Markes.findOneAndUpdate(
                { _id: parentId }, // Using the passed 'id' variable
                {
                    $pull: {
                        images: { 
                            _id:  imageId,
                            name: name }
                    }
                },// Push only the new URLs
                { new: true } // To return the updated document
            );
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(400).json({ success: false, result: null });
        }
    }
	if(action === "getLogo") {
		const {id} = req.body;
	
		try {
			await connectMongo();
			let response =  await Markes.findOne({_id: id}, {logo: 1});
		
			return res.status(200).json({success: true, result: response.logo});
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}
	}
	if(action === "addLogo") {
		const {id, logo} = req.body;
	
		try {
			await connectMongo();
			const updatedProduct = await Markes.findOneAndUpdate(
				{ _id: id }, // Using the passed 'id' variable
				{
					$set: { logo: logo } // Push only the new URLs
				},
				{ new: true } // To return the updated document
			);
			return res.status(200).json({ success: true });
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}
	}

	if(action === 'deleteLogo') {
		const {id} = req.body;
		
		try {
			await connectMongo();
			let deleted = await  Markes.findOneAndUpdate(
				{_id: id},
				{$set : {
					logo: ''
				}}	
			  	);

			return res.status(200).json({ success: true, result: deleted  });
		} catch (e) {	
			return res.status(400).json({ success: false, result: null });
		}
	} 

	if(action === 'saveCatalog') {
        const {catalogName, id} = req.body;
  
		const now = new Date();
        const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
        try {
            await connectMongo();
            let result = await  Markes.findOneAndUpdate({_id: id}, {
                $set: {
                    catalogName: catalogName,
					catalogDate: formattedDateTime
                }   
            })
			let catalogUpdate = await Catalogs.create({
				
			})
            return res.status(200).json({ success: true, result: result })
        } catch (e) {
            return res.status(400).json({ success: false })
        }
    }

	if(action === "findBrandName") {
		await connectMongo();
		const {limit, skip, searchBrand} = req.body;
		try {
			let searchParams;
			if(searchBrand !== '') {
				let regexSearchTerm = new RegExp("^" + searchBrand, 'i');
				searchParams = {'softOne.NAME': regexSearchTerm }
			}
			
			let result = await Markes.find(searchParams, {'softOne.NAME': 1}).skip(skip).limit(limit);
			let totalRecords = await Markes.countDocuments();
		
			return res.status(200).json({ success: true, result: result, totalRecords: totalRecords });
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}
	}

	if(action === "relateBrandsToSupplier") {
		const {supplierID, brands} = req.body;
		await connectMongo();
		let brandIds = brands.map(brand => brand._id);
		try {
			let updateSuppler = await Supplier.updateOne(
				{
				_id: supplierID}
				, 
				{$addToSet: {brands:brandIds }}
			);
			
			for(let brand of brands) {
				let updateBrand = await Markes.findOneAndUpdate(
					{_id: brand._id}, 
					{$set: {supplier: supplierID}},
				
				);
			
				
			}
			
			return res.status(200).json({ success: true, result: 'ok' });
		} catch (e) {
			return res.status(400).json({ success: false, result: null, error: 'Πρόβλημα με την προσθήκη' });
		}


		

	}

	if(action === 'findCatalogs') {
		await connectMongo();
		const {limit, skip} = req.body;
		try {
			let result = await Markes.find({
				catalogName: {$ne: null}
			}, 
			{'catalogName': 1, 'catalogDate': 1, softOne:1})
			.skip(skip).limit(limit);
		
			let totalRecords = await Markes.countDocuments();
			return res.status(200).json({ success: true, result: result, totalRecords: totalRecords });
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}
	}

	if(action === "deleteCatalog") {
		await connectMongo();
		const {id} = req.body;
		try {
			let result = await Markes.findOneAndUpdate(
				{_id: id},
				{$set: {
					catalogName: null,
					catalogDate: null
				}}
			)
			
			return res.status(200).json({ success: true, result: result });
		} catch (e) {
			return res.status(400).json({ success: false, result: null });
		}
	}


}



