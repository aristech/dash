import React, { useState, useEffect, useRef, useReducer } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import axios from 'axios';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { AddDialog, EditDialog } from '@/GridDialogs/brandDialog';
import { useDispatch, useSelector } from 'react-redux';
import { setGridRowData } from '@/features/grid/gridSlice';

import { Toast } from 'primereact/toast';
import RegisterUserActions from '@/components/grid/GridRegisterUserActions';
import GridLogoTemplate from '@/components/grid/gridLogoTemplate';
import { useSession } from 'next-auth/react';
import StepHeader from '@/components/StepHeader';
import CreatedAt from '@/components/grid/CreatedAt';
import { useRouter } from 'next/router';
import { ImageGrid } from '@/components/bunnyUpload/ImageGrid';
import styled from 'styled-components';
import { OverlayPanel } from 'primereact/overlaypanel';
import { setGridData, setHeaders, setSelectedPriceKey, } from '@/features/catalogSlice';
import { uploadBunnyFolderName } from '@/utils/bunny_cdn';
import XLSX from 'xlsx';
import Link from 'next/link';
import { TabPanel, TabView } from 'primereact/tabview';
import Saved from '../catalogs/saved';

export default function TemplateDemo() {
    const router = useRouter();
    const [fileLoading, setFileLoading] = useState(false)
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();
    const [editData, setEditData] = useState(null)
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState([])
    const toast = useRef(null);
    const [selectedBrand, setSelectedBrand] = useState(null)
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    });
    const { data: session } = useSession()
    let user = session?.user?.user;


    const handleFetch = async () => {
        setLoading(true)
        try {
            let resp = await axios.post('/api/product/apiMarkes', { action: 'findAll' })
            setData(resp.data.markes)
            setLoading(false)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }


    useEffect(() => {
        handleFetch();

    }, []);

    useEffect(() => {
        if (submitted) handleFetch()
    }, [submitted])



    const logoTemplate = (data) => {
        return (
            <GridLogoTemplate logo={data?.logo} />
        )
    }
    //TEMPLATES

    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';

        return (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={value || ''} onChange={(e) => onGlobalFilterChange(e)} placeholder="Αναζήτηση" />
            </span>
        );
    };
    const header = renderHeader();

    const onGlobalFilterChange = (event) => {
        const value = event.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
    };


    const allowExpansion = (rowData) => {
        return rowData
    };



    const rowExpansionTemplate = (data) => {
        return (
            <TabView>
                <TabPanel header="Φωτογραφίες">
                    < Images id={data._id} />
                </TabPanel>
                <TabPanel header="Κατάλογοι">
                    <BrandCatalogs id={data._id} />
                </TabPanel>

            </TabView>
        )

    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Νέα Μάρκα" icon="pi pi-plus" severity="secondary" onClick={openNew} />
            </div>
        );
    };

    //Edit:
    const editProduct = async (product) => {
        setSubmitted(false);
        setEditDialog(true)
        dispatch(setGridRowData(product))
    };

    //Add product
    const openNew = () => {
        setSubmitted(false);
        setAddDialog(true);
    };


    const hideDialog = () => {
        setEditDialog(false);
        setAddDialog(false);
    };





    // CUSTOM TEMPLATES FOR COLUMNS


    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Επιτυχής διαγραφή', life: 4000 });
    }
    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 4000 });
    }

    const dialogStyle = {
        marginTop: '10vh', // Adjust the top margin as needed
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

    };
    const Actions = (product) => {
        return (
            <div>
                <i className="pi pi-pencil cursor-pointer" onClick={() => editProduct(product)}></i>
            </div>
        )
    }

    const onUploadClick = () => {
        fileInputRef.current.click()
    }
    const ActionTemplate = (rowData) => {
        const op = useRef(null);
        return (
            <div className='flex align-items-center justify-content-center'>
                <i className="pi pi-cog mr-2 cursor-pointer text-primary" style={{ fontSize: '12px' }} onClick={(e) => op.current.toggle(e)}></i>
                <OverlayPanel ref={op}>
                    <div className='flex flex-column'>
                        <Button label="Τροποποίηση Μάρκας" icon="pi pi-pencil" className='w-full mb-2' onClick={() => editProduct(rowData)} />
                        <UploadBtn>
                            <input className="hide" ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e, rowData)} />
                            <Button className='w-full' severity='warning' loading={fileLoading} onClick={onUploadClick} label="Ανέβασμα τιμοκατάλογου" icon="pi pi-plus"></Button>
                        </UploadBtn>
                    </div>
                </OverlayPanel>
            </div>
        )
    }

    const handleFileUpload = async (e, rowData) => {
        setFileLoading(true)
        let fileName = e.target.files[0].name
        let save = await axios.post('/api/saveCatalog', { action: 'create', catalogName: fileName, id: rowData._id })
        console.log(save)
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = async (e) => {

            const data = e.target.result;
            let upload = await uploadBunnyFolderName(data, fileName, 'catalogs')
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);
            dispatch(setGridData(parsedData))

            if (parsedData.length > 0) {
                const firstRow = parsedData[0];
                const headers = Object.keys(firstRow).map((key) => ({
                    field: key,
                }));
                dispatch(setHeaders(headers))
                setFileLoading(false)
                router.push('/dashboard/catalogs/upload-catalog')
            }
        };
    };

    return (
        <AdminLayout >
            <Toast ref={toast} />
            <div>
                <StepHeader text="Μάρκες" />
            </div>
            <Toolbar start={leftToolbarTemplate}></Toolbar>
            <DataTable
                size="small"
                header={header}
                value={data}
                paginator
                rows={8}
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
                showGridlines
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                dataKey="_id"
                filters={filters}
                paginatorRight={true}
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                loading={loading}
                editMode="row"
                selectOnEdit
            >
                <Column bodyStyle={{ textAlign: 'center' }} expander={allowExpansion} style={{ width: '20px' }} />
                <Column body={ActionTemplate} style={{ width: '30px' }} />
                <Column field="logo" header="Εικονίδιο" body={logoTemplate} style={{ width: '50px' }} ></Column>
                <Column field="softOne.NAME" header="Όνομα" ></Column>
                <Column field="supplier.NAME" header="Προμηθευτής" ></Column>
                <Column field="updatedFrom" header="Τροποποιήθηκε Από" style={{ width: '90px' }} body={UpdatedFromTemplate}></Column>
                {user?.role === 'admin' ? (
                    <Column body={Actions} exportable={false} sortField={'delete'} bodyStyle={{ textAlign: 'center' }} style={{ width: '90px' }} ></Column>
                ) : null}

            </DataTable>
            <EditDialog
                style={dialogStyle}
                data={editData}
                setData={setEditData}
                dialog={editDialog}
                setDialog={setEditDialog}
                hideDialog={hideDialog}
                setSubmitted={setSubmitted}
            />
            <AddDialog
                dialog={addDialog}
                setDialog={setAddDialog}
                hideDialog={hideDialog}
                setSubmitted={setSubmitted}
            />
            <div className='mt-4'>
                <Saved />
            </div>
        </AdminLayout >
    );
}




const DownLoadCatalog = ({ catalogName, catalogDate }) => {
    return (
        <div className='flex align-items-center justify-content-center'>
            {catalogName ? (
                <Link href={`https://kolleris.b-cdn.net/catalogs/${catalogName}`}>
                    <div className='flex' >
                        <i className="pi pi-file-pdf mr-2 text-red-500 mr-1 text-xl" />
                        <span className=''>{catalogName}</span>
                    </div>
                    <span>{catalogDate}</span>
                </Link>
            ) : null}
        </div>
    )
}


const BrandCatalogs = ({id}) => {
    const [state, setState] = useState({
        data: [],
        loading: false,
        rows: 10,
        first: 0,
        refetch: false,
    })

    const onPage = (e) => {
        setState((prev) => ({ ...prev, first: e.first, rows: e.rows }))
    }

    const handleFetch = async () => {
        setState(prev => ({ ...prev, loading: true }))
        const { data } = await axios.post('/api/saveCatalog', {
            action: 'getBrandCatalogs',
            id: id,
            skip: state.first,
            limit: state.rows
        })
        console.log(data)
        setState(prev => ({...prev, data: data.result.catalogs, totalRecords: data.totalRecords, loading: false}))
    }

    useEffect(() => {
        handleFetch()
    }, [state.refetch])

    const CatalogDate = ({createdAt}) => {
        return (
            <CreatedAt createdAt={createdAt} />
            
        )
    }   

    const handleDelete = async (_id) => {
        let {data} = await axios.post('/api/saveCatalog', {action: 'deleteCatalog', id: _id})
        setState(prev => ({...prev, refetch: !prev.refetch}))
    }
    const Delete = ({_id}) => {
        return (
            <i className="pi pi-trash mr-2 text-red-500 mr-1 cursor-pointer" onClick={() => handleDelete(_id)} />
        )
    }
    return (
        <DataTable
            size="small"
            value={state.data}
            paginator
            lazy
            first={state.first}
            rows={state.rows}
            onPage={onPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showGridlines
            dataKey="_id"
            paginatorRight={true}
            loading={state.loading}
        >
            <Column field="name" header="Όνομα" ></Column>
            <Column field="createAt" header="Όνομα" body={CatalogDate} ></Column>
            <Column header="" body={Delete} style={{width: '30px'}} ></Column>
        </DataTable>
    )
}

const UploadBtn = styled.div`
  .hide {
    display: none;
  }
  display: inline-block;
`;




const UpdatedFromTemplate = ({ updatedFrom, updatedAt }) => {
    return (
        <RegisterUserActions
            actionFrom={updatedFrom}
            at={updatedAt}
            icon="pi pi-user"
            color="#fff"
            backgroundColor='var(--yellow-500)'
        />

    )
}



const Images = ({ id }) => {
    console.log(id)
    const router = useRouter();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [data, setData] = useState([])
    const [refetch, setRefetch] = useState(false)

    const createImagesURL = (files) => {
        let imagesNames = [];
        for (let file of files) {
            imagesNames.push({ name: file.name })
        }
        return imagesNames;
    }



    const handleFetch = async () => {
        let { data } = await axios.post('/api/product/apiMarkes', { action: "getImages", id: id })
        let images = data.result
        setData(images)
    }

    const onDelete = async (name, _id) => {
        //THis is not the product id but the image id
        let { data } = await axios.post('/api/product/apiMarkes', { action: "deleteImage", parentId: id, imageId: _id, name: name })
        setRefetch(prev => !prev)
    }

    const onAdd = async () => {
        console.log('uploadedFiles')
        console.log(uploadedFiles)
        let imagesURL = createImagesURL(uploadedFiles)
        console.log('images url')
        console.log(imagesURL)
        let { data } = await axios.post('/api/product/apiMarkes', { action: 'addImages', id: id, imagesURL: imagesURL })
        setRefetch(prev => !prev)
        return data;
    }


    useEffect(() => {
        handleFetch()
    }, [id, refetch])
    return (
        <div className='p-4'>
            <ImageGrid
                data={data}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                onDelete={onDelete}
                onAdd={onAdd}

            />
        </div>

    )
}




