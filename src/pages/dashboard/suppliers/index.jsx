import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { Toast } from 'primereact/toast';
import StepHeader from '@/components/StepHeader';
import { useRouter } from 'next/router';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { EditDialog, AddDialog } from '@/GridDialogs/supplierDialog';
import { setGridRowData } from '@/features/grid/gridSlice';
import RegisterUserActions from '@/components/grid/GridRegisterUserActions';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useSelector } from 'react-redux';
import { setSelectedSupplier } from '@/features/supplierOrderSlice';
import { setGridData, setHeaders } from '@/features/catalogSlice';
import * as XLSX from 'xlsx';
import {  uploadBunnyFolderName } from '@/utils/bunny_cdn';
import SearchInput from "@/components/Forms/SearchInput";

export default function Page() {
    const { gridData } = useSelector(state => state.catalog)
    const fileInputRef = useRef(null);
    const router = useRouter();
    const toast = useRef(null);
    const dispatch = useDispatch();
    const [submitted, setSubmitted] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0)
    const [data, setData] = useState([])

    const [editData, setEditData] = useState(null)
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false)
    const [sortOffers, setSortOffers] = useState(0)
    const [expandedRows, setExpandedRows] = useState(null);
    const [searchTerm, setSearchTerm] = useState({
        name: '',
        afm: '',
        address: '',
        phone01: '',
        phone02: '',
        email: ''
    })
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 50,
        page: 1,
    });


    const onPage = (event) => {
        setlazyState(event);
    };


    const fetchClients = async () => {
        const isAnyFieldNotEmpty = Object.values(searchTerm).some(value => value == '');
        if (!isAnyFieldNotEmpty) {
            setLoading(true)
        }

        let { data } = await axios.post('/api/suppliers', {
            action: "fetchAll",
            skip: lazyState.first,
            limit: lazyState.rows,
            searchTerm: searchTerm,
            sortOffers: sortOffers,
        })
        setData(data.result)
        setTotalRecords(data.totalRecords)
        setLoading(false)

    }


    useEffect(() => {
        (async () => {
            await fetchClients();
        })()
    }, [
        lazyState.rows,
        lazyState.first,
        searchTerm,
        submitted,
        sortOffers
    ])




    const allowExpansion = (rowData) => {
        return rowData

    };


    //Add product
    const openNew = () => {
        setSubmitted(false);
        setAddDialog(true);
    };

    //Close Dialogs:
    const hideDialog = () => {
        setEditDialog(false);
        setAddDialog(false);
    };




    const rowExpansionTemplate = (data) => {
        return (
            <RowExpansionTemplate supplierID ={data._id}/>
        )
    }


    const onSort = () => {
        setSortOffers(prev => {
            if (prev === 0) return 1;
            if (prev === 1) return -1;
            if (prev === -1) return 0;
        })
    }




    const editProduct = async (product) => {
        setSubmitted(false);
        setEditDialog(true)
        dispatch(setGridRowData(product))
    };

    const newOrder = async (supplier) => {
        dispatch(setSelectedSupplier(supplier))
        let email = supplier.EMAIL || 'no-email'
          await  router.push(`/dashboard/suppliers/chooseProducts/${supplier.TRDR}/${supplier.NAME}/${email}/${supplier.minOrderValue}}`)
    }

    const onUploadClick = () => {
        fileInputRef.current.click()
    }




    const handleFileUpload = async (e, rowData) => {
        setFileLoading(true)
        let fileName = e.target.files[0].name
        let save = await axios.post('/api/suppliers', { action: 'saveCatalog', catalogName: fileName, id: rowData._id })

        dispatch(setSelectedSupplier(rowData))
        const reader = new FileReader();
        
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = async (e) => {
            const data = e.target.result;
            await uploadBunnyFolderName(data, fileName, 'catalogs')
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);
            dispatch(setGridData(parsedData))
            router.push('/dashboard/catalogs/upload-catalog')
           
        };
    };



    const LeftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button  label="Νέο" icon="pi pi-plus" severity="secondary" onClick={openNew} />
            </div>
        )
    }

    const handleSearch = (e) => {
        const { name, value } = e.target;
        setSearchTerm(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    return (
        <AdminLayout >
            <Toast ref={toast} />
            <StepHeader text="Προμηθευτές" />
            <Toolbar start={LeftToolbarTemplate}></Toolbar>
            <DataTable
                lazy
                totalRecords={totalRecords}
                first={lazyState.first}
                onPage={onPage}
                rows={lazyState.rows}
                size="small"
                value={data}
                paginator
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
                dataKey="_id"
                paginatorRight={true}
                loading={loading}
                filterDisplay="row"
                showGridlines
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
            >
                <Column bodyStyle={{ textAlign: 'center' }} expander={allowExpansion} style={{ width: '20px' }} />
                <Column
                    body={(rowData) => (
                        <ActionTemplate
                            rowData={rowData}
                            onUploadClick={onUploadClick}
                            handleFileUpload={handleFileUpload}
                            fileInputRef={fileInputRef}
                            fileLoading={fileLoading}
                            newOrder={newOrder}
                            editProduct={editProduct}


                        />
                    )}
                    style={{ width: '50px' }}
                >
                </Column>
                <Column
                    body={(rowData) => (
                        <ShowOffers
                           ORDERSTATUS={rowData.ORDERSTATUS}
                            TRDR={rowData.TRDR}
                        />

                    )}
                    filter showFilterMenu={false}
                    filterElement={() => (
                        <FilterOffers
                            onSort={onSort}
                            sortOffers={sortOffers}
                        />

                    )}
                    header="Order Status"
                    style={{ minWidth: '70px' }}>

                </Column>
                <Column
                    field="NAME"
                    filter
                    showFilterMenu={false}
                    body={NameTemplate}
                    header="Ονομα"
                    filterElement={() => {
                        return <SearchInput
                            name={"name"}
                            value={searchTerm.name}
                            handleSearch={handleSearch}
                        />
                    }}
                >

                </Column>
                <Column
                    field="AFM"
                    filter
                    showFilterMenu={false}
                    header="ΑΦΜ"
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name={"afm"}
                            value={searchTerm.afm}
                            handleSearch={handleSearch}
                        />
                    }}
                >

                </Column>
                <Column
                    field="ADDRESS"
                    filter
                    showFilterMenu={false}
                    header="Διεύθυνση"
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name="address"
                            value={searchTerm.address}
                            handleSearch={handleSearch}
                        />
                    }}
                >

                </Column>
                <Column
                    field="EMAIL"
                    filter
                    showFilterMenu={false}
                    header="Email"
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name="email"
                            value={searchTerm.email}
                            handleSearch={handleSearch}
                        />
                    }}
              >
                </Column>
                <Column
                    field="PHONE01"
                    header="Τηλέφωνο"
                    filter
                    showFilterMenu={false}
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name="phone01"
                            value={searchTerm.phone01}
                            handleSearch={handleSearch}
                        />
                    }}
                     >

                </Column>
                <Column
                    field="PHONE02"
                    header="Τηλέφωνο 2"
                    filter
                    showFilterMenu={false}
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name="phone02"
                            value={searchTerm.phone02}
                            handleSearch={handleSearch}
                        />
                    }}
                     >

                </Column>
                <Column
                    field="ZIP"
                    style={{ width: '50px' }}
                    header="Ταχ.Κώδικας" >

                </Column>
                <Column
                    field="updatedFrom"
                    header="Ανανέωση Από"
                    body={UpdatedFromTemplate}
                    style={{ width: '90px' }}>
                </Column>

            </DataTable>
            <EditDialog
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

        </AdminLayout >
    );
}

const RowExpansionTemplate = ({  supplierID }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)   
    const [refetch, setRefetch] = useState(false)
    const router = useRouter();

    const handleFetch  = async () => {
        setLoading(true)
        let  {data} = await axios.post('/api/suppliers', {action: "findSuppliersBrands", supplierID:  supplierID})
        setData(data.result.brands)
        setLoading(false)
        

    }

    const handleDelete  = (brandID) => {
        let {data} = axios.post('/api/suppliers', {action: "deleteBrandFromSupplier", supplierID: supplierID, brandID: brandID})
        setRefetch(prev => !prev)
    }


    useEffect(() => {
        handleFetch();
    }, [refetch])

    
    const ExpansionActions = ({_id}) => {
        return (
            <div>
                <i onClick={() => handleDelete(_id)}  className="pi pi-trash cursor-pointer text-red-500" style={{ fontSize: '1rem' }}></i>
            </div>
        )
    }

   
    return (
        <div className='p-3 w-6'>
            <Button
                label="Προσθήκη Μάρκας" 
                icon="pi pi-plus" 
                severity='secondary' 
                className='mb-2' 
                onClick={() => router.push(`/dashboard/suppliers/add-brand/${supplierID}`)}
            />
            <DataTable
                loading={loading}
                style={{maxWidth: '30vw'}}
                size="small"
                value={data}
                paginator
                rows={8}
                rowsPerPageOptions={[5, 10, 25, 50]}
                showGridlines
                paginatorRight={true}

            >
                <Column field="softOne.NAME" header="Ονομα" ></Column>
                <Column body={ExpansionActions}  style={{ width: '40px' }}></Column>
            </DataTable>

        </div>

    )
}


const ActionTemplate = ({
                            rowData,
                            onUploadClick,
                            handleFileUpload,
                            fileInputRef,
                            fileLoading,
                            newOrder,
                            editProduct,
                        }) => {
    const op = useRef(null);
    return (
        <div className="flex align-items-center justify-content-center">
            <i
                className="pi pi-cog mr-2 cursor-pointer text-primary"
                style={{ fontSize: "12px" }}
                onClick={(e) => op.current.toggle(e)}
            ></i>
            <OverlayPanel ref={op}>
                <div className="flex flex-column">
                    <Button
                        label="Τροποποίηση Προμηθευτή"
                        icon="pi pi-pencil"
                        className="w-full mb-2"
                        onClick={() => editProduct(rowData)}
                    />
                    <Button
                        disabled={rowData?.ORDERSTATUS}
                        label="ΝΕΑ Παραγγελία"
                        severity="success"
                        icon="pi pi-plus"
                        className="w-full mb-2"
                        onClick={() => newOrder(rowData)}
                    />

                    <div className="upload_btn">
                        <input
                            className="hide"
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => handleFileUpload(e, rowData)}
                        />
                        <Button
                            className="w-full"
                            severity="warning"
                            loading={fileLoading}
                            onClick={onUploadClick}
                            label="Ανέβασμα τιμοκατάλογου"
                            icon="pi pi-plus"
                        ></Button>
                    </div>
                </div>
            </OverlayPanel>
        </div>
    );
};


const ShowOffers = ({ ORDERSTATUS,  TRDR }) => {
    const router = useRouter();
    const handleClick = () => {
        router.push(`/dashboard/suppliers/order/${TRDR}`)
    }
    if (ORDERSTATUS) {
        return (
            <div className='flex cursor-pointer align-items-center justify-content-center p-0' onClick={handleClick}>
                <div className={`bg-green-600  border-round mr-1 mt-1 `} style={{ width: '4px', height: '4px' }}></div>
                <span className='font-xm text-600' style={{ fontSize: '10px' }}>OFFERS</span>

            </div>
        )
    }


}

const FilterOffers = ({onSort, sortOffers}) => {
    return (
        <div>
            <div className='ml-3'>
                {sortOffers === 0 ? (<i className="pi pi-sort-alt" onClick={onSort}></i>) : null}
                {sortOffers === 1 ? (<i className="pi pi-sort-amount-up" onClick={onSort}></i>) : null}
                {sortOffers === -1 ? (<i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>) : null}
            </div>
        </div>
    )
}



//COLUMN TEMPLATES:
const NameTemplate = ({ NAME }) => {
    return (
        <div className='flex align-items-center'>
            <span>{NAME}</span>
        </div>

    )
}



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





