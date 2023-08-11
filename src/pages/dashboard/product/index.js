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
import { AddDialog, EditDialog } from '@/GridDialogs/manufacturersDialog';
import { useDispatch } from 'react-redux';
import { setGridRowData } from '@/features/grid/gridSlice';
import {ActionDiv } from '@/componentsStyles/grid';
import DeletePopup from '@/components/deletePopup';
import { Toast } from 'primereact/toast';
import RegisterUserActions from '@/components/grid/GridRegisterUserActions';
import { Paginator } from 'primereact/paginator';



export default function Product() {
    const [editData, setEditData] = useState(null)
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState([])
    const dispatch = useDispatch();
    const toast = useRef(null);
    const [lastId, setLastId] = useState(null)
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const onPageChange = (event) => {
        setPage(event.page + 1);
        setFirst(event.first);
        console.log('event.first')
        console.log(event.first)
        console.log('event.page')
        console.log(event.page)
        console.log(event)
        // setLimit(event.rows);
    };
    const handleFetch = async (page, limit) => {
        let res = await axios.post('/api/product/apiProduct', { action: 'findSoftoneProducts', page: page, limit: limit, id: lastId})
        console.log('res')
        console.log(res.data.result)
        console.log(lastId)
        setLastId(lastId )
        setData(res.data.result)
    }

    // useEffect(() => {
    //     handleFetch(page, limit)
    // }, [])

  
    useEffect(() => {
        console.log('use effect')
        console.log(page, limit)
        handleFetch(page, limit)
    }, [page, limit])



    //Refetch on add edit:
    useEffect(() => {
        console.log('submitted: ' + submitted)
        if (submitted) handleFetch()
    }, [submitted])




    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';

        return (
            <>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" value={value || ''} onChange={(e) => onGlobalFilterChange(e)} placeholder="Αναζήτηση" />
                </span>
            </>
        );
    };
    const header = renderHeader();

    const onGlobalFilterChange = (event) => {
        // setPage(1)
        // const value = event.target.value;
        // console.log('value')
        // console.log(value)
        // setSearch(value)
        // let _filters = { ...filters };
        // _filters['global'].value = value;

        // setFilters(_filters);
    };

    useEffect(() => {
        
        const searchFetch = async (value, page, limit) => {
            let res = await axios.post('/api/product/apiProduct', { action: 'search', query: value, page: page, limit: limit})
            setData(res.data.result)
        }

        searchFetch(search, page, limit)
        
    }, [search, page, limit])
 



    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Νέο" icon="pi pi-plus" severity="secondary" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <>
                {/* <SyncManufacturers
                refreshGrid={handleFetch}  
                addToDatabaseURL= '/api/product/apiManufacturers'
                />  */}
                {/* <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={() => console.log('export pdf')} /> */}
            </>
        );

    };


    //Edit:
    const editProduct = async (product) => {
        // console.log('edit product: ' + JSON.stringify(product))
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

    // const onDelete = async (id) => {

    //     let res = await axios.post('/api/product/apiManufacturers', { action: 'delete', id: id })
    //     if (!res.data.success) return showError()
    //     handleFetch()
    //     showSuccess()
    // }

    // CUSTOM TEMPLATES FOR COLUMNS
  
    const actionBodyTemplate = (rowData) => {
        return (
            <ActionDiv>
                <Button disabled={!rowData.status} style={{ width: '40px', height: '40px' }} icon="pi pi-pencil" onClick={() => editProduct(rowData)} />
                <DeletePopup onDelete={() => onDelete(rowData._id)} status={rowData.status} />
            </ActionDiv>
        );
    };

 

    const dialogStyle = {
        marginTop: '10vh', // Adjust the top margin as needed
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

    };


 
    return (
        <AdminLayout >
            <Toast ref={toast} />
            <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
                //  scrollable 
                //  scrollHeight="400px" 
                //  onScroll={onScroll}
                //  loading={loading}
                header={header}
                value={data}
                paginator
                rows={8}
                rowsPerPageOptions={[5, 10, 25, 50]}
                showGridlines
                dataKey="_id"
                filters={filters}
                // paginatorRight={true}
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                editMode="row"
                selectOnEdit
            >
                {/* <Column field="MTRL" header="Kατασκευαστής" sortable></Column> */}
               
                <Column field="name" header="Όνομα"></Column>
                <Column field="categoryName" header="Όνομα Προϊόντος" sortable></Column>
                <Column field="mtrgroups" header="Groups" sortable></Column>
              
            </DataTable>
            {/* <EditDialog
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
            /> */}
        </AdminLayout >
    );
}


const ActiveTempate = ({ status }) => {

    return (
        <div>
            {status ? (
                <Tag severity="success" value=" active "></Tag>
            ) : (
                <Tag severity="danger" value="deleted" ></Tag>
            )}

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
const CreatedFromTemplate = ({ createdFrom, createdAt }) => {
    return (
        <RegisterUserActions
            actionFrom={createdFrom}
            at={createdAt}
            icon="pi pi-user"
            color="#fff"
            backgroundColor='var(--green-400)'
        />

    )
}



//The component for the nested grid:

















