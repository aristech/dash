import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { useDropzone } from 'react-dropzone';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { deleteBunny, uploadBunny } from '@/utils/bunny_cdn';
import { Toast } from 'primereact/toast';



const SingleImageUpload = ({ uploadedFiles, setUploadedFiles, data, onDelete, onAdd }) => {
    const toast = useRef(null);
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 4000 });
    }
    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 4000 });
    }
    
  
    useEffect(() => {
        setUploadedFiles([])
    }, [])

    
    const handleDelete = async (name) => {
        await onDelete()
        let bunny_delete = await deleteBunny(name);
        if(bunny_delete?.HttpCode == 200) {
            showSuccess('Η φωτογραφία διαγράφηκε επιτυχώς')
        } else {
            showError('Αποτυχία διαγραφής φωτογραφίας στο bunny cdn')
        }
    }
    //UPLOAD FILE STATE IS AN ARRAY OF OBJECTS {file: file, name: name}
    //THE file is the uplaoded file that will be turned into binary to send to bunny cdn
    //In case we need to change the name of the file that wll be uploaded we change the value stored in the "name" key in the state object
  
    return (
        <div className=' border-1 border-round border-300' >
               <div className='flex border-bottom-1 border-300'>
                <Toast ref={toast} />
                <div className='p-3'>
                <Button className='p-button-sm'  style={{width: '80px', height: '30px', fontSize: '12px'}} label="Add/Edit" severity='secondary' onClick={() => setVisible(true)} />
                <FileUpload
                    onAdd={onAdd}
                    visible={visible}
                    loading={loading}
                    setLoading={setLoading}
                    setVisible={setVisible}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}

                />
                </div>
            </div>
            <div className='p-3 flex align-items-center justify-content-between'>
                {data ? (<ImageTemplate image={data} loading={loading} />) : (
                    <p>Δεν υπάρχει φωτογραφία</p>
                ) }
                
                <i onClick={() => handleDelete(data)} className="pi pi-trash cursor-pointer" style={{ fontSize: '1rem' }}></i>
            </div>
        </div>
       

    )
}




const ImageTemplate = ({image}) => {
    return (
        <div className='flex'>
          
            <span>{image}</span>
        </div>
    )
}





const FileUpload = ({ visible, setVisible, uploadedFiles, setUploadedFiles, onAdd, loading, setLoading }) => {
    const toast = useRef(null);


    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }
    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    }

    const { getRootProps, getInputProps } = useDropzone({
        // ON drop add any new file added to the previous stat
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/jpg': [],
            'image/svg+xml': [],
        },
        multiple: false,
        onDrop: (acceptedFiles) => {
            setUploadedFiles([{
                file: acceptedFiles[0],
                name:  acceptedFiles[0].path
            }])
        },
    });



    const onSubmit = async () => {
        try {
          setLoading(true);
          // Assume onAdd returns a Promise
          const onAddResult = await onAdd();
          if (!onAddResult.success) {
            showError(onAddResult.message);
          } else {
            const reader = new FileReader();
      
            reader.onload = async (event) => {
              try {
                const arrayBuffer = event.target.result;
      
                // Assume uploadBunny returns a Promise
                const result = await uploadBunny(arrayBuffer, uploadedFiles[0].name);
      
                if (result?.HttpCode === 201 || result.Message === "File uploaded.") {
                  showSuccess('Η φωτογραφία ανέβηκε επιτυχώς');
                }
              } catch (error) {
                console.error('Error uploading to Bunny CDN:', error);
                showError('Error uploading to Bunny CDN');
              } finally {
                setLoading(false);
                setVisible(false);
              }
            };
      
            reader.readAsArrayBuffer(uploadedFiles[0].file);
          }
        } catch (error) {
          console.error('Error calling onAdd:', error);
          showError('Error calling onAdd');
          setLoading(false);
          setVisible(false);
        }
      };

    const removeImage = ({ name }) => {
        let newFiles = uploadedFiles.filter(file => file.name !== name)
        setUploadedFiles(newFiles)
    }



    return (
        <Dialog header="Uploader" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
            <Toast ref={toast} />
            <div className='cursor-pointer' {...getRootProps()}>
                <input {...getInputProps()} />
                <Button {...getInputProps()} label="drag and drop" />
                <div className='h-6rem border-round p-3 pointer-cursor border-1 border-dashed flex align-items-center justify-content-center'>
                    <p className='text-md'>Σείρετε ή επιλέξτε αρχεία για ανέβασμα</p>
                </div>

            </div>
            {uploadedFiles.map((item, index) => (
                <ImageItem
                    fileItem={item}
                    key={index}
                    removeImage={removeImage}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles} />
            ))}
            {uploadedFiles.length ? (<Button loading={loading} label="Ολοκλήρωση" onClick={onSubmit} className='mt-2' />) : null}
        </Dialog>


    );
};


const ImageItem = ({ fileItem, index, removeImage, uploadedFiles, setUploadedFiles }) => {
    const [localValue, setLocalValue] = useState(fileItem.name)
    const handleEdit = (e) => {
        setLocalValue(e.target.value)
        let newFiles = uploadedFiles.map(mapitem => {
            if (mapitem.file.path === fileItem.file.path) {
                return {
                    ...mapitem,
                    name: e.target.value
                }
            }
            return mapitem
        })
        setUploadedFiles(newFiles)



    }
    return (
        <div className=' flex  justify-content-between p-2 border-round surface-200 mb-1 mt-2' key={index} >
            <InputText onChange={handleEdit} className='w-full border-none' placeholder="Search" value={localValue} />
            <div className='flex bg-surface-200 align-items-center'>
                <i onClick={() => removeImage(fileItem)} className="pi pi-trash text-surface-400  p-2 border-round cursor-pointer ml-1" style={{ fontSize: '1.2rem' }}></i>
            </div>
        </div>
    )
}




export default  SingleImageUpload;