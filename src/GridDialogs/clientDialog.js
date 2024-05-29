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
import { Dropdown } from 'primereact/dropdown';




const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { data: session, status } = useSession()
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)

    const [selectState, setSelectState] = useState({
        countryOptions: [],
        country: ""
    })
    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
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
        // let user = session.user.user.lastName;
        console.log(data)

        try {
            await axios.post('/api/clients/apiClients', { action: "updateOne", data: data })
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

    const handleCountryChange = (e) => {
        setSelectState(prev => ({ ...prev, country: e.target.value }))
        setValue('COUNTRY', e.target.value.COUNTRY)
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
                    header="Τροποποίηση Mάρκας Πελάτη"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <FormTitle>Λεπτομέρειες</FormTitle>
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
                        label={'DIASCODE'}
                        name={'DIASCODE'}
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
    code: yup.string().required('Ο κωδικός είναι υποχρεωτικός'),
    COUNTRY: yup.object().required('Η χώρα είναι υποχρεωτική'),
});
const AddDialog = ({
    dialog,
    hideDialog,
    setSubmitted
}) => {
    const [countries, setCountries] = useState(null)

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
            DIASCODE: '',
            COUNTRY: '',
            code: '',
        }
    });
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)

    const cancel = () => {
        hideDialog()
        reset()
    }

    const handleAdd = async (data) => {
        try {
            let res = await axios.post('/api/clients/apiClients', { action: 'addClient', data: data })
            if (!res.data.success) {
                showError(res.data.message)
            }
            else {
                showSuccess(res.data.message)
                hideDialog()
                setSubmitted(true)
                reset();
            }
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

    const handleFetchData = async () => {
        const countries = await axios.post('/api/suppliers', { action: 'getCountries' })
        setCountries(countries.data.result)
    }

    useEffect(() => {
        handleFetchData();
    }, [])


    return (
        <form noValidate onSubmit={handleSubmit(handleAdd)}>
            <Toast ref={toast} />
            <Dialog
                visible={dialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Προσθήκη Πελάτη"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}>
                <PrimeSelect
                    label={'Χώρα'}
                    name={'COUNTRY'}
                    options={countries}
                    optionLabel={'NAME'}
                    control={control}
                    required
                    error={errors.COUNTRY}
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
                    label={'Κωδικός Πελάτη'}
                    name={'code'}
                    control={control}
                    required
                    error={errors.code}
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
                {/* <Input
                   label={'DIASCODE'}
                   name={'DIASCODE'}
                   control={control}
                /> */}
            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
