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
import { FormTitle, Container } from '@/componentsStyles/dialogforms';

import { PrimeInputPass } from '@/components/Forms/PrimeInputPassword';
import PrimeSelect from '@/components/Forms/PrimeSelect';
import { useSession } from "next-auth/react"




const addSchema = yup.object().shape({
    lastName: yup.string().required('Συμπληρώστε το επώνυμο'),
    email: yup.string().email('Λάθος format email').required('Συμπληρώστε το email'),
    password: yup.string().required('Συμπληρώστε τον κωδικό'),
    role: yup.string().required('Συμπληρώστε τα δικαιώματα χρήστη'),
});




const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {

    const [showDetails, setShowDetails] = useState(false)
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)
    const { data: session, status } = useSession()

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            mobile: '',
            landline: '',
            country: '',
            address: '',
            city: '',
            postalcode: '',
        }
    });


    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({ ...gridRowData });
    }, [gridRowData, reset]);




    const handleEdit = async (data) => {
        console.log('edit data');
        console.log(data)

        try {
            const updatedFrom = session.user.user.lastName
            let resp = await axios.post('/api/user/apiUser',
                {
                    action: "update",
                    data: { ...data, updatedFrom: updatedFrom },
                    id: gridRowData._id
                })

            if (!resp.data.success) showError(resp.data.error)
            showSuccess()
            setSubmitted(true)
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
                    header="Τροποποίηση Xρήστη"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >

                    <Input
                        label={'Όνομα'}
                        name={'firstName'}
                        mb={'10px'}
                        required
                        control={control}
                    />
                    <Input
                        label={'Eπώνυμο'}
                        name={'lastName'}
                        mb={'10px'}
                        required
                        control={control}
                    />
                    <Input
                        label={'Εmail'}
                        name={'email'}
                        mb={'10px'}
                        required
                        control={control}
                    />
                   
                 
                    <PrimeSelect
                        control={control}
                        name="role"
                        required
                        label={'Δικαιώματα Χρήστη'}
                        options={[
                            { role: 'user' },
                            { role: 'employee' },
                            { role: 'manager' },
                            { role: 'admin' },
                        ]}
                        optionLabel={'role'}
                        placeholder='label'
                        optionValue={'role'}

                    />
                     <Input
                        label={'Νέος Κωδικός'}
                        name={'newPassword'}
                        mb={'10px'}
                        required
                        control={control}
                    />

                        <Button 
                            onClick={() => setShowDetails(prev => !prev)} 
                            outlined  
                            className='min-w-min w-4 mt-4' 
                            size='small' 
                            label="Λεπτομέρειες" 
                            icon="pi pi-angle-down" 
                            severity="secondary"
                            iconPos="right" />
                {showDetails ? (
                    <div>
                        <FormTitle>Διεύθυνση</FormTitle>
                        <div className='grid'>
                            <div className='col-6'>
                                <Input
                                    label={'Χώρα'}
                                    name={'address.country'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Διεύθυνση'}	
                                    name={'address.address'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Πόλη'}	
                                    name={'address.city'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Τ.Κ.'}	
                                    name={'address.postalcode'}
                                    control={control}
                                />
                            </div>
                       
                         
                        </div>
                        <FormTitle>Τηλέφωνα</FormTitle>
                        <div className='grid'>
                            <div className='col-6'>
                                <Input
                                    label={'Κινητό'}
                                    name={'phones.mobile'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Κινητό'}
                                    name={'phones.landline'}
                                    control={control}
                                />
                            </div>

                        </div>
                    </div>
                ) : null}
                </Dialog>
            </form>
        </Container>

    )
}




const AddDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const [showDetails, setShowDetails] = useState(false)
    const {
        control,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: '',
            address: {
                country: '',
                address: '',
                city: '',
                postalcode: '',
            },
            phones: {
                mobile: '',
                landline: ''
            }
        }
    });

    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)


    const cancel = () => {
        hideDialog()
        reset()
    }


    const handleAdd = async (data) => {
        console.log('data')
        console.log(data)
        setDisabled(false)
        let resp = await axios.post('/api/user/apiUser', { action: 'create', data: data })
        if (!resp.data.success) return showError(resp.data.error)
        setDisabled(true)
        setSubmitted(true)
        showSuccess()
        hideDialog()
        reset();
    }

    const productDialogFooter = (
        <div >
            <Button label="Ακύρωση" icon="pi pi-times" outlined onClick={cancel} />
            <Button label="Αποθήκευση" icon="pi pi-check" type="submit" onClick={handleSubmit(handleAdd)} disabled={disabled} />
        </div>
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
                visible={dialog}
                style={{ width: '32rem' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header="Προσθήκη Χρήστη"
                modal
                maximizable
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}>

                <Input
                    label={'Όνομα'}
                    name={'firstName'}
                    mb={'10px'}
                    required
                    control={control}
                    error={errors.firstName}
                />
                <Input
                    label={'Eπώνυμο'}
                    name={'lastName'}
                    mb={'10px'}
                    required
                    control={control}
                    error={errors.lastName}
                />
                <Input
                    label={'Εmail'}
                    name={'email'}
                    mb={'10px'}
                    required
                    control={control}
                    error={errors.email}
                />
                <PrimeInputPass
                    control={control}
                    name="password"
                    label={'Κωδικός'}
                    error={errors.password}
                />

                <PrimeSelect
                    control={control}
                    name="role"
                    required
                    label={'Δικαιώματα Χρήστη'}
                    options={[
                        { role: 'user' },
                        { role: 'employee' },
                        { role: 'manager' },
                        { role: 'admin' },
                    ]}
                    optionLabel={'role'}
                    placeholder=''
                    optionValue={'role'}
                    error={errors.role}
                />

                <Button 
                    onClick={() => setShowDetails(prev => !prev)}   
                    severity="secondary" 
                    outlined 
                    className='min-w-min w-4 mt-4' 
                    size='small' 
                    label="Λεπτομέρειες" 
                    icon="pi pi-angle-down" 
                    iconPos="right" />
                {showDetails ? (
                    <div>
                        <FormTitle>Διεύθυνση</FormTitle>
                        <div className='grid'>
                            <div className='col-6'>
                                <Input
                                    label={'Χώρα'}
                                    name={'address.country'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Διεύθυνση'}	
                                    name={'address.address'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Πόλη'}	
                                    name={'address.city'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Τ.Κ.'}	
                                    name={'address.postalcode'}
                                    control={control}
                                />
                            </div>
                       
                         
                        </div>
                        <FormTitle>Τηλέφωνα</FormTitle>
                        <div className='grid'>
                            <div className='col-6'>
                                <Input
                                    label={'Κινητό'}
                                    name={'phones.mobile'}
                                    control={control}
                                />
                            </div>
                            <div className='col-6'>
                                <Input
                                    label={'Κινητό'}
                                    name={'phones.landline'}
                                    control={control}
                                />
                            </div>

                        </div>
                    </div>
                ) : null}
            </Dialog>
        </form>
    )

}





export { EditDialog, AddDialog }
