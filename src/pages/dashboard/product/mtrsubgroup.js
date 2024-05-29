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
import { AddDialog, EditDialog } from '@/GridDialogs/mtrsubgroupDialog';
import { useDispatch } from 'react-redux';
import { setGridRowData } from '@/features/grid/gridSlice';
import {  ActionDiv} from '@/componentsStyles/grid';
import GridActions from '@/components/grid/GridActions';
import DeletePopup from '@/components/deletePopup';
import { Toast } from 'primereact/toast';
import RegisterUserActions from '@/components/grid/GridRegisterUserActions';

import GridLogoTemplate from '@/components/grid/gridLogoTemplate';
import TranslateField from '@/components/grid/GridTranslate';
import { useSession } from 'next-auth/react';
import StepHeader from '@/components/StepHeader';



export default function Categories() {
    const [editData, setEditData] = useState(null)
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState([])
    const dispatch = useDispatch();
    const toast = useRef(null);
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const { data: session } =  useSession()
    let user = session?.user?.user;


    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    });
    //Set the toggled columns
    console.log(data)

    const handleFetch = async () => {
        let res = await axios.post('/api/product/apiSubGroup', { action: 'findAll' })
        console.log(res.data)
        setData(res.data.result)

    }

    useEffect(() => {
        handleFetch()
    }, [])



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
        const value = event.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
    };


   




    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Νέο" icon="pi pi-plus" severity="secondary" onClick={openNew} />
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

    const onDelete = async (id) => {
        let res = await axios.post('/api/product/apiSubGroup', { action: 'delete', id: id })
        if (!res.data.success) return showError()
        handleFetch()
        showSuccess()
    }

    // CUSTOM TEMPLATES FOR COLUMNS
    const logoTemplate = (data) => {
        return <GridLogoTemplate logo={data.subGroupIcon} />
    }
    const ImageTemplate = (data) => {
        return <GridLogoTemplate logo={data.subGroupImage} />
    }

     
    console.log({data})
   
    const actionBodyTemplate = (rowData) => {
        return (
        //     <GridActions onDelete={onDelete} onEdit={editProduct} rowData={rowData}/>
        <div>
            <i className="pi pi-pencil" style={{marginRight: '5px'}} onClick={() => editProduct(rowData)}></i>
        </div>
        )
    };

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Επιτυχής διαγραφή', life: 4000 });
    }
    const showError = () => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης', life: 4000 });
    }

    const dialogStyle = {
        marginTop: '10vh', // Adjust the top margin as needed
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',

    };

   

    return (
        <AdminLayout >
            <Toast ref={toast} />
            <StepHeader text="Υποομάδες" />
            <Toolbar  start={leftToolbarTemplate} ></Toolbar>
            <DataTable
                header={header}
                value={data}
                paginator
                rows={8}
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
                showGridlines
                dataKey="_id"
                filters={filters}
                paginatorRight={true}
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                loading={loading}
                editMode="row"
                className='p-datatable-sm'
                selectOnEdit
            >
                <Column field="subGroupIcon" header="Εικονίδιο" body={logoTemplate}  style={{ width: '50px' }}></Column>
                <Column field="subGroupImage" header="Φωτογραφία" body={ImageTemplate }  style={{ width: '50px' }}></Column>
                <Column field="group.groupName" header="Ομάδα" style={{ width: '120px' }} ></Column>
                <Column field="subGroupName" header="Όνομα Υποκατηγορίας"  ></Column>
                <Column field="englishName" header="Μετάφραση" style={{ width: '90px' }} ></Column>
                <Column field="updatedFrom"  header="Τροποποίηση Από" style={{ width: '90px' }} body={UpdatedFromTemplate}></Column>
                {user?.role === 'admin' ? (
                <Column body={actionBodyTemplate} exportable={false}  bodyStyle={{ textAlign: 'center' }} style={{width: '40px'}} ></Column>
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
        </AdminLayout >
    );
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




//The component for the nested grid:















