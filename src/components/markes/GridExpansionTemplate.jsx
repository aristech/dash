import React, { useEffect, useState } from 'react'
import { TabView, TabPanel } from 'primereact/tabview';
import Gallery from '@/components/Gallery';
import { DisabledDisplay } from '@/componentsStyles/grid';
import { InputTextarea } from 'primereact/inputtextarea';
import UrlInput from '@/components/Forms/PrimeUrlInput';

import { Button } from 'primereact/button';

import { InputText } from 'primereact/inputtext';
import axios from 'axios';
import { ImageGrid } from '@/components/bunnyUpload/ImageGrid';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';

const GridExpansionTemplate = ({ data, setSubmitted }) => {
    
    let mtrmark = data?.softOne.MTRMARK
    let newArray = []
    for (let image of data.photosPromoList) {
        newArray.push(image.photosPromoUrl)
    }

    return (
        < >
            <div className="card p-20">
                <TabView>
                    <TabPanel header="Φωτογραφίες">
                        <TopLayer />
                    </TabPanel>
                    <TabPanel header="Βίντεο">
                        < DisabledDisplay  >
                            {data?.videoPromoList?.map((video, index) => {
                                return (
                                    <UrlInput
                                        key={index}
                                        label={video.name}
                                        value={video.videoUrl}
                                    />
                                )
                            })}
                        </ DisabledDisplay  >

                    </TabPanel>
                    <TabPanel header="Λεπτομέρειες">
                        < DisabledDisplay  >
                            <div className="disabled-card">
                                <label>
                                    Περιγραφή
                                </label>
                                <InputTextarea autoResize disabled value={data.description} />
                            </div>
                            <div className="disabled-card">
                                <label>
                                    Pim Username
                                </label>
                                <InputText disabled value={data?.pimAccess?.pimUserName} />
                            </div>
                            <UrlInput
                                label={'URL Iστοσελίδας'}
                                value={data.webSiteUrl}
                            />
                            <UrlInput
                                label={'URL Ιnstagram'}
                                value={data.instagramUrl}
                            />
                            <UrlInput
                                label={'URL Facebook'}
                                value={data.facebookUrl}
                            />
                            <UrlInput
                                label={'URL Pim'}
                                value={data?.pimAccess?.pimUrl}
                            />


                        </DisabledDisplay>

                    </TabPanel>
                </TabView>
            </div>
        </ >
    );
}




const TopLayer = () => {
    const router = useRouter();
    const { id } = router.query;
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [data, setData] = useState([])
    const [refetch, setRefetch] = useState(false)

    const createImagesURL =  (files) => {
        let imagesNames = [];
        for (let file of files) {
            imagesNames.push({name: file.name})
        }
        return imagesNames;
    }



    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiProduct', { action: "getImages", id: id })
        let images = data.result
        setData(images)
    }

    const onDelete = async (name, _id) => {
        //THis is not the product id but the image id
        let { data } = await axios.post('/api/product/apiProduct', { action: "deleteImage", parentId:id, imageId :_id, name: name })
        setRefetch(prev => !prev)
    }

    const onAdd = async () => {
        let imagesURL = createImagesURL(uploadedFiles)
        let { data } = await axios.post('/api/product/apiProduct', { action: 'addImages', id: id, imagesURL: imagesURL})
         setRefetch(prev => !prev)
        return data;
    }


    useEffect(() => {
        handleFetch()
    }, [id, refetch])
    return (
        <div className='p-4 '>
              <ImageGrid
            data={data}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            onDelete={onDelete}
            onAdd={onAdd}
            
        />
        </div>
      
    )
}








export default GridExpansionTemplate