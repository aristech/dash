"use client";
import React, {useEffect, useRef} from "react";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import Input from "@/components/Forms/PrimeInput";
import {TextAreaInput} from "@/components/Forms/PrimeInput";
import axios from "axios";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useDispatch, useSelector} from "react-redux";
import {Toast} from "primereact/toast";
import {Container} from "@/componentsStyles/dialogforms";
import {TranslateInput} from "@/components/Forms/TranslateInput";
import {setSubmitted} from "@/features/productsSlice";
import PrimeInputNumber from "@/components/Forms/PrimeInputNumber";
import DropdownCountries from "@/components/Forms/DropdownCountries";
import DropdownVat from "@/components/Forms/DropdownVat";
import DropdownCategories from "@/components/Forms/DropdownCategories";
import DropdownGroups from "@/components/Forms/DropdownGroups";
import DropdownSubroups from "@/components/Forms/DropdownSubgroups";
import DropdownManufacturers from "@/components/Forms/DrodownManufactures";
import DropdownBrands from "@/components/Forms/DropdownBrands";
import DropdownIntrastat from "@/components/Forms/DropdownIntrastat";
import PrimeSelect from "@/components/Forms/PrimeSelect";


const addSchema = yup.object().shape({
    NAME: yup.string().required("Συμπληρώστε το όνομα"),
    PRICER: yup
        .number()
        .typeError("Πρέπει να είναι αριθμός")
        .required("Συμπληρώστε την τιμή λιανικής"),
    // MTRCATEGORY: yup.object().required("Συμπληρώστε την κατηγορία"),
    // MTRGROUP: yup.object().required("Συμπληρώστε την ομάδα"),
    // CCCSUBGROUP2: yup.object().required("Συμπληρώστε την υποομάδα"),
});

const defaultValues = {
    NAME: "",
    NAME_ENG: "",
    DESCRIPTION: "",
    DESCRIPTION_ENG: "",
    //DROPDOWNS:
    MTRCATEGORY: null,
    MTRGROUP: null,
    CCCSUBGROUP2: null,
    MTRMANFCTR: null,
    MTRMARK: null,
    INTRASTAT: null,
    //CODES:
    CODE: "",
    CODE1: "",
    CODE2: "",
    //PRICES:
    PRICER: null,
    PRICEW: null,
    PRICER02: null,
    COST: null,
    //DIMENSIONS:
    WIDTH: null,
    LENGTH: null,
    HEIGHT: null,
    GWEIGHT: null,
    VOLUME: null,
    //AVAILABILITY:
    DIATHESIMA: null,
    SEPARAGELIA: null,
    DESVMEVMENA: null,
    //BOOLEANS:
    isSkroutz: null,

};

export const ProductDialog = ({dialog, hideDialog, isEdit, data}) => {
    const dispatch = useDispatch();
    const methods = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: defaultValues,
    });
    const {
        handleSubmit,
        formState: {errors},
        reset,
        setValue,
    } = methods;
    const values = methods.watch();
    const toast = useRef(null);

    useEffect(() => {
        
        if (!isEdit) {
            reset(defaultValues);
        }
    }, [])

    useEffect(() => {
      
        if (isEdit && data) {
            reset({
                ...data,
                DIATHESIMA: data?.availability?.DIATHESIMA,
                SEPARAGELIA: data?.availability?.SEPARAGELIA,
                DESVMEVMENA: data?.availability?.DESVMEVMENA,
            });
        }
    }, [data, reset])


    const showSuccess = (message) => {
        toast.current.show({
            severity: "success",
            summary: "Eπιτυχία",
            detail: message,
            life: 4000,
        });
    };
    const showError = (message) => {
        toast.current.show({
            severity: "error",
            summary: "Aποτυχία",
            detail: message,
            life: 4000,
        });
    };

    const handleClose = () => {
        hideDialog();
    };


    const handleSubmitForm = async (data) => {
       
        try {
            let res = await axios.post("/api/product/apiProduct", {
                action: !isEdit ? "create" : "update",
                data: data,
            });
            console.log({res})
            if (!res.data.success) {
                showError(res.data.message);
                return;
            }
            showSuccess(res.data.message);
            hideDialog();
            dispatch(setSubmitted());
            reset();
        } catch (e) {
            showError(e.response.data.message);
            return;
        }
    };

    const productDialogFooter = (
        <React.Fragment>
            <Button
                label="Ακύρωση"
                icon="pi pi-times"
                severity="info"
                outlined
                onClick={handleClose}
            />
            <Button
                label="Αποθήκευση"
                icon="pi pi-check"
                severity="info"
                onClick={handleSubmit(handleSubmitForm)}
            />
        </React.Fragment>
    );

    const handleTranslate = (value, name) => {
        setValue(name, value);
    };
    const handleInputChange = (value, name) => {
        setValue(name, value);
    };

    const handleCategoryClear = () => {
        setValue("MTRCATEGORY", null);
        setValue("MTRGROUP", null);
        setValue("CCCSUBGROUP2")
    }
    const handleGroupClear = () => {
        setValue("MTRGROUP", null)
        setValue("CCCSUBGROUP2", null)
    }
    const handleSubgroupClear = () => {
        setValue("CCCSUBGROUP2", null)
    }

    return (
        <div className="dialog_container">
            <Toast ref={toast}/>
            <Dialog
                visible={dialog}
                style={{width: "34rem", minHeight: "40vh"}}
                header={isEdit ? "Τροποποίηση Προϊόντος" : "Προσθήκη Προϊόντος"}
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}
                maximizable
            >
                <form className="form" noValidate onSubmit={handleSubmit(handleSubmitForm)}>
                    <Input
                        label={"Όνομα"}
                        name={"NAME"}
                        control={methods.control}
                        required
                        error={errors.NAME}
                    />
                    <TranslateInput
                        state={values.NAME_ENG}
                        textArea={false}
                        handleState={handleTranslate}
                        name="NAME_ENG"
                        label={"Όνομα Αγγλικά"}
                        targetLang="en-GB"
                    />
                    <p className="mt-2 font-bold text-lg">Κατηγοριοποίηση</p>
                    <DropdownCategories
                        isEdit={isEdit}
                        state={values.MTRCATEGORY}
                        handleState={(e) => handleInputChange(e, "MTRCATEGORY")}
                        error={errors?.MTRCATEGORY?.message}
                        handleClear={handleCategoryClear}
                    />
                    <DropdownGroups
                        isEdit={isEdit}
                        state={values.MTRGROUP}
                        handleState={(e) => handleInputChange(e, "MTRGROUP")}
                        error={errors?.MTRGROUP?.message}
                        categoryId={values?.MTRCATEGORY?.softOne?.MTRCATEGORY}
                        handleClear={handleGroupClear}
                    />
                    <DropdownSubroups
                        isEdit={isEdit}
                        state={values.CCCSUBGROUP2}
                        handleState={(e) => handleInputChange(e, "CCCSUBGROUP2")}
                        error={errors?.CCCSUBGROUP2?.message}
                        groupId={values?.MTRGROUP?.softOne?.MTRGROUP}
                        categoryId={values?.MTRCATEGORY?.softOne?.MTRCATEGORY}
                        handleClear={handleSubgroupClear}
                       
                    />
                    <DropdownManufacturers
                        isEdit={isEdit}
                        state={values.MTRMANFCTR}
                        handleState={(e) => handleInputChange(e, "MTRMANFCTR")}
                        error={errors?.MTRMANFCTR}
                    />
                    <DropdownBrands
                        isEdit={isEdit}
                        state={values.MTRMARK}
                        handleState={(e) => handleInputChange(e, "MTRMARK")}
                        error={errors?.MTRMARK}
                    />
                    <DropdownIntrastat
                        isEdit={isEdit}
                        state={values.INTRASTAT}
                        handleState={(e) => handleInputChange(e, "INTRASTAT")}
                        error={errors?.INTRASTAT}
                    />
                    <p className="mt-2 font-bold text-lg">Περιγραφές</p>
                    <TextAreaInput
                        label={"Περιγραφή Ελληνική"}
                        name={"DESCRIPTION"}
                        control={methods.control}
                        required
                        error={errors.DESCRIPTION}
                    />
                    <TranslateInput
                        state={values.DESCRIPTION_ENG}
                        textArea={true}
                        handleState={handleTranslate}
                        name="DESCRIPTION_ENG"
                        label={"Περιγραφή Αγγλική"}
                        targetLang="en-GB"
                    />
                    <DropdownVat
                        isEdit={isEdit}
                        state={values.VAT}
                        handleState={(e) => handleInputChange(e, "VAT")}
                        error={errors?.VAT?.NAME.message}
                    />
                    <DropdownCountries
                        isEdit={isEdit}
                        state={values.COUNTRY}
                        handleState={(e) => handleInputChange(e, "COUNTRY")}
                        error={errors?.COUNTRY?.NAME.message}
                    />

                    <p className="mt-2 font-bold text-lg">Κωδικοί</p>
                    <div className="product_form_grid_row">
                        <Input
                            label={"Κωδικός ERP"}
                            name={"CODE"}
                            control={methods.control}
                            required
                            error={errors.CODE}
                        />
                        <Input
                            label={"Κωδικός Εργοστασίου"}
                            name={"CODE2"}
                            control={methods.control}
                            required
                            error={errors.CODE2}
                        />
                    </div>
                    <Input
                        label={"Κωδικός ΕΑΝ"}
                        name={"CODE1"}
                        control={methods.control}
                        required
                        error={errors.CODE1}
                    />
                    <p className="mt-2 font-bold text-lg">Τιμές</p>
                    <div className="product_form_grid_row">
                        <PrimeInputNumber
                            label={"Τιμή Λιανικής"}
                            name={"PRICER"}
                            prefix={"€"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors.PRICER}
                        />

                        <PrimeInputNumber
                            label={"Τιμή Χονδρικής"}
                            name={"PRICEW"}
                            prefix={"€"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors.PRICEW}
                        />
                        <PrimeInputNumber
                            label={"Τιμή Skroutz"}
                            name={"PRICER02"}
                            prefix={"€"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors.PRICE02}
                        />
                    </div>
                    <p className="mt-2 font-bold text-lg">Πληροφορίες</p>
                    <div className="product_form_grid_row">
                        <PrimeInputNumber
                            label={"Πλάτος"}
                            name={"WIDTH"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors.WIDTH}
                        />

                        <PrimeInputNumber
                            label={"Πλάτος"}
                            name={"LENGTH"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors.LENGTH}
                        />
                    </div>
                    <div className="product_form_grid_row">
                        <PrimeInputNumber
                            label={"Ύψος"}
                            name={"HEIGHT"}
                            control={methods.control}
                            required
                            error={errors.HEIGHT}
                        />
                        <PrimeInputNumber
                            label={"GWEIGHT"}
                            name={"GWEIGHT"}
                            control={methods.control}
                            required
                            error={errors.GWEIGHT}
                        />
                        <PrimeInputNumber
                            label={"Όγκος"}
                            name={"VOLUME"}
                            control={methods.control}
                            required
                            error={errors.VOLUME}
                        />
                    </div>

                    <p className="mt-2 font-bold text-lg">Διαθεσιμότητα</p>

                    <div className="product_form_grid_row">
                        <PrimeInputNumber
                            label={"Διαθέσιμα"}
                            name={"DIATHESIMA"}
                            control={methods.control}
                            required
                            disabled={isEdit}
                            error={errors.DIATHESIMA}
                        />
                        <PrimeInputNumber
                            label={"Σε παραγγελία"}
                            name={"SEPARAGELIA"}
                            disabled={isEdit}
                            control={methods.control}
                            required
                            error={errors.SEPARAGELIA}
                        />
                        <PrimeInputNumber
                            label={"Δεσμευμένα"}
                            name={"DESVMEVMENA"}
                            disabled={isEdit}
                            control={methods.control}
                            required
                            error={errors.DESVMEVMENA}
                        />
                    </div>
                    <PrimeSelect
                        options={
                            [
                                {label: "Είναι στο Skroutz", value: true},
                                {label: "Δεν είναι στο Skroutz", value: false}
                            ]
                        }
                        label="Στο Skroutz"
                        name="isSkroutz"
                        optionLabel={"label"}
                        optionValue={"value"}
                        control={methods.control}
                    />
                    <PrimeSelect
                        options={
                            [
                                {label: "Ενεργό Προϊόν", value: true},
                                {label: "Ανενεργό Προϊόν", value: false}
                            ]
                        }
                        label="Κατάσταση Προϊόντος"
                        name="ISACTIVE"
                        optionLabel={"label"}
                        optionValue={"value"}
                        control={methods.control}
                    />

                </form>
            </Dialog>
        </div>
    );
};

