'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';
import axios from 'axios';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { FormTitle, Divider, Container } from '@/componentsStyles/dialogforms';

import { useSession } from "next-auth/react"
import PrimeSelect from '@/components/Forms/PrimeSelect';
import PrimeInputNumber from '@/components/Forms/PrimeInputNumber';



const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { data: session, status } = useSession()
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)
 
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: gridRowData
    });

    useEffect(() => {
        reset({ ...gridRowData });
    }, [gridRowData, reset]);
    
 
   
    const handleEdit = async (data) => {
        let user = session.user.user.lastName;
         console.log(data)
   
        try {
            await axios.post('/api/suppliers', {action: "updateOne", data: data, user: user})
            setSubmitted(true)
            hideDialog()
            showSuccess('Η εγγραφή ενημερώθηκε')
        } catch (e) {
            showError()
            hideDialog()
        }
       
       
    }

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 4000 });
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
                    header= "Διόρθωση Προμηθευτή"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                   <FormTitle>Λεπτομέριες</FormTitle>
                   <Input
                   label={'Όνομα'}
                   name={'NAME'}
                   control={control}
                   required
               />
                   <Input
                   label={'ΑΦΜ'}
                   name={'AFM'}
                   control={control}
               />
                   <Input
                   label={'Διεύθυνση'}
                   name={'ADDRESS'}
                   control={control}
               />
               
                   <Input
                   label={'T.K'}
                   name={'ZIP'}
                   control={control}
               />
               
                   <Input
                   label={'Τηλέφωνο'}
                   name={'PHONE01'}
                   control={control}
               />
                   <Input
                   label={'Τηλέφωνο 2'}
                   name={'PHONE02'}
                   control={control}
               />
                   <Input
                   label={'Εmail'}
                   name={'EMAIL'}
                   control={control}
                />
                
               
              
                </Dialog>
            </form>
        </Container>

    )
}




const addSchema = yup.object().shape({
    NAME: yup.string().required('Το όνομα είναι υποχρεωτικό'),
    AFM: yup.string().required('Το ΑΦΜ είναι υποχρεωτικό'),
    TRDCATEGORY: yup.string().required('Ο τύπος προμηθευτή είναι υποχρεωτικός'),
    code: yup.number('Ο κωδικός πρέπει να είναι αριθμός')
    .required('Ο κωδικός είναι υποχρεωτικός')
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
        reset
    } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
            NAME: '',
            PHONE01: '',
            PHONE02: '',
            EMAIL: '',
            ADDRESS: '',
            ZIP: '',
            AFM: '',
            TRDCATEGORY: null,
            code: null,
        }
    });
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)
    const [trdCategories, setTrdCategories] = useState(null)
    const cancel = () => {
        hideDialog()
        reset()
    }


    //Fetch the options for the first select. When we add a new supplier the TYPE of supplier is required in the form:
    const handleFetchTRDCATEGORIES = async () => {
        const {data} = await axios.post('/api/suppliers', {
            action: 'getTRDCATEGORIES'
        })
        setTrdCategories(data.result)

    }
    useEffect(() => {
        handleFetchTRDCATEGORIES();
    }, [])

    const handleAdd = async (data) => {
        console.log(data)
        // try {
        //     let res = await axios.post('/api/suppliers', { action: 'create', data: data })
        //     console.log(res.data)
        //     setSubmitted(true)
        //     hideDialog()
        //     showSuccess('Επιτυχής εισαγωγή στην βάση')
        //     reset();

        // } catch (e) {
        //     showError
        //     hideDialog()
        // }
       
    }



    const productDialogFooter = (
        <>
            <Button label="Ακύρωση" icon="pi pi-times" outlined onClick={cancel} />
            <Button label="Αποθήκευση" icon="pi pi-check" type="submit" onClick={handleSubmit(handleAdd)} disabled={disabled} />
        </>
    );

    const showSuccess = (detail) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: detail, life: 4000 });
    }
    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης : ' + message, life: 5000 });
    }

   
    return (
        <form noValidate onSubmit={handleSubmit(handleAdd)}>
            <Toast ref={toast} />
            <Dialog
                visible={dialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Προσθήκη Προμηθευτή"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}>
                <PrimeSelect 
                    label={'Τύπος Προμηθευτή'}
                    name={'TRDCATEGORY'}
                    options={trdCategories}
                    optionLabel={'NAME'}
                    optionValue={'TRDCATEGORY'}
                    control={control}
                    required
                    error={errors.TRDCATEGORY}
                />
                 <Input
                   label={'Όνομα'}
                   name={'NAME'}
                   control={control}
                   required
                   error={errors.NAME}
               />
                   <Input
                   label={'ΑΦΜ'}
                   name={'AFM'}
                   control={control}
                   required
                   error={errors.AFM}
               />
                   <Input
                   label={'Διεύθυνση'}
                   name={'ADDRESS'}
                   control={control}
               />
                   <Input
                   label={'code'}
                   name={'Κωδικός'}
                   control={control}
                   required
                   error={errors.code}
               />
                   <Input
                   label={'T.K'}
                   name={'ZIP'}
                   control={control}
               />
               
                   <Input
                   label={'Τηλέφωνο'}
                   name={'PHONE01'}
                   control={control}
               />
                   <Input
                   label={'Τηλέφωνο 2'}
                   name={'PHONE02'}
                   control={control}
               />
                   <Input
                   label={'Εmail'}
                   name={'EMAIL'}
                   control={control}
                />
                  
            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
