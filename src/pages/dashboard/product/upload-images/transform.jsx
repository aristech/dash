import React, { useState, useRef, useEffect} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';
import {  useDispatch, useSelector } from 'react-redux';

import UpdatedAt from '@/components/grid/UpdatedAt';
import XLSXDownloadButton from '@/components/exportCSV/Download';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import {  setSelectedMongoKeys, removeSelectedKey, setClearKeys } from '@/features/uploadImagesSlice';

const KEYS = ["CODE2", "CODE1", "CODE"]

const MAPPING_KEYS = [
    {   
        label: "Κωδικός Εργοστασίου",
        key: "CODE2",

    },
    {   
        label: "Κωδικός ERP",
        key: "CODE",
    },

    {
        label: "URL Φωτογραφιών",
        key: "images",
    }
    
]
export const Page = () => {
    const [loading, setLoading] = useState(false);
    const [returnedData, setReturendData] = useState([]);
    const router = useRouter();
    const dispatch = useDispatch()
    const {gridData, mongoKeys} = useSelector(state => state.uploadImages);


    useEffect(() => {
        dispatch(setClearKeys())
    }, [])


    const columns = () => {
        if(!gridData || !gridData.length) {
            router.push('/dashboard/product')
            return;
        }
        //CREATE COLUMNS:
        let row = Object?.keys(gridData[0])
        return row.map((col) => (
            <Column 
            key={col} 
            field={col}
            showFilterMenu={false}
            filter
            filterElement={({field}) => (
                <SelectTemplate field={field} mongoKeys={mongoKeys} setSelectedMongoKeys={setSelectedMongoKeys}/>
            )}
            header={col} 
            />
        ))
    }


    const handleAdd = async () => {
        router.push('/dashboard/product/upload-images/altered')
    }


    return (
        <AdminLayout>
            {!returnedData.length ? (
                <DataTable
                    header={() => (
                        <div className='flex justify-content-between'>
                            <Button size="small" loading={loading} disabled={loading} label="Συσχετισμός" icon="pi pi-file" onClick={handleAdd} />
                            <XLSXDownloadButton data={returnedData} filename="images"  size="small"/>
                        </div>
                    )}
                    
                    paginator
                    rows={10}
                    rowsPerPageOptions={[20, 50, 100, 200, 500]}
                    selectionMode="radiobutton"
                    value={gridData}
                    tableStyle={{ minWidth: '50rem' }}
                    filterDisplay="row"
                >
                    {columns()}
                </DataTable>
            ) : (
                <div>
                    <DataTable
                        value={returnedData}
                        tableStyle={{ minWidth: '50rem' }}
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginator
                    >
                        <Column header="Προϊόν" field='NAME' />
                        <Column header="Κωδικός" field='CODE' />
                        <Column header="Κωδικός" body={Image} />
                        <Column header="Num" field={'updatedToTotal'}/>
                        <Column header="UpdatedAt" field='updatedAt' body={UpdatedAt} />
                    </DataTable>
                </div>
            )}



        </AdminLayout >
    );
};
const Image = ({ images }) => {
    return (
        <div>
            <span>{images[0].name}</span>
        </div>
    )
}

const SelectTemplate = ({field, mongoKeys, setSelectedMongoKeys}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const dispatch = useDispatch()
    const toast = useRef(null)

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Επιτυχής διαγραφή', life: 4000 });
    }

    console.log({mongoKeys})
    const showError = (message) => {
        toast.current.show({ severity: 'info', summary: 'Error', detail: message, life: 4000 });
    }


    const handleChange = (e) => {
        if(!e.value) {
            dispatch(removeSelectedKey(field));
            setSelectedOption(null)
            return;
        };
  
    

        const selectedLabel = e.value.label;
        const selectedKey = e.value.key;
        //step: if the mongokeys contain any of the KEYS then do not let the user add another key to the array
        const condition = mongoKeys.find(item => KEYS.includes(item.value));
        const repetition = mongoKeys.find(item => item.value === selectedKey);
        if(condition) {
            showError('Μπορείτε να συσχετίσετε μόνο ένα κλειδί')
            return;
        }
        if(repetition) {
            showError('Έχετε επιλέξει ήδη στήλη για τη φωτογραφία')
            return;
        }
       
        setSelectedOption(e.value);
        dispatch(setSelectedMongoKeys({
                oldKey: field,
                label: selectedLabel,
                value: selectedKey
            })
        )
        
       
    };


    return (
        <div className="flex align-items-center gap-2">
            <Toast ref={toast} />
            <Dropdown
                showClear
                value={selectedOption}
                onChange={handleChange}
                options={MAPPING_KEYS}
                optionLabel="label"
                placeholder="Συσχέτιση"
                className='custom_dropdown dropdown-md'
            />
        </div>
    );
};


export default Page;
