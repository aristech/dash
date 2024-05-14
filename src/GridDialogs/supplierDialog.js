'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';
import axios from 'axios';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {  useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { FormTitle,Container } from '@/componentsStyles/dialogforms';
import { useSession } from "next-auth/react"
import PrimeSelect from '@/components/Forms/PrimeSelect';
import { Dropdown } from 'primereact/dropdown';

const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { data: session, status } = useSession()
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)

    const [selectState, setSelectState] = useState({
        countryOptions: [],
        country: ""
    })
    const { control, handleSubmit, formState: { errors }, reset,  setValue } = useForm({
        defaultValues: gridRowData
    });

    useEffect(() => {
        reset({ ...gridRowData });
    }, [gridRowData, reset]);
    
    const handleFetchData = async () => {
        const {data} = await axios.post('/api/suppliers', { action: 'getCountries' })
        setSelectState(prev => ({ ...prev, countryOptions: data.result }))
    }

    useEffect(() => {
        handleFetchData();
    }, [])

   
    useEffect(() => {
        let value = selectState.countryOptions.find(option => option.COUNTRY == gridRowData.COUNTRY)
        setSelectState(prev => ({ ...prev, country: value }))
    }, [selectState.countryOptions])


    const handleEdit = async (data) => {
        let user = session.user.user.lastName;
        
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


    const handleCountryChange = (e) => {
        setSelectState(prev => ({ ...prev, country: e.target.value }))
        setValue('COUNTRY', e.target.value.COUNTRY)
    }
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
                    <label className='mb-2 block'>Χώρα</label>
                   <Dropdown  
                    className='mb-2'
                     value={selectState.country} 
                     onChange={ handleCountryChange} 
                     options={selectState.countryOptions} 
                     optionLabel="NAME"
                   />
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
                   <Input
                   label={'Ελάχιστη Ποσότητα Παραγγελία'}
                   name={'minOrderValue'}
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
    CODE: yup.string().required('Ο κωδικός είναι υποχρεωτικός'),
    minOrderValue: yup.number().required('Η ελάχιστη ποσότητα παραγγελίας είναι υποχρεωτική')
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
            EMAILACC: '',
            ZIP: '',
            AFM: '',
            TRDCATEGORY: '',
            COUNTRY: '',
            CODE: '',
            minOrderValue: '',
            IRSDATA: '',
            JOBTYPETRD: '',
            WEBPAGE: ''
        }
    });
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)
    const [trdCategories, setTrdCategories] = useState(null)
    const [countries, setCountries] = useState(null)



    const cancel = () => {
        hideDialog()
        reset()
    }


  

   


    const handleFetchData = () => {
        const categories = axios.post('/api/suppliers', { action: 'getTRDCATEGORIES' })
        const countries = axios.post('/api/suppliers', { action: 'getCountries' })
        Promise.all([categories, countries]).then((res) => {
            setTrdCategories(res[0].data.result)
            setCountries(res[1].data.result)
        })
    }

    useEffect(() => {
        handleFetchData();
    }, [])



    const handleAdd = async (data) => {
        let obj = {
            ...data,
            COUNTRY: parseInt(data.COUNTRY.COUNTRY),
            SOCURRENCY: parseInt(data.COUNTRY.SOCURRENCY),
            sodtype: 12,
            company: 1001,
        }
        try {
            let res = await axios.post('/api/suppliers', { action: 'create', data: obj })
            if(!res.data.success) {
                showError(res.data.message)
            } else {
                showSuccess(res.data.message)
            }
            setSubmitted(true)
            hideDialog()
            reset();

        } catch (e) {
            showError(e)
            hideDialog()
        }
       
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
                <PrimeSelect 
                    label={'Χώρα'}
                    name={'COUNTRY'}
                    options={countries}
                    optionLabel={'NAME'}
                    control={control}
                    required
                    // error={errors.TRDCATEGORY}
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
                   label={'Κωδικός Προμηθευτή'}
                   name={'CODE'}
                   control={control}
                   required
               />
                   <Input
                   label={'Ελάχιστη Ποσότητα Παραγγελίας'}
                   name={'minOrderValue'}
                   control={control}
                   required
                   error={errors.minOrderValue}
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
                   <Input
                   label={'Εmailcc'}
                   name={'EMAILACC'}
                   control={control}
                />
                   <Input
                   label={'IRSDATA'}
                   name={'IRSDATA'}
                   control={control}
                />
                   <Input
                   label={'Τύπος Εργασίας'}
                   name={'JOBTYPETRD'}
                   control={control}
                />
                   <Input
                   label={'Ιστοσελίδα'}
                   name={'WEBPAGE'}
                   control={control}
                />
                  
            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
