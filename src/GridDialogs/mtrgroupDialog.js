'use client'
import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'primereact/button';
import {Dialog} from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';
import axios from 'axios';
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSelector} from 'react-redux';
import {Toast} from 'primereact/toast';
import {FormTitle, Container} from '@/componentsStyles/dialogforms';
import {useSession} from "next-auth/react"
import PrimeSelect from '@/components/Forms/PrimeSelect';
import SingleImageUpload from '@/components/bunnyUpload/FileUpload';
import {Dropdown} from 'primereact/dropdown';
import {TranslateInput} from "@/components/Forms/TranslateInput";
import DropdownCategories from "@/components/Forms/DropdownCategories";


//VALIDATION SCHEMA:
const addSchema = yup.object().shape({
    groupName: yup.string().required('Συμπληρώστε το όνομα'),
    // categoryid: yup.string().required('Η Κατηγορία είναι υποχρεωτική'),
});
//DEFAULT VALUES FOR THE FORM:
const DEFAULT_VALUES = {
    groupName: '',
    englishName: '',
    MTRCATEGORY: '',
}

//ADD/EDIT COMPONENT:
export const GroupDialog =
    ({
         isEdit,
         dialog,
         hideDialog,
         setSubmitted
     }) => {
        const session = useSession()
        const {gridRowData} = useSelector(store => store.grid)
        const user = session?.user?.user?.lastName;
        const toast = useRef(null);
        const methods = useForm({
            resolver: yupResolver(addSchema),
            defaultValues: DEFAULT_VALUES
        });
        const {
            control,
            setValue,
            reset,
            handleSubmit,
            formState: {
                errors
            }
        } = methods;
        const values = methods.watch()

        const showSuccess = (message) => {
            toast.current.show({severity: 'success', summary: 'Success', detail: message, life: 6000});
        }
        const showError = (message) => {
            toast.current.show({severity: 'error', summary: 'Error', detail: message, life: 4000});
        }
    
        //RESET VALUES ON EDIT/ADD FORM
        useEffect(() => {
            if (!isEdit) reset(DEFAULT_VALUES)
        }, [])

        useEffect(() => {
            console.log({gridRowData})
            if (isEdit && gridRowData) {
                reset({
                    ...gridRowData,
                    MTRCATEGORY: parseInt(gridRowData?.softOne.MTRCATEGORY),
                })
            }
        }, [gridRowData])

        //HANDLE SUBMIT:

        const handleEdit = async (data) => {
            let _newData = {
                ...data,
                updatedFrom: user,
            }

            try {
                let resp = await axios.post('/api/product/apiGroup',
                    {
                        action: "update",
                        data: _newData,
                        groupid: gridRowData._id,
                        originalCategory: gridRowData?.softOne.MTRCATEGORY,
                        // newCategory: newCategory,
                    })
                setSubmitted(prev => !prev)
                hideDialog()
                showSuccess(resp.data.message)
            } catch (e) {
                showError(e.message)
            }

        }
        const handleAdd = async (data) => {

        }
        const handleSubmitDialog = async (data) => {
            if (isEdit) {
                await handleEdit(data)
            } else {
                await handleAdd(data)
            }
        }

        //HANDLE INPUT CHANGES:
        const handleCategoryChange = (value) => {
            methods.setValue('MTRCATEGORY', value)
        }
        const productDialogFooter = (
            <React.Fragment>
                <Button label="Ακύρωση" icon="pi pi-times" severity="info" outlined onClick={hideDialog}/>
                <Button label="Αποθήκευση" icon="pi pi-check" severity="info"
                        onClick={handleSubmit(handleSubmitDialog)}/>
            </React.Fragment>
        );


        return (
            <div className="dialog_container">
                <Toast ref={toast}/>
                <Dialog
                    visible={dialog}
                    style={{width: '32rem', maxWidth: '80rem'}}
                    breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header={isEdit ? "Διόρθωση Ομάδας" : "Προσθήκη Ομάδας"}
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <form
                        onSubmit={handleSubmit(handleSubmitDialog)}
                        noValidate
                        className="form"
                    >
                        <DropdownCategories
                            isEdit={isEdit}
                            state={values?.MTRCATEGORY}
                            handleState={handleCategoryChange}
                            error={errors?.MTRCATEGORY?.message}
                        />
                        <Input
                            label={'Όνομα Ομάδας'}
                            name={'groupName'}
                            control={control}
                            required
                            error={errors.groupName}
                        />
                        <TranslateInput
                            state={values.englishName}
                            textArea={true}
                            handleState={(value) => setValue('englishName', value)}
                            name="englishName"
                            label={"Όνομα Αγγλικό"}
                            targetLang="en-GB"
                        />


                        {/*<PrimeSelect*/}
                        {/*    control={control}*/}
                        {/*    name="categoryid"*/}
                        {/*    required*/}
                        {/*    label={'Κατηγορία'}*/}
                        {/*    options={parent}*/}
                        {/*    optionLabel={'label'}*/}
                        {/*    optionValue={'value._id'}*/}
                        {/*    placeholder={gridRowData?.category?.categoryName}*/}
                        {/*    error={errors.categoryName}*/}
                        {/*/>*/}
                    </form>
                </Dialog>

            </div>

        )
    }


const EditDialog = ({dialog, hideDialog, setSubmitted}) => {
    const {data: session, status} = useSession()
    const toast = useRef(null);
    const {gridRowData} = useSelector(store => store.grid)
    const [translateName, setTranslateName] = useState('')


    const [parent, setParent] = useState([])
    const {control, handleSubmit, formState: {errors}, reset} = useForm({
        defaultValues: gridRowData
    });

    const handleTranslate = async (value) => {
        setTranslateName(value)
    }

    useEffect(() => {
        reset({...gridRowData});
    }, [gridRowData, reset]);


    useEffect(() => {
        setTranslateName(gridRowData?.englishName)
        const handleFetch = async () => {
            let res = await axios.post('/api/product/apiGroup', {action: 'findCategoriesNames'})
            setParent(res.data.result)

        }
        handleFetch()
        // setCategory({categoryName: gridRowData?.CATEGORY_NAME , softOne: {MTRCATEGORY: gridRowData?.MTRCATEGORY}})

        //In the database empty logo is saved as an empty string, so we need to convert it to an empty array
        // setLogo(gridRowData?.groupIcon ? [gridRowData?.groupIcon] : [])
        // setImage(gridRowData?.groupImage ? [gridRowData?.groupImage] : [])
    }, [gridRowData])


    const handleEdit = async (data) => {
        console.log(translateName)
        const {groupIcon, groupImage, categoryid, ...rest} = data;
        let originalCategory = gridRowData?.category?._id
        let newCategory = categoryid || gridRowData?.category?._id
        let user = session.user.user.lastName
        const object = {...rest, updatedFrom: user, englishName: translateName}

        try {

            let resp = await axios.post('/api/product/apiGroup',
                {
                    action: "update",
                    data: object,
                    groupid: gridRowData._id,
                    originalCategory: originalCategory,
                    newCategory: newCategory,
                })

            setSubmitted(prev => !prev)
            // showSuccess(resp.data.message)
            hideDialog()


        } catch (e) {
            console.log(e)
        }

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
            <Toast ref={toast}/>
            <Dialog
                visible={dialog}
                style={{width: '32rem', maxWidth: '80rem'}}
                breakpoints={{'960px': '75vw', '641px': '90vw'}}
                header="Διόρθωση Ομάδας"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}
                maximizable
            >
                <form>
                    <PrimeSelect
                        control={control}
                        name="categoryid"
                        required
                        label={'Κατηγορία'}
                        options={parent}
                        optionLabel={'label'}
                        optionValue={'value._id'}
                        placeholder={gridRowData?.category?.categoryName}
                        // error={errors.categoryName}
                    />


                    <Input
                        label={'Όνομα Ομάδας'}
                        name={'groupName'}
                        control={control}
                        required
                        // error={errors.categoryName}
                    />
                    <TranslateInput
                        label={'Όνομα κατηγορίας αγγλικά'}
                        state={translateName}
                        handleState={handleTranslate}
                        targetLang="en-GB"
                    />


                    <div>
                        <FormTitle>Φωτογραφίες</FormTitle>
                        <UploadImage id={gridRowData._id} image={gridRowData.groupImage}/>
                    </div>
                    <div>
                        <FormTitle>Λογότυπο</FormTitle>
                        <UploadLogo id={gridRowData._id} image={gridRowData.groupImage}/>
                    </div>
                </form>

            </Dialog>
        </Container>

    )
}


const AddDialog =
    ({
         dialog,
         hideDialog,
         setSubmitted,

     }) => {

        const {
            control,
            formState: {errors},
            handleSubmit,
            reset
        } = useForm({
            resolver: yupResolver(addSchema),
            defaultValues: {
                groupName: '',
                categoryid: '',

            }
        });

        const {data: session, status} = useSession()
        const toast = useRef(null);
        const [disabled, setDisabled] = useState(false)
        const [parent, setParent] = useState([])
        const cancel = () => {
            hideDialog()
            reset()
        }


        useEffect(() => {
            setDisabled(false)
            const handleFetch = async () => {
                let res = await axios.post('/api/product/apiGroup', {action: 'findCategoriesNames'})
                setParent(res.data.result)

            }
            handleFetch()
        }, [])


        const handleAdd = async (data) => {

            let user = session.user.user.lastName
            const body = {
                ...data,
                createdFrom: user
            }


            let res = await axios.post('/api/product/apiGroup', {action: 'create', data: body})
            if (!res.data.success) return showError(res.data.softoneError)
            let parent = res.data.parent
            setDisabled(true)
            setSubmitted(true)
            showSuccess('Επιτυχής εισαγωγή στην βάση')
            showSuccess('Eπιτυχής Update στην Κατηγορία: ' + parent)
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
            <>
                <Toast ref={toast}/>
                <Dialog
                    visible={dialog}
                    style={{width: '32rem'}}
                    breakpoints={{'960px': '75vw', '641px': '90vw'}}
                    header="Προσθήκη Ομάδας"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}>

                    <form className="form" noValidate onSubmit={handleSubmit(handleAdd)}>
                        <FormTitle>Λεπτομέρειες</FormTitle>
                        <PrimeSelect
                            control={control}
                            name="categoryid"
                            required
                            label={'Κατηγορία'}
                            options={parent}
                            optionLabel={'label'}
                            placeholder='Επίλεξε κατηγορία'
                            optionValue={'value._id'}
                            error={errors.categoryName}
                        />
                        <Input
                            toolip="Σε ποιά κατηγορία ανήκει;"
                            label={'Όνομα Κατηγορίας'}
                            name={'groupName'}
                            control={control}
                            required
                            error={errors.groupName}
                        />
                        <TranslateInput
                            // state={values.NAME_ENG}
                            textArea={false}
                            // handleState={handleTranslate}
                            name="NAME_ENG"
                            label={"Όνομα Αγγλικά"}
                            targetLang="en-GB"
                        />
                    </form>
                </Dialog>
            </>

        )

    }

const UploadImage = ({id,}) => {

    console.log(id)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [refetch, setRefetch] = useState(false)
    const [data, setData] = useState(false)

    const onAdd = async () => {
        let {data} = await axios.post('/api/product/apiGroup', {
            action: 'addImage',
            imageName: uploadedFiles[0].name,
            id: id
        })
        console.log(data)
        setRefetch(prev => !prev)
        return data;
    }

    const handleFetch = async () => {
        let {data} = await axios.post('/api/product/apiGroup', {action: 'getImages', id: id})
        setData(data.result.groupImage)
    }
    const onDelete = async () => {
        let {data} = await axios.post('/api/product/apiGroup', {action: 'deleteImage', id: id})
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
        let {data} = await axios.post('/api/product/apiGroup', {
            action: 'addLogo',
            imageName: uploadedFiles[0].name,
            id: id
        })
        setRefetch(prev => !prev)
        return data;
    }

    const handleFetch = async () => {
        let {data} = await axios.post('/api/product/apiGroup', {action: 'getImages', id: id})
        console.log('data')
        console.log(data)
        setData(data.result?.groupIcon)

    }
    const onDelete = async () => {
        let {data} = await axios.post('/api/product/apiGroup', {action: 'deleteLogo', id: id})
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
export const Categories = ({state, setState}) => {
    const [options, setOptions] = useState([])

    const handleFetch = async () => {
        let {data} = await axios.post('/api/product/apiProductFilters', {action: 'findCategories'})
        setOptions(data.result)
    }
    useEffect(() => {
        handleFetch();
    }, [])


    return (
        <div className="card mb-3">
            <span className='mb-2 block'>Επιλογή Kατηγορίας</span>
            <div className='flex align-items-center'>
                <Dropdown value={state} onChange={(e) => setState(e.value)} options={options} optionLabel="categoryName"
                          placeholder="Κατηγορία" className="w-full"/>
            </div>


        </div>
    )
}


export {EditDialog, AddDialog}
