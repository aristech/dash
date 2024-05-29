"use client";
import React, {useState, useEffect, useRef} from "react";
import {Button} from "primereact/button";
import {Dialog} from "primereact/dialog";
import Input from "@/components/Forms/PrimeInput";

import axios from "axios";
import {useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSelector} from "react-redux";
import {Toast} from "primereact/toast";
import {FormTitle, Container} from "@/componentsStyles/dialogforms";

import {useSession} from "next-auth/react";
import {TranslateInput} from "@/components/Forms/TranslateInput";
import SingleImageUpload from "@/components/bunnyUpload/FileUpload";

const addSchema = yup.object().shape({
    categoryName: yup.string().required("To όνομα είναι υποχρεωτικό"),
});

const EditDialog = ({dialog, hideDialog, setSubmitted}) => {
    const {data: session, status} = useSession();
    const toast = useRef(null);
    const {gridRowData} = useSelector((store) => store.grid);
    const [translateName, setTranslateName] = useState("");
    //This component has one Image only:

    const handleTranslate = async (value) => {
        setTranslateName(value);
    };
    const {
        control,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm({
        defaultValues: gridRowData,
    });

    useEffect(() => {
        // Reset the form values with defaultValues when gridRowData changes
        reset({...gridRowData});
    }, [gridRowData, reset]);

    useEffect(() => {
        // setLogo(gridRowData?.categoryIcon ? [gridRowData?.categoryIcon] : [])
        // setImage(gridRowData?.categoryImage ? [gridRowData?.categoryImage] : [])
    }, [gridRowData]);

    const handleEdit = async (data) => {
        let user = session.user.user.lastName;
        console.log("edit data");
        console.log(data);
        const {categoryIcon, categoryImage, ...rest} = data;

        try {
            let resp = await axios.post("/api/product/apiCategories", {
                action: "update",
                data: {...rest, englishName: translateName},
                updatedFrom: user,
                id: gridRowData._id,
            });

            setSubmitted(true);
            hideDialog();
            showSuccess("Η εγγραφή ενημερώθηκε");
        } catch (e) {
            console.log(e);
        }
    };

    const showSuccess = (message) => {
        toast.current.show({
            severity: "success",
            summary: "Success",
            detail: message,
            life: 4000,
        });
    };
    const showError = () => {
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Αποτυχία ενημέρωσης βάσης",
            life: 4000,
        });
    };

    const handleClose = () => {
        hideDialog();
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
                onClick={handleSubmit(handleEdit)}
            />
        </React.Fragment>
    );

    return (
        <Container>
            <form>
                <Toast ref={toast}/>
                <Dialog
                    visible={dialog}
                    style={{width: "32rem", maxWidth: "80rem"}}
                    breakpoints={{"960px": "75vw", "641px": "90vw"}}
                    header="Τροποποίηση  Κατηγορίας"
                    modal
                    className="p-fluid"
                    footer={productDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <Input
                        label={"Όνομα Κατηγορίας"}
                        name={"categoryName"}
                        control={control}
                        required
                        error={errors.categoryName}
                    />
                    <div>
                        <TranslateInput
                            label={"Όνομα Κατηγορίας Αγγλικά"}
                            state={translateName}
                            handleState={handleTranslate}
                            targetLang="en-GB"
                        />
                    </div>

                    <FormTitle>Φωτογραφία</FormTitle>

                    <div>
                        <UploadImage
                            id={gridRowData._id}
                            image={gridRowData.categoryImage}
                        />
                    </div>
                    <FormTitle>Εικονίδιο</FormTitle>
                    <UploadLogo id={gridRowData._id}/>
                </Dialog>
            </form>
        </Container>
    );
};

const UploadImage = ({id}) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [visible, setVisible] = useState(false);
    const [refetch, setRefetch] = useState(false);
    const [data, setData] = useState(false);

    const onAdd = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "addImage",
            imageName: uploadedFiles[0].name,
            id: id,
        });
        setRefetch((prev) => !prev);
        return data;
    };

    const handleFetch = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "getImages",
            id: id,
        });
        setData(data?.result?.categoryImage);
    };
    const onDelete = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "deleteImage",
            id: id,
        });
        setRefetch((prev) => !prev);
    };

    useEffect(() => {
        handleFetch();
    }, [refetch]);
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
    );
};


const UploadLogo = ({id}) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [visible, setVisible] = useState(false);
    const [refetch, setRefetch] = useState(false);
    const [data, setData] = useState(false);

    const onAdd = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "addLogo",
            imageName: uploadedFiles[0].name,
            id: id,
        });
        setRefetch((prev) => !prev);
        return data;
    };

    const handleFetch = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "getImages",
            id: id,
        });
        setData(data?.result?.categoryIcon);
    };
    const onDelete = async () => {
        let {data} = await axios.post("/api/product/apiCategories", {
            action: "deleteLogo",
            id: id,
        });
        setRefetch((prev) => !prev);
    };

    useEffect(() => {
        handleFetch();
    }, [refetch]);
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
    );
};

const AddDialog = ({dialog, hideDialog, setSubmitted}) => {
    const {
        control,
        formState: {errors},
        handleSubmit,
        reset,
    } = useForm({
        resolver: yupResolver(addSchema),
        defaultValues: {
            categoryName: "",
            categoryImage: "",
            categoryIcon: "",
        },
    });
    const {data: session, status} = useSession();
    const toast = useRef(null);
    const [disabled, setDisabled] = useState(false);
    const [logo, setLogo] = useState("");
    const [image, setImage] = useState([]);
    const cancel = () => {
        hideDialog();
        reset();
    };

    const handleAdd = async (data) => {
        let user = session.user.user.lastName;
        const body = {
            ...data,
            categoryIcon: logo[0],
            categoryImage: image[0],
            createdFrom: user,
        };

        let res = await axios.post("/api/product/apiCategories", {
            action: "create",
            data: body,
        });
        if (!res.data.success) return showError(res.data.error);
        setDisabled(true);
        setSubmitted(true);
        showSuccess("Επιτυχής εισαγωγή στην βάση");
        hideDialog();
        reset();
    };

    const productDialogFooter = (
        <>
            <Button label="Ακύρωση" icon="pi pi-times" outlined onClick={cancel}/>
            <Button
                label="Αποθήκευση"
                icon="pi pi-check"
                type="submit"
                onClick={handleSubmit(handleAdd)}
                disabled={disabled}
            />
        </>
    );

    const showSuccess = (detail) => {
        toast.current.show({
            severity: "success",
            summary: "Success",
            detail: detail,
            life: 4000,
        });
    };
    const showError = (message) => {
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Αποτυχία ενημέρωσης βάσης : " + message,
            life: 5000,
        });
    };

    return (
        <form noValidate onSubmit={handleSubmit(handleAdd)}>
            <Toast ref={toast}/>
            <Dialog
                visible={dialog}
                style={{width: "32rem"}}
                breakpoints={{"960px": "75vw", "641px": "90vw"}}
                header="Προσθήκη Κατηγορίας"
                modal
                className="p-fluid"
                footer={productDialogFooter}
                onHide={hideDialog}
            >
                <FormTitle>Λεπτομέριες</FormTitle>
                <Input
                    label={"Όνομα Κατηγορίας"}
                    name={"categoryName"}
                    control={control}
                    required
                    error={errors.categoryName}
                />

            </Dialog>
        </form>
    );
};

export {EditDialog, AddDialog};
