import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { useDispatch } from 'react-redux';
import { setGridData } from '@/features/uploadImagesSlice';

const MassiveImageUpload = () => {
    
    const fileInputRef = useRef(null);
    
    const router = useRouter();
    const dispatch = useDispatch();
    const [fileLoading, setFileLoading] = useState(false)
    const handleFileUpload = async (e) => {
        setFileLoading(true)
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = async (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);
            dispatch(setGridData(parsedData))
            setFileLoading(false)
            router.push('/dashboard/product/upload-images/transform')
        };
    };

   
    const onUploadClick = () => {
        fileInputRef.current.click()
    }

   
    return (
        <div>
            <input hidden className="hide" ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e)} />
            <Button className='w-full' severity='warning' loading={fileLoading} onClick={onUploadClick} label="Ανέβασμα Φωτογραφιών xlsx" icon="pi pi-upload"></Button>
        </div>
    )
}



export default MassiveImageUpload