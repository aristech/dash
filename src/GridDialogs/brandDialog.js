'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';
import { AddMoreInput } from '@/components/Forms/PrimeAddMultiple';
import axios from 'axios';

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { FormTitle, Divider, Container } from '@/componentsStyles/dialogforms';
import { TextAreaInput } from '@/components/Forms/PrimeInput';
import { useSession } from "next-auth/react"
import SingleImageUpload from '@/components/bunnyUpload/FileUpload';

const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { gridRowData } = useSelector(store => store.grid)
    const { data: session } = useSession()
    

    const toast = useRef(null);
    const { control, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: gridRowData });
    const [videoList, setVideoList] = useState(gridRowData?.videoPromoList)



    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({ ...gridRowData });
    }, [gridRowData, reset]);


    useEffect(() => {
        setVideoList(gridRowData?.videoPromoList)
        //handle images:
     
        //In the database empty logo is saved as an empty string, so we need to convert it to an empty array
    }, [gridRowData])


    const handleEdit = async (data) => {

      
        const object = {
            ...data,
            videoPromoList: videoList,
        
        }

        try {
            let user = session.user.user.lastName
            console.log(user)
            let resp = await axios.post('/api/product/apiMarkes', { action: "update", data: { ...object, updatedFrom: user, }, id: gridRowData._id, mtrmark: gridRowData?.softOne?.MTRMARK })
            if (!resp.data.success) {
                return showError(resp.data.softoneError)
            }
            showSuccess()
            setSubmitted(prev => !prev)
            hideDialog()


        } catch (e) {
            console.log(e)
        }
    }

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Επιτυχής ενημέρωση στην βάση', life: 4000 });
    }
    const showError = () => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης', life: 4000 });
    }


    const handleClose = () => {
        hideDialog()
    }


    const productDialogFooter = (
        <React.Fragment>
            <Button label="Ακύρωση" icon="pi pi-times" severity="info" outlined onClick={handleClose} />
            <Button label="Αποθήκευση" icon="pi pi-check" severity="info" onClick={handleSubmit(handleEdit)} />
        </React.Fragment>
    );

    return (
        < Container>
            <form >
                <Toast ref={toast} />
                <Dialog
                    visible={dialog}
                    style={{ width: '32rem', maxWidth: '80rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Τροποποίηση Mάρκας"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >

                    <Input
                        label={'Όνομα'}
                        name={'softOne.NAME'}
                        control={control}
                        required
                    />

                    <TextAreaInput
                        autoResize={true}
                        label={'Περιγραφή'}
                        name={'description'}
                        control={control}
                    />

                  
                  
                    <div>
                        <FormTitle>Εικονίδιο</FormTitle>
                        <UploadLogo id={gridRowData._id} />
                    </div>

                    < Divider />
                    <FormTitle>Βίντεο</FormTitle>
                    <AddMoreInput
                        setFormData={setVideoList}
                        formData={videoList}
                        mb={'30px'}
                    />
                    < Divider />
                    <FormTitle>Pim Access:</FormTitle>
                    <Input
                        label={'Pim url:'}
                        name={'pimAccess.pimUrl'}
                        required={true}
                        control={control}
                    />
                    <Input
                        label={'Pim url:'}
                        name={'pimAccess.pimUserName'}
                        required={true}
                        control={control}
                    />
                    <Input
                        label={'Pim url:'}
                        name={'pimAccess.pimPassword'}
                        required={true}
                        control={control}
                    />
                    < Divider />
                    <FormTitle>Url</FormTitle>
                    <Input
                        label={'Url Ιστοσελίδας:'}
                        name={'websSiteUrl'}
                        required={true}
                        control={control}
                    />
                    <Input
                        label={'Url Καταλόγου:'}
                        name={'officialCatalogueUrl'}
                        required={true}
                        control={control}
                    />
                    <Input
                        label={'Url Facebook:'}
                        name={'facebookUrl'}
                        required={true}
                        control={control}
                    />
                    <Input
                        label={'Url Instagram:'}
                        name={'instagramUrl'}
                        required={true}
                        control={control}
                    />
                </Dialog>
            </form>
        </Container>

    )
}




const UploadLogo = ({ id }) => {
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [refetch, setRefetch] = useState(false)
    const [data, setData] = useState(false)
   
    const onAdd = async () => {
        let { data } = await axios.post('/api/product/apiMarkes', { action: 'addLogo', logo: uploadedFiles[0].name, id: id })
        console.log('data ------------')
        console.log(data)
        console.log('refetch')
        console.log(refetch)
        setRefetch(prev => !prev)
        return data;
    }

    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiMarkes', { action: 'getLogo', id: id })
        console.log('data ------------')
        console.log(data)
        setData(data.result)

    }
    const onDelete = async (name) => {
        let { data } = await axios.post('/api/product/apiMarkes', { action: 'deleteLogo', id: id })

        setRefetch(prev => !prev)
    }

    useEffect(() => {
        handleFetch()
    }, [refetch, id])
    return (
        <div>
            <SingleImageUpload
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                visible={visible}
                data={data}
                setVisible={setVisible}
                onAdd={onAdd}
                onDelete={onDelete}

            />
        </div>

    )
}



const addSchema = yup.object().shape({
    name: yup.string().required('Συμπληρώστε το όνομα'),
    TRDCATEGORY: yup.string().required('Συμπληρώστε την κατηγορία'),
});


const AddDialog = ({
    dialog,
    hideDialog,
    setSubmitted
}) => {


    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        reset
    } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
            name: '',
            description: '',
            pimUrl: '',
            pimUserName: '',
            pimPassword: '',
            webSiteUrl: '',
            officialCatalogueUrl: '',
            facebookUrl: '',
            instagramUrl: '',
            TRDCATEGORY: null,
        }
    });
    const { data: session, status } = useSession()
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)
    const [logo, setLogo] = useState('')
    const [images, setImages] = useState([])
    const [videoList, setVideoList] = useState([{
        name: '',
        videoUrl: ''
    }])


    const cancel = () => {
        hideDialog()
        reset()
    }


    const handleAdd = async (data) => {
        setDisabled(false)
        let dataImages = []
        for (let i of images) {
            dataImages.push({
                name: i,
                photosPromoUrl: i
            })
        }
        const body = {
            ...data,
            photosPromoList: dataImages,
            videoPromoList: videoList,
            logo: logo[0],
        }

        let createdFrom = session.user.user.lastName
        let res = await axios.post('/api/product/apiMarkes', { action: 'create', data: body, createdFrom: createdFrom })
        if (!res.data.success) return showError(res.data.softoneError)
        setDisabled(true)
        setSubmitted(true)
        showSuccess()
        hideDialog()
        reset();
    }



    const productDialogFooter = (
        <>
            <Button label="Ακύρωση" icon="pi pi-times" outlined onClick={cancel} />
            <Button label="Αποθήκευση" icon="pi pi-check" type="submit" onClick={handleSubmit(handleAdd)} disabled={disabled} />
        </>
    );

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Επιτυχής ενημέρωση στην βάση', life: 4000 });
    }
    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης : ' + message, life: 5000 });
    }

   
    return (
        <form noValidate onSubmit={handleSubmit(handleAdd)}>
            <Toast ref={toast} />

            <Dialog
                style={{ width: '40vw' }}
                visible={dialog}
                // breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Προσθήκη Μάρκας"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}
            >
                <FormTitle>Λεπτομέρειες</FormTitle>
              
                <Input
                    label={'Όνομα'}
                    name={'name'}
                    mb={'10px'}
                    required
                    control={control}
                    error={errors.name}
                />

                <Input
                    label={'Περιγραφή'}
                    name={'description'}
                    mb={'20px'}
                    control={control}
                />

                <FormTitle>Βίντεο</FormTitle>
                <AddMoreInput
                    setFormData={setVideoList}
                    formData={videoList}
                    mb={'20px'}
                />
             
            
                <FormTitle>Pim Access</FormTitle>
                <Input
                    label={'Pim URL'}
                    name={'pimURL'}
                    control={control}
                />
                <Input
                    label={'Pim Username'}
                    name={'pimUserName'}
                    control={control}
                />
                <Input
                    label={'Pim Password'}
                    name={'pimPassword'}
                    control={control}
                />
                <FormTitle>Urls:</FormTitle>
                <Input
                    label={'URL Ιστοσελίδας'}
                    name={'webSiteUrl'}
                    control={control}
                />
                <Input
                    label={'URL Kαταλόγου'}
                    name={'officialCatalogueUrl'}
                    control={control}
                />
                <Input
                    label={'URL facebook'}
                    name={'facebookUrl'}
                    control={control}
                />
                <Input
                    label={'URL instagram'}
                    name={'instagramUrl'}
                    control={control}
                />

            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
