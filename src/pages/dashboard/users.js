'use client'
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import axios from 'axios';
import { FilterMatchMode} from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { AddDialog, EditDialog } from '@/GridDialogs/userDialog';
import UserRoleChip from '@/components/RoleChip';
import { useDispatch } from 'react-redux';
import { setGridRowData } from '@/features/grid/gridSlice';
import { Toast } from 'primereact/toast';
import GridIconTemplate from '@/components/grid/gridIconTemplate';
import { useSession } from 'next-auth/react';
import GridOverlay from '@/components/grid/GridOverlay';
import StepHeader from '@/components/StepHeader';
import { OverlayPanel } from 'primereact/overlaypanel';


export default function TemplateDemo() {
    const [editData, setEditData] = useState(null)
    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
   
    const [data, setData] = useState([])
    const dispatch = useDispatch();
    const toast = useRef(null);
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },

    });

    const role = session?.user?.user?.role
 

    const handleFetch = async () => {
    try {
        const resp = await axios.post('/api/user/apiUser', { action: 'findAll' })
        console.log(resp.data.result)
        setData(resp.data.result)
    } catch (error) {
        console.log(error)

    }
    }

    useEffect(() => {
        handleFetch();
    }, [])

    //Refetch on add edit:
    useEffect(() => {
        if (submitted) handleFetch()
    }, [submitted])



   
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
        let res = await axios.post('/api/user/apiUser', { action: 'delete', id: id })
        if(!res.data.success) return showError()
        handleFetch()
        showSuccess()
    }

    // CUSTOM TEMPLATES FOR COLUMNS
  

    const ActionBodyTemplate = (rowData) => {
            // <GridActions onDelete={onDelete} onEdit={editProduct} rowData={rowData} />
        const op = useRef(null);
        return (
            <div className='flex align-items-center justify-content-center'>
                <i className="pi pi-cog mr-2 cursor-pointer text-primary" style={{ fontSize: '13px' }} onClick={(e) => op.current.toggle(e)}></i>
                <OverlayPanel ref={op}>
                    <div className='flex flex-column'>
                        <Button label="Τροποποίηση" icon="pi pi-pencil" className='w-full mb-2' onClick={() => editProduct(rowData)} />
                        <Button onClick ={() => onDelete(rowData._id)} label="Διαγραφή" severity='danger' icon="pi pi-trash" className='w-full mb-2'  />
                    </div>
                </OverlayPanel>
            </div>
        )
    }


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
            <StepHeader text="Χρήστες" />
            {role === 'admin' ?  <Toolbar  left={leftToolbarTemplate} ></Toolbar> : null }
            <DataTable
                className='p-datatable-sm'
                header={header}
                value={data}
                paginator
                rows={20}
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
                showGridlines
                dataKey="_id"
                filters={filters}
                paginatorRight={true}
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                loading={loading}
                editMode="row"
                selectOnEdit
            >
                <Column field="firstName" header="'Ονομα" body={nameTemplate} ></Column>
                <Column field="lastName" header="Επώνυμο" sortable></Column>
                <Column field="details" body={gridDetails} header="Λεπτομέρειες" sortable></Column>
                <Column field="email" header="Email" sortable tableStyle={{ width: '5rem' }} body={emailTemplate}></Column>
                <Column field="createdAt"  body={userCreate} sortable header="Δημιουργήθηκε" tableStyle={{ width: '5rem' }}></Column>
                {/* <Column field="status"  sortable header="Status" tableStyle={{ width: '5rem' }} body={ActiveTempate}></Column> */}
                <Column field="role"  sortable header="Ρόλος" tableStyle={{ width: '5rem' }} body={(data) => UserRoleChip(data.role)}></Column>
               
                {role === 'admin' ? (
                    <Column body={ActionBodyTemplate } exportable={false} sortField={'delete'} bodyStyle={{ textAlign: 'center' }} style={{ width: '90px' }} ></Column>
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





const emailTemplate = (data) => {
    return (
        <div>  
            <GridIconTemplate 
                value={data.email} 
                icon="pi pi-envelope"
                color="#0d6efd"
            />
        </div>
    )
}
const nameTemplate = (data) => {
    return (
        <div>  
            <GridIconTemplate 
                value={data.firstName} 
                icon="pi pi-user"
                color="#0d6efd"
            />
        </div>
    )
}



const userCreate = ({createdAt}) => {
    return createdAt.split('T')[0]
}


const gridDetails = (data) => {
 
    return (
        <GridOverlay title="info">
              <DataTable
                value={[data]}
                rows={8}
                rowsPerPageOptions={[5, 10, 25, 50]}
                showGridlines
                dataKey="_id"
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                editMode="row"
            >
                <Column field="address.country" header="'Χώρα" ></Column>
                <Column field="address.city" header="Πόλη" ></Column>
                <Column field="address.address" header="Διεύθυνση" ></Column>
                <Column field="address.postalcode" header="Τ.Κ." ></Column>
                <Column field="phones.landline" header="Σταθερο Τηλέφωνο" ></Column>
                <Column field="phones.mobile" header="Κινητό" ></Column>
              
                

            </DataTable>
        </GridOverlay>
    )
}




