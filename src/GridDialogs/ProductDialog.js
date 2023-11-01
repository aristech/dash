'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Input from '@/components/Forms/PrimeInput';
import { TextAreaInput } from '@/components/Forms/PrimeInput';
import axios from 'axios';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import { FormTitle, Divider, Container } from '@/componentsStyles/dialogforms';
import { Dropdown } from 'primereact/dropdown';
import { useSession } from "next-auth/react"
import TranslateInput from '@/components/Forms/TranslateInpit';

const addSchema = yup.object().shape({
    // name: yup.string().required('Συμπληρώστε το όνομα'),
    cost: yup.number()
});



const EditDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const { data: session, status } = useSession()
    const [tranlateBtn, setTranslateBtn] = useState(false)
    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)
    const [selectState, setSelectState] = useState({
        category: null,
        group: null,
        subgroup: null,
        vat: null,
    })
    const [descriptions, setDescriptions] = useState(
        {
            de: '',
            en: '',
            es: '',
            fr: '',
        }
    )
       
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: gridRowData
    });

   
    const handleEnglish = async (value) => {
        setDescriptions({ ...descriptions, en: value })
    }
   


    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({ ...gridRowData });
     
        setDescriptions(prev => {
            return {
                de: gridRowData?.descriptions?.de,
                en: gridRowData?.descriptions?.en,
                es: gridRowData?.descriptions?.es,
                fr: gridRowData?.descriptions?.fr,

            }
        })
        setSelectState({
            category: {categoryName: gridRowData?.CATEGORY_NAME , softOne: {MTRCATEGORY: gridRowData?.MTRCATEGORY}},
            group: {groupName: gridRowData?.GROUP_NAME , softOne: {MTRGROUP: gridRowData?.MTRGROUP}},
            subgroup: {subGroupName: gridRowData?.SUBGROUP_NAME , softOne: {cccSubgroup2: gridRowData?.CCCSUBGOUP2}},
            vat: {VAT: gridRowData?.VAT},
           
        })
    }, [gridRowData, reset]);

    



    const handleEdit = async (data) => {
        let user = session.user.user.lastName
        console.log('dataa')
        console.log(data)

        try {
            let resp = await axios.post('/api/product/apiProduct', {
                action: "update",
                data: {
                    ...data,
                    descriptions: descriptions,
                    ...selectState

                },
            })
            console.log(resp.data)
            if (!resp.data.success) {
                showError(resp.data?.error)
                return;
            }
            setSubmitted(true)
            hideDialog()
            showSuccess('Η εγγραφή ενημερώθηκε')

        } catch (e) {
            showError("Αποτυχία. Προσπαθήστε ξανά")
        }

    }

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 4000 });
    }
    const showError = (error) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 4000 });
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
                    header="Τροποποίηση Κατασκευαστή"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >   
                 <Categories
                        state={selectState.category}
                        setState={setSelectState}
                    />
                    <Groups
                        state={selectState.group}
                        setState={setSelectState}
                        id={selectState.category?.softOne?.MTRCATEGORY}
                    />
                    <SubGroups
                        state={selectState.subgroup}
                        setState={setSelectState}
                        id={selectState.group?.softOne?.MTRGROUP}
                    />
                    <OptionsVat
                        state={selectState.vat}
                        setState={setSelectState}
                    />
                    <FormTitle>Λεπτομέριες</FormTitle>
                    <Input
                        label={"Όνομα"}
                        name={'NAME'}
                        control={control}
                        required
                    //    error={errors.NAME}
                    />
                    <TextAreaInput
                        autoResize={true}
                        label={'Ελληνική Περιγραφή'}
                        name={'DESCRIPTION'}
                        control={control}
                    />
                    <Input
                        label={'Κωδικός ΕΑΝ'}
                        name={'CODE'}
                        control={control}
                    //    error={errors.NAME}
                    />
                    <Input
                        label={'Τιμή Κόστους'}
                        name={'COST'}
                        control={control}
                        error={errors.cost}
                    />

                    <Input
                        label={'Κωδικός εργοστασίου'}
                        name={'CODE1'}
                        control={control}
                    />
                    <Input
                        label={'Κωδικός 2'}
                        name={'CODE2'}
                        control={control}
                    />
                 
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ'}
                        name={'PRICER'}
                        control={control}
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 01'}
                        name={'PRICER01'}
                        control={control}
                    />
                       <Input
                        label={'Τιμή Scroutz'}
                        name={'PRICE05'}
                        control={control}
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 02'}
                        name={'PRICER02'}
                        control={control}
                       
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 03'}
                        name={'PRICER03'}
                        control={control}
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 04'}
                        name={'PRICER04'}
                        control={control}
                    />
                    <Input
                        label={'Τιμή ΑΠΟΘΗΚΗΣ'}
                        name={'PRICEW'}
                        control={control}
                    />
                 
                    <FormTitle>ΜΕΤΑΦΡΑΣΕΙΣ ΠΕΡΙΓΡΑΦΗ:</FormTitle>
                    <Button label="Eμφάνιση" severity="secondary" className='mb-2' onClick={() => setTranslateBtn(prev => !prev)} />
                    {tranlateBtn ? (
                        <>
                            <TranslateInput
                                label={'Περιγραφή Aγγλική'}
                                state={descriptions.en}
                                handleState={handleEnglish}
                                targetLang="en-GB"
                            />
                        </>
                    ) : null}
                </Dialog>
            </form>
        </Container>

    )
}




const AddDialog = ({ dialog, hideDialog, setSubmitted }) => {
    const [translateBtn, setTranslateBtn] = useState(false)
    const [showInputs, setShowInputs] = useState(false)
    const [selectState, setSelectState] = useState({
        category: null,
        group: null,
        subgroup: null,
    })


    const { control, formState: { errors }, handleSubmit, reset } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
           descriptions: {
                en: '',
           },
           NAME: '',
            DESCRIPTION: '',
            CODE: '',
            CODE1: '',
            CODE2: '',
            VAT: '',
            PRICER: '',
            PRICER01: '',
            PRICER02: '',
            PRICER03: '',
            PRICER04: '',
            PRICEW: '',
            PRICE05: '',
            COST: 0,
        }
    });


    const toast = useRef(null);
    const { gridRowData } = useSelector(store => store.grid)
    const [descriptions, setDescriptions] = useState(
        {
            en: '',
        }
    )

  

    useEffect(() => {
        reset();
    }, [reset]);


    useEffect(() => {
        if(selectState.category && selectState.group ) setShowInputs(true)
        else setShowInputs(false)
    }, [selectState])

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 4000 });
    }
    const showError = () => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης', life: 4000 });
    }


    const handleClose = () => {
        hideDialog()
    }

    const handleAdd = async (data) => {
        
        let obj = {
            MTRCATEGORY: selectState.category?.softOne?.MTRCATEGORY,
            CATEGORY_NAME: selectState.category?.categoryName,
            MTRGROUP: selectState.group?.softOne?.MTRGROUP,
            GROUP_NAME: selectState.group?.groupName,
            CCCSUBGROUP2: selectState.subgroup?.softOne?.cccSubgroup2,
            SUBGROUP_NAME: selectState.subgroup?.subGroupName,
            descriptions: descriptions,
        }
        let res = await axios.post('/api/product/apiProduct', {
            action: 'create',
            data: {
                ...data,
                ...obj,
            }
        })
        hideDialog()
        reset();
    }
    const productDialogFooter = (
        <React.Fragment>
            <Button label="Ακύρωση" icon="pi pi-times" severity="info" outlined onClick={handleClose} />
            <Button label="Αποθήκευση" icon="pi pi-check" severity="info" onClick={handleSubmit(handleAdd)} />
        </React.Fragment>
    );



    const handleGerman = async (value) => {
        setDescriptions({ ...descriptions, de: value })
    }
    const handleEnglish = async (value) => {
        setDescriptions({ ...descriptions, en: value })
    }
    const handleSpanish = async (value) => {
        setDescriptions({ ...descriptions, es: value })
    }
   

  

    return (
        < Container>
            <form noValidate onSubmit={handleSubmit(handleAdd)} >
                <Toast ref={toast} />
                <Dialog
                    visible={dialog}
                    style={{ width: '40rem', maxWidth: '80rem', minHeight: '40vh' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header="Προσθήκη Προϊόντος"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <Categories
                        state={selectState.category}
                        setState={setSelectState}
                    />
                    <Groups
                        state={selectState.group}
                        setState={setSelectState}
                        id={selectState.category?.softOne?.MTRCATEGORY}
                    />
                    <SubGroups
                        state={selectState.subgroup}
                        setState={setSelectState}
                        id={selectState.group?.softOne?.MTRGROUP}
                    />
                     <div>
                  {showInputs ? (
                        <div>
                                 <Input
                        label={"Όνομα"}
                        name={'NAME'}
                        control={control}
                        required
                    />
                    <TextAreaInput
                        autoResize={true}
                        label={'Ελληνική Περιγραφή'}
                        name={'DESCRIPTION'}
                        control={control}
                    />
                    <Input
                        label={'Κωδικός ΕΑΝ'}
                        name={'CODE'}
                        control={control}
                        required
                    //    error={errors.NAME}
                    />
                      <Input
                        label={'Τιμή Κόστους'}
                        name={'COST'}
                        control={control}
                        required
                       error={errors.cost}
                    />


                    <Input
                        label={'Κωδικός εργοστασίου'}
                        name={'CODE1'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Κωδικός 2'}
                        name={'CODE2'}
                        control={control}
                        required
                    />
                    <Input
                        label={'VAT'}
                        name={'VAT'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ'}
                        name={'PRICER'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 01'}
                        name={'PRICER01'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 02'}
                        name={'PRICER02'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 03'}
                        name={'PRICER03'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΛΙΑΝΙΚΗΣ 04'}
                        name={'PRICER04'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή ΑΠΟΘΗΚΗΣ'}
                        name={'PRICEW'}
                        control={control}
                        required
                    />
                    <Input
                        label={'Τιμή Scroutz'}
                        name={'PRICE05'}
                        control={control}
                        required
                    />
                    <FormTitle>ΜΕΤΑΦΡΑΣΕΙΣ ΠΕΡΙΓΡΑΦΗ:</FormTitle>
                    <Button label="Eμφάνιση" severity="secondary" className='mb-2' onClick={() => setTranslateBtn(prev => !prev)} />
                    {translateBtn ? (
                        <>
                           
                            <TranslateInput
                                label={'Περιγραφή Aγγλική'}
                                state={descriptions.en}
                                handleState={handleEnglish}
                                targetLang="en-GB"
                            />
                        </>
                    ) : null}
                        </div>
                    ) : null}
            </div>
               
                </Dialog>
            </form>
        </Container>

    )
}




const Categories = ({ state, setState }) => {
    const [options, setOptions] = useState([])
    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiProductFilters', { action: 'findCategories' })
        setOptions(data.result)
    }
    useEffect(() => {
        handleFetch();
    }, [])


    return (
        <div className="card mb-3">
            <span className='mb-2 block'>Επιλογή Ομάδας</span>
            <div className='flex align-items-center'>
                <Dropdown value={state} onChange={(e) => setState((prev) => ({ ...prev, category: e.value }))} options={options} optionLabel="categoryName"
                    placeholder="Κατηγορία" className="w-full" />
            </div>


        </div>
    )
}




const Groups = ({ state, setState, id }) => {
    const [groupOptions, setGroupOptions] = useState([])

    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiProductFilters', {
            action: 'findGroups',
            categoryID: id
        })
        setGroupOptions(data.result)
    }
    useEffect(() => {
        handleFetch();
    }, [id])

    return (
        <div className="card mb-3">
            <span className='mb-2 block'>Επιλογή Ομάδας</span>
            <Dropdown value={state} onChange={(e) => setState((prev) => ({ ...prev, group: e.value }))} options={groupOptions} optionLabel="groupName"
                placeholder="Κατηγορία" className="w-full" />
        </div>
    )
}
const SubGroups = ({ state, setState, id }) => {
    const [subgroupOptions, setsubGroupOptions] = useState([])
    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiProductFilters', {
            action: 'findSubGroups',
            groupID: id
        })
       
        setsubGroupOptions(data.result)
    }
    useEffect(() => {
        handleFetch();
    }, [id])

    return (
        <div className="card mb-3">
            <span className='mb-2 block'>Επιλογή Υποομάδας</span>
            <Dropdown value={state} onChange={(e) => setState(prev => ({ ...prev, subgroup: e.value }))} options={subgroupOptions} optionLabel="subGroupName"
                placeholder="Κατηγορία" className="w-full" />
        </div>
    )
}
const OptionsVat = ({ state, setState}) => {
    const [vatOptions, setVatOptions] = useState([])
    const [data, setData] = useState([])

    const VatTemplate = ((option) => {
        for(let item of data) {
            if(item.VAT === option.VAT) {
                return (
                    <p>{option.VAT + " -- " +  item.NAME}</p>
                )
            }
        }
      
        return (
            <div className="flex align-items-center">
                <div>{option.VAT}</div>
            </div>
        );
    })

    
    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiProductFilters', {
            action: 'findVats',
        })
        let newArray = [];
        for(let item of data.result) {
            newArray.push({VAT: item.VAT})
        }   
        setData(data.result)
        setVatOptions(newArray)
    }
    useEffect(() => {
        handleFetch();
    }, [])

    return (
        <div className="card mb-3">
            <span className='mb-2 block'>Aλλαγή ΦΠΑ</span>

            <Dropdown  itemTemplate={VatTemplate} value={state} onChange={(e) => setState(prev => ({ ...prev, vat: e.value }))} options={vatOptions} optionLabel="VAT"
                placeholder="ΦΠΑ" className="w-full" />
        </div>
    )
}

export { EditDialog, AddDialog }
