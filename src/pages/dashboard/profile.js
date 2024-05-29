
'use client';
import React, { useEffect, useState, useRef } from 'react'
import Input from '@/components/Forms/PrimeInput';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

//Form inmports:
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from 'react-hook-form';
//Rest imports:
import AdminLayout from '@/layouts/Admin/AdminLayout';

import axios from 'axios';
import { FormTitle, Container } from '@/componentsStyles/dialogforms';
import { useSession } from 'next-auth/react';
import { Avatar } from 'primereact/avatar';

const registerSchema = yup.object().shape({
    firstName: yup.string().required('Συμπληρώστε το όνομα'),
    lastName: yup.string().required('Συμπληρώστε το επώνυμο'),
    email: yup.string().required('Συμπληρώστε το email').email('Λάθος format email'),
    password: yup.string().required('Συμπληρώστε τον κωδικό').min(5, 'Tουλάχιστον 5 χαρακτήρες').max(15, 'Μέχρι 15 χαρακτήρες'),
});



const Profile = () => {
    const toast = useRef(null);
    const [details, setDetails] = useState(false);
    const { data: session, update } = useSession();
    const [disabled, setDisabled] = useState(true);
    let user = session?.user?.user;


    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            user
        }
    });


    useEffect(() => {
        reset({ ...user });
    }, [user, reset]);



    const onSubmit = async (data) => {
        console.log('why')
        console.log(data)
        let res = await update({
            ...session,
            user: {
                ...data,
                user: {
                    ...data
                }
            }
        })
        try {
            let resp = await axios.post('/api/user/apiUser',
                {
                    action: "update",
                    data: { ...data },
                    id: user._id
                })


        } catch (e) {
            console.log(e)
        }
        setDisabled(true)
    }



    return (
        <AdminLayout >
            <div className='shadow-1 bg-white p-4 border-round'>
                <form noValidate onSubmit={handleSubmit(onSubmit)} >
                    <Toast ref={toast} />
                    <div className='flex justify-content-between'>
                        <div className='mb-5 flex align-items-center'>
                            <Avatar icon={"pi pi-user"} shape="circle" />
                            <div className='ml-2 '>
                                <span className="font-semibold block">{user?.firstName}</span>
                                <span className="text-sm block">{user?.email}</span>
                            </div>
                        </div>
                        <div >
                            <span
                                className="text-sm block bg-green-400 p-2  border-round 	text-white	">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                    <Input
                        label={'Όνομα'}
                        name={'firstName'}
                        mb={'10px'}
                        required
                        disabled={disabled}
                        control={control}
                    />
                    <Input
                        label={'Eπώνυμο'}
                        name={'lastName'}
                        mb={'10px'}
                        required
                        disabled={disabled}
                        control={control}
                    />
                    <Input
                        label={'Εmail'}
                        name={'email'}
                        mb={'10px'}
                        required
                        disabled={disabled}
                        control={control}
                    />

                    <Button
                        onClick={() => setDetails(prev => !prev)}
                        outlined
                        className='w-9rem mt-4 bg-white'
                        size='small'
                        label="Λεπτομέρειες"
                        icon="pi pi-angle-down"
                        severity="secondary"
                        iconPos="right" />
                    {details ? (
                        <div>
                            <FormTitle>Διεύθυνση</FormTitle>
                            <div className='grid'>
                                <div className='col-6'>
                                    <Input
                                        label={'Χώρα'}
                                        name={'address.country'}
                                        control={control}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Input
                                        label={'Διεύθυνση'}
                                        name={'address.address'}
                                        control={control}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Input
                                        label={'Πόλη'}
                                        name={'address.city'}
                                        control={control}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Input
                                        label={'Τ.Κ.'}
                                        name={'address.postalcode'}
                                        control={control}
                                        disabled={disabled}
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
                                        disabled={disabled}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Input
                                        label={'Κινητό'}
                                        name={'phones.landline'}
                                        control={control}
                                        disabled={disabled}
                                    />
                                </div>

                            </div>
                        </div>
                    ) : null}

                </form>
                <div className='mt-4 border-top-1 pt-4 border-300'>
                    <Button style={{ width: '40px', height: '40px' }} icon="pi pi-pencil" onClick={() => setDisabled(prev => !prev)} />

                   {!disabled ? (
                     <Button
                     onClick={handleSubmit(onSubmit)}
                     className='ml-2'
                     type='submit'
                     label="Αποθήκευση"
                     severity="info"
                     style={{ height: '40px' }} />
                   ) : null}
                </div>

            </div>

        </AdminLayout>
    )
}







export default Profile