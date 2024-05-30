import React, {useState, useRef, useEffect} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import {useRouter} from "next/router";
import {setClearKeys, setAttribute, setSelectedMongoKey, removeSelectedKey, setNewData} from "@/features/catalogSlice";
import {useDispatch, useSelector} from "react-redux";
import {Dropdown} from "primereact/dropdown";
import {Toast} from "primereact/toast";
import StepHeader from "@/components/StepHeader";
import {Dialog} from 'primereact/dialog';
import Input from "@/components/Forms/PrimeInput";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";

const REQUIRED_KEY = "CODE2";
const OUR_DATABASE_KEYS = [
    {key: 0, header: "Κανένα"},
    {key: "CODE2", header: "Κωδικός Εργοστασίου"},
    {key: "CODE1", header: "Κωδικός EAN"},
    {key: "CODE", header: "Κωδικός ERP"},
    {key: "NAME", header: "Όνομα"},
    {key: "NAME_ENG", header: "Όνομα Αγγλικά"},
    {key: "DESCRIPTION", header: "Περιγραφή"},
    {key: "DESCRIPTION_ENG", header: "Περιγραφή Αγγλικά"},
    {key: "VOLUME", header: "Όγκος"},
    {key: "GWEIGHT", header: "Μικτό Βάρος"},
    {key: "WIDTH", header: "Πλάτος"},
    {key: "HEIGHT", header: "Ύψος"},
    {key: "LENGTH", header: "Μήκος"},
    {key: "VAT", header: "ΦΠΑ"},
    {key: "isSkroutz", header: "Συμμετέχει στο Skroutz"},
    {key: "INTRASTAT", header: "Κωδικός Intrastat"},
    {key: "PRICER", header: "Τιμή Λιανικής"},
    {key: "PRICEW", header: "Τιμή Χονδρικής"},
    {key: "PRICER02", header: "Τιμή Scroutz"},
];

const Page = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const toast = useRef(null);
    const {gridData, mongoKeys, attributes} = useSelector((state) => state.catalog);

    useEffect(() => {
        dispatch(setClearKeys());
    },[])
    const showError = ({message, summary}) => {
        toast.current.show({
            severity: "error",
            summary:summary,
            detail: message,
            life: 6000,
        });
    };


    const renderColumns = () => {
        //make this correct:
        if(gridData && !gridData.length) {
            router.push('/dashboard/suppliers')
            return;
        
        };
        const columns = Object.keys(gridData[0])
        return columns.map((col, index) => {
            return (
                <Column
                        filterElement={SelectTemplate}
                        showFilterMenu={false}
                        filter
                        key={col}
                        field={col}
                        header={col}
                    />
            ) ;
        });
    };

    useEffect(() => {
        console.log({attributes})
        console.log({mongoKeys})
    }, [attributes, mongoKeys]);

   

    const handleMongoKeysChange = () => {
        const codeCondition = mongoKeys.some((key) => key.related === REQUIRED_KEY);
        if (!codeCondition) return;
        return true;
    };

    const onSubmit = async () => {
        let condition = handleMongoKeysChange();
        if (!condition) {
            showError("Πρέπει να επιλέξεις στήλη τον ΚΩΔΙΚΟ ΕΡΓΟΣΤΑΣΙΟΥ");
            return;
        }
        try {
            const {data} = await axios.post("/api/catalogs/format-data", {
                data: gridData,
                mongoKeys,
                attributes,
            })
            if(data.success) {
                dispatch(setNewData(data.result))
                router.push("/dashboard/catalogs/result");

            } else {
                showError({
                    message: 'Σφάλμα δεν έγινε αντιστοίχηση',
                    summary: 'Request Error'
                })
            }
        } catch(e) {
            console.error(e.message)
            showError({
                message: 'Προέκυψε κάποιο σφάλμα! Παρακαλώ δοκιμάστε ξανά',
                summary: 'Server Error'
            })
        } 
       
        
    };

    return (
        <AdminLayout>
            <Toast ref={toast}/>
            <StepHeader text="Συσχετισμός Κλειδίων"/>
            <div className="mb-4 mt-2">
                <p>
                    Υποχρεωτικό Πεδίο:{" "}
                    <span className="font-bold"> Κωδικός Εργοστασίου</span>
                </p>
                <p>
                    Συσχετίστε τα πεδία που επιθυμείτε από τον κατάλογο σας με τα
                    παρακάτω κλειδιά της βάσης μας
                </p>
            </div>
            <div className="mb-4 mt-2">

                <p className="max-w-30rem">
                    Αν θέλετε να προσθέσετε κάποιο<strong> προσαρμοσμένο πεδίο</strong> , πατήστε το
                    κουμπί <strong>+</strong> και συμπληρώστε το όνομα του πεδίου
                </p>
            </div>
            <DataTable
                showGridlines
                loading={loading}
                selectionMode="radiobutton"
                paginator
                rows={10}
                rowsPerPageOptions={[20, 50, 100, 200]}
                value={gridData.slice(0, 5)}
                tableStyle={{minWidth: "50rem"}}
                filterDisplay="row"
            >   
               {renderColumns()}
            </DataTable>
            <Button label="Διαμόρφωση" onClick={onSubmit} className="mt-2"/>
        </AdminLayout>
    );
};

const schema = yup.object().shape({
    name: yup.string().required("Το όνομα είναι υποχρεωτικό")
        // .matches(
        //     /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff0-9_\- ]+)$/gi,
        //     'Το όνομα μπορεί να περιέχει μόνο λατινικά γράμματα, αριθμούς, κάτω παύλες, παύλες και κενά.'
        // ),
    // header: yup.string().required("Το όνομα είναι υποχρεωτικό"),
})


const SelectTemplate = ({field}) => {

    
    const dispatch = useDispatch();
    const [options, setOptions] = useState(OUR_DATABASE_KEYS);
    const [selectedOption, setSelectedOption] = useState(null);
    const [visible, setVisible] = useState(false);
    const [mongoKeys, setMongoKeys] = useState([]);
    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
        },
    });
    const {handleSubmit} = methods;


    const handleChange = (e) => {
        //if the user has cleared the selection, there will be no value.
        //in this case, we should remove the selected key from the state
        if (!e.value) {
            dispatch(removeSelectedKey(field));
            setSelectedOption(null);
            return;
        }
        const {key, header} = e.value;
        setSelectedOption(e.value);
        //update mongoKeys state:
        dispatch(setSelectedMongoKey({
            oldKey: field,
            related: key,
            header: header
        }));
    };


    //on adding a custom attribute
    const onDialogSubmitCustomAttribute = (data) => {
        
        let previousOptions = [...options];
        previousOptions.push({
            key: data.name,
            header: data.name
        })
        setOptions(previousOptions);


        setSelectedOption({
            key: data.name,
            header: data.name
        })
        setVisible(false);
        dispatch(setAttribute({
            name: data?.name,
            oldKey: field,
        }))
    }

    const footerContent = (
        <div>
            <Button
                label="Ακύρωση"
                icon="pi pi-times"
                onClick={() => setVisible(false)}
                className="p-button-text"/>
            <Button
                label="Ok"
                icon="pi pi-check"
                onClick={handleSubmit(onDialogSubmitCustomAttribute)}
                autoFocus
            />
        </div>
    );
    const openDialog = () => {
        setVisible(true);
    }


    return (
        <div className="flex align-items-center gap-2">

            <Dropdown
                filter
                showClear
                value={selectedOption}
                onChange={handleChange}
                options={options}
                optionLabel="header"
                placeholder="Συσχέτιση"
            />
            <Button
                onClick={openDialog}
                outlined
                icon="pi pi-plus"
                severity="secondary"
                style={{width: '30px', height: '30px'}}
                // className="p-button-rounded p-button-text"
            />
            <Dialog
                footer={footerContent}
                header="Προσθήκη Προσαρμοσμένου Πεδίου"
                visible={visible}
                style={{width: '28vw'}}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}>
                <div className="mb-4">
                    <p>Παράδειγμα :</p>
                    <p>
                        Πεδίο στη Βάση: <span className="font-bold">WEIGHT</span>

                    </p>
                    <p>
                        Πεδίο για Κατανόηση Χρήστη: <span className="font-bold">Βάρος</span>
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit(onDialogSubmitCustomAttribute)}
                    noValidate
                    className="catalogs_form"
                >

                    <Input
                        label="Όνομα Πεδίου στη Βάση (Λατινικοί Χαρακτήρες)"
                        name="name"
                        id="name"
                        control={methods.control}
                        required
                        error={methods.formState.errors.name}
                        />
                </form>
            </Dialog>
        </div>
    );
};


export default Page;
