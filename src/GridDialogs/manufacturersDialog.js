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


const addSchema = yup.object().shape({
    // subGroupName: yup.string().required('Συμπληρώστε το όνομα'),
    NAME: yup.string().required('To όνομα είναι υποχρεωτικό'),
});


const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { data: session, status } = useSession()
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)
 
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: gridRowData
    });



    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({ ...gridRowData });
    }, [gridRowData, reset]);
    
 


   
   
    const handleEdit = async (data) => {
        let user = session.user.user.lastName
       
        const object = {
            action: "update", 
            NAME: data.NAME,
            MTRMANFCTR: gridRowData.MTRMANFCTR,
            id: gridRowData._id, 
            updatedFrom: user
        }

        try {
            let resp = await axios.post('/api/product/apiManufacturers', object)
            setSubmitted((prev) => !prev)
            if(!resp.data.success) return showError()
            hideDialog()
            showSuccess('Η εγγραφή ενημερώθηκε')
               
        } catch (e) {
            console.log(e)
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
                    header= "Τροποποίηση  Κατασκευαστή"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                   <FormTitle>Λεπτομέρειες</FormTitle>
              
                   <Input
                   label={'Όνομα Kατασκευαστή'}
                   name={'NAME'}
                   control={control}
                   required
                   error={errors.NAME}
               />
              
                </Dialog>
            </form>
        </Container>

    )
}





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
        }
    });
    const { data: session } = useSession()
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)
   
   
   
    const cancel = () => {
        hideDialog()
        reset()
    }

   
  


    const handleAdd = async (data) => {
     
        let user = session.user.user.lastName
        const body ={
            ...data,
            createdFrom: user
        }
        console.log('body: ' + JSON.stringify(body))

        let res = await axios.post('/api/product/apiManufacturers', { action: 'create', data: body })
        console.log(res.data)
        if(!res.data.success) return showError(res.data.error)
        // let parent = res.data.parent
        setDisabled(true)
        setSubmitted(true)
        showSuccess('Επιτυχής εισαγωγή στην βάση')
        hideDialog()
        reset();
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
                header="Προσθήκη Κατασκευαστή"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}>
                <FormTitle>Λεπτομέριες</FormTitle>
                <Input
                    label={'Όνομα Kατασκευαστή'}
                    name={'NAME'}
                    control={control}
                    required
                    error={errors.NAME}
                />
            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
