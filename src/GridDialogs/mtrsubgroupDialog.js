'use client'
import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';

import axios from 'axios';
import PrimeUploads from '@/components/Forms/PrimeImagesUpload';
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useDispatch, useSelector} from 'react-redux';
import {Toast} from 'primereact/toast';
import {FormTitle, Container} from '@/componentsStyles/dialogforms';

import {useSession} from "next-auth/react"
import PrimeSelect from '@/components/Forms/PrimeSelect';

import {TranslateInput} from '@/components/Forms/TranslateInput';
import SingleImageUpload from '@/components/bunnyUpload/FileUpload';


const EditDialog = ({dialog, hideDialog, setSubmitted}) => {
    const {data: session, status} = useSession()
    const toast = useRef(null);
    const {gridRowData} = useSelector(store => store.grid)
    //This component has one Image only:
    const [parent, setParent] = useState([])
    const {control, handleSubmit, formState: {errors}, reset} = useForm({
        defaultValues: gridRowData
    });
    const [translateName, setTranslateName] = useState('')

    const handleTranslate = async (value) => {
        setTranslateName(value)
    }


    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({...gridRowData});
    }, [gridRowData, reset]);

    useEffect(() => {
        const handleFetch = async () => {
            let res = await axios.post('/api/product/apiSubGroup', {action: 'findGroupNames'})
            setParent(res.data.result)


        }
        handleFetch()
        setTranslateName(gridRowData?.englishName)
        //In the database empty logo is saved as an empty string, so we need to convert it to an empty array

    }, [gridRowData])


    const handleEdit = async (data) => {
        const {subGroupIcon, subGroupImage, ...rest} = data
        let user = session?.user?.user.lastName
        let originalGroup = gridRowData?.group


        //User hasn't selected a new group, so we keep the original one
        // if(typeof data.categoryid === 'undefined') {
        //     data.groupid = gridRowData?.group
        // } 

        let cccSubgroup2 = gridRowData?.softOne?.cccSubgroup2


        const object = {
            ...rest,
            updatedFrom: user,
            englishName: translateName,
        }
        console.log('object: ' + JSON.stringify(object))

        try {

            let resp = await axios.post('/api/product/apiSubGroup',
                {
                    action: "update",
                    data: object,
                    id: gridRowData._id,
                    cccSubgroup2: cccSubgroup2,
                    originalGroup: originalGroup,
                    originalSubGroupName: gridRowData?.subGroupName
                })
            if (!resp.data.success) {
                return showError()
            }
            setSubmitted(true)
            hideDialog()
            showSuccess('Η εγγραφή ενημερώθηκε')
            // showSuccess(resp.data?.message)


        } catch (e) {
            console.log(e)
        }

    }

    const showSuccess = (message) => {
        toast.current.show({severity: 'success', summary: 'Success', detail: message, life: 5000});
    }
    const showError = () => {
        toast.current.show({severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης', life: 4000});
    }


    const handleClose = () => {
        hideDialog()
    }

    const productDialogFooter = (
        <React.Fragment>
            <Button label="Ακύρωση" icon="pi pi-times" severity="info" outlined onClick={handleClose}/>
            <Button label="Αποθήκευση" icon="pi pi-check" severity="info" onClick={handleSubmit(handleEdit)}/>
        </React.Fragment>
    );

    return (
        < Container>
            <form>
                <Toast ref={toast}/>
                <Dialog
                    visible={dialog}
                    style={{width: '32rem', maxWidth: '80rem'}}
                    breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Τροποποίηση Υποομάδας"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <PrimeSelect
                        control={control}
                        name="groupid"
                        required
                        label={'Ομάδα'}
                        options={parent}
                        optionLabel={'label'}
                        optionValue={'value._id'}
                        placeholder={gridRowData?.group?.groupName}
                    />
                    <Input
                        label={'Όνομα Υποομάδας'}
                        name={'subGroupName'}
                        control={control}
                        required
                    />
                    <TranslateInput
                        label={'Όνομα Υποομάδας Αγγλικά'}
                        state={translateName}
                        handleState={handleTranslate}
                        targetLang="en-GB"
                    />
                    <div>
                        <FormTitle>Φωτογραφία</FormTitle>
                        <UploadImage id={gridRowData._id}/>
                    </div>
                    <div>
                        <FormTitle>Εικονίδιο</FormTitle>
                        <UploadLogo id={gridRowData._id}/>
                    </div>
                </Dialog>
            </form>
        </Container>

    )
}


const addSchema = yup.object().shape({
    groupid: yup.string().required('Η Κατηγορία είναι υποχρεωτική'),
});


const UploadImage = ({id,}) => {
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [refetch, setRefetch] = useState(false)
    const [data, setData] = useState(false)

    const onAdd = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {
            action: 'addImage',
            imageName: uploadedFiles[0].name,
            id: id
        })
        setRefetch(prev => !prev)
        return data;
    }

    const handleFetch = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {action: 'getImages', id: id})
        setData(data.result.subGroupImage)
    }
    const onDelete = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {action: 'deleteImage', id: id})
        setRefetch(prev => !prev)
    }

    useEffect(() => {
        handleFetch()
    }, [refetch])
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
const UploadLogo = ({id}) => {

    const [uploadedFiles, setUploadedFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [refetch, setRefetch] = useState(false)
    const [data, setData] = useState(false)

    const onAdd = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {
            action: 'addLogo',
            imageName: uploadedFiles[0].name,
            id: id
        })
        setRefetch(prev => !prev)
        return data;
    }

    const handleFetch = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {action: 'getImages', id: id})

        setData(data.result?.subGroupIcon)

    }
    const onDelete = async () => {
        let {data} = await axios.post('/api/product/apiSubGroup', {action: 'deleteLogo', id: id})
        setRefetch(prev => !prev)
    }

    useEffect(() => {
        handleFetch()
    }, [refetch])
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


const AddDialog = ({
                       dialog,
                       hideDialog,
                       setSubmitted
                   }) => {


    const {
        control,
        formState: {errors},
        handleSubmit,
        reset
    } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
            subGroupName: '',
            groupid: '',
        }
    });
    const {data: session, status} = useSession()
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false)
    const [logo, setLogo] = useState('')
    const [image, setImage] = useState([])
    const [parent, setParent] = useState([])
    const cancel = () => {
        hideDialog()
        reset()
    }


    useEffect(() => {
        setDisabled(false)
        const handleFetch = async () => {
            let res = await axios.post('/api/product/apiSubGroup', {action: 'findGroupNames'})

            setParent(res.data.result)

        }
        handleFetch()
    }, [])


    const handleAdd = async (data) => {

        let user = session.user.user.lastName
        const body = {
            ...data,
            subGroupIcon: logo[0],
            subGroupImage: image[0],
            createdFrom: user
        }
        console.log('body: ' + JSON.stringify(body))

        let res = await axios.post('/api/product/apiSubGroup', {action: 'create', data: body})
        console.log(res.data)
        if (!res.data.success) return showError(res.data.softoneError)
        // let parent = res.data.parent
        setDisabled(true)
        setSubmitted(true)
        showSuccess('Επιτυχής εισαγωγή στην βάση')
        // showSuccess('Eπιτυχής Update στην Κατηγορία: ' + parent)
        hideDialog()
        reset();
    }


    const productDialogFooter = (
        <>
            <Button label="Ακύρωση" icon="pi pi-times" outlined onClick={cancel}/>
            <Button label="Αποθήκευση" icon="pi pi-check" type="submit" onClick={handleSubmit(handleAdd)}
                    disabled={disabled}/>
        </>
    );

    const showSuccess = (detail) => {
        toast.current.show({severity: 'success', summary: 'Success', detail: detail, life: 4000});
    }
    const showError = (message) => {
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Αποτυχία ενημέρωσης βάσης : ' + message,
            life: 5000
        });
    }

    return (
        <form noValidate onSubmit={handleSubmit(handleAdd)}>
            <Toast ref={toast}/>
            <Dialog
                visible={dialog}
                style={{width: '32rem'}}
                breakpoints={{'960px': '75vw', '641px': '90vw'}}
                header="Προσθήκη Υποομάδας"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}>
                <PrimeSelect
                    control={control}
                    name="groupid"
                    required
                    label={'Eπιλέξτε Ομάδα'}
                    options={parent}
                    optionLabel={'label'}
                    optionValue={'value._id'}
                    error={errors.groupid}
                />
                <Input

                    label={'Όνομα Υποομάδας'}
                    name={'subGroupName'}
                    control={control}
                    required
                />


            </Dialog>
        </form>
    )

}


export {EditDialog, AddDialog}
