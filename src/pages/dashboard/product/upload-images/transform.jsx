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
import {  setSelectedMongoKeys, removeSelectedKey, setClearKeys , setNewData } from '@/features/uploadImagesSlice';
import axios from 'axios';

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
    const toast = useRef(null)
    

    useEffect(() => {
        dispatch(setClearKeys())
    }, [])


    const showError = (message) => {
        toast.current.show({ severity: 'warn', summary: message, detail: message, life: 4000 });
    }
    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: message, detail: message, life: 4000 });
    }


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
                <SelectTemplate 
                    toast={toast}
                    field={field} 
                    mongoKeys={mongoKeys} 
                    setSelectedMongoKeys={setSelectedMongoKeys}
                    />
            )}
            header={col} 
            />
        ))
    }


    const handleAdd = async () => {
        setLoading(true)
        const {data} = await axios.post('/api/butchImages/format', {data: gridData, mongoKeys})
        setLoading(false)
        if(!data.success) {
            showError(data.message)
        } else {
            showSuccess(data.message)
            dispatch(setNewData(data.result))
            router.push('/dashboard/product/upload-images/altered')

        }
        
    }

    return (
        <AdminLayout>
              <Toast ref={toast} />
                <DataTable
                    header={() => (
                        <div className='flex justify-content-between'>
                            <Button 
                            size="small" 
                            // loading={loading} 
                            // disabled={loading} 
                            label="Συσχετισμός" 
                            icon="pi pi-file" 
                            onClick={handleAdd} 
                            />
                            <XLSXDownloadButton data={returnedData} filename="images"  size="small"/>
                        </div>
                    )}
                    editMode="cell"
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
        </AdminLayout >
    );
};


const SelectTemplate = ({field, mongoKeys, setSelectedMongoKeys, toast}) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const dispatch = useDispatch()
    

   

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
        console.log(selectedLabel, selectedKey)
        //step: if the KEYS inlucde the selected key do not allow it:
        if (KEYS.includes(selectedKey)) {
            const existingKey = mongoKeys.find(item => KEYS.includes(item.value));
            console.log({existingKey})
            if (existingKey) {
                console.log("WTF")
                showError('Μπορείτε να συσχετίσετε μόνο ένα κλειδί');
                return;
            }
        } else if (selectedKey === 'images') {
            const existingImages = mongoKeys.filter(item => item.value === 'images');
            if (existingImages.length > 1 || (existingImages.length === 1 && existingImages[0].field !== field)) {
                showError('Μπορείτε να επιλέξετε μόνο μία στήλη για τις φωτογραφίες');
                return;
            }
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
