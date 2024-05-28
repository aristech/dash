import React, {useState, useEffect, useRef, useReducer} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import axios from 'axios';
import {Tag} from 'primereact/tag';
import {FilterMatchMode} from 'primereact/api';
import {InputText} from 'primereact/inputtext';
import {Toolbar} from 'primereact/toolbar';
import {AddDialog, EditDialog} from '@/GridDialogs/mtrgroupDialog';
import {useDispatch} from 'react-redux';
import {setGridRowData} from '@/features/grid/gridSlice';
import {SubGridStyles} from '@/componentsStyles/grid';
import GridActions from '@/components/grid/GridActions';
import {Toast} from 'primereact/toast';
import RegisterUserActions from '@/components/grid/GridRegisterUserActions';
import {useSession} from 'next-auth/react';

import GridLogoTemplate from '@/components/grid/gridLogoTemplate';
import StepHeader from '@/components/StepHeader';
import {EditDialog as SubGroupEdit} from '@/GridDialogs/mtrsubgroupDialog';
import {setSubmitted} from "@/features/productsSlice";
import {GroupDialog} from "@/GridDialogs/mtrgroupDialog";

const dialogStyle = {
    marginTop: '10vh', // Adjust the top margin as needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',

};


export default function Groups() {

    const [dialog, setDialog] = useState({
        state: false,
        isEdit: false
    })

    const [editData, setEditData] = useState(null)

    const [editDialog, setEditDialog] = useState(false);
    const [addDialog, setAddDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState([])
    const dispatch = useDispatch();
    const toast = useRef(null);
    const [expandedRows, setExpandedRows] = useState(null);
    const [loading, setLoading] = useState(false);
    const {data: session} = useSession()
    let user = session?.user?.user;

    const [filters, setFilters] = useState({
        global: {value: null, matchMode: FilterMatchMode.CONTAINS},

    });

    const handleFetch = async () => {
        setLoading(true);
        let res = await axios.post('/api/product/apiGroup', {action: 'findAll'})
        setData(res.data.result)
        setLoading(false);
    }

    useEffect(() => {
        handleFetch()
    }, [])


    //Refetch on add edit:
    useEffect(() => {
        if (submitted) handleFetch()
    }, [submitted])


    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';
        return (
            <>
                <span className="p-input-icon-left">
                    <i className="pi pi-search"/>
                    <InputText type="search" value={value || ''} onChange={(e) => onGlobalFilterChange(e)}
                               placeholder="Αναζήτηση"/>
                </span>
            </>
        );
    };
    const header = renderHeader();

    const onGlobalFilterChange = (event) => {
        const value = event.target.value;
        let _filters = {...filters};

        _filters['global'].value = value;
        setFilters(_filters);
    };


    const allowExpansion = (rowData) => {
        return rowData

    };


    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Νέο" icon="pi pi-plus" severity="secondary" onClick={openNew}/>
            </div>
        );
    };


    const editProduct = async (product) => {
        setSubmitted(false);
        // setEditDialog(true)
        dispatch(setGridRowData(product))
        setDialog(prev => ({...prev, state: true, isEdit: true}))
    };

    //Add product
    const openNew = () => {
        setSubmitted(false);
        setDialog(prev => ({...prev, state: true, isEdit: false}))
        // setAddDialog(true);
    };


    const hideDialog = () => {
        // setEditDialog(false);
        // setAddDialog(false);
        setDialog((prev) => ({...prev, state: false, isEdit: false}))
    };

    const onDelete = async (id) => {
        let res = await axios.post('/api/product/apiMarkes', {action: 'delete', id: id})
        if (!res.data.success) return showError()
        handleFetch()
        showSuccess()
    }

    const logoTemplate = (data) => {
        return <GridLogoTemplate logo={data.groupIcon}/>
    }


    const imageTemplate = (data) => {
        return <GridLogoTemplate logo={data.groupImage}/>
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <i className="pi pi-pencil cursor-pointer" onClick={() => editProduct(rowData)}></i>
            </div>
        )
    };

    const showSuccess = () => {
        toast.current.show({severity: 'success', summary: 'Success', detail: 'Επιτυχής διαγραφή', life: 4000});
    }
    const showError = () => {
        toast.current.show({severity: 'error', summary: 'Error', detail: 'Αποτυχία ενημέρωσης βάσης', life: 4000});
    }


    const RowExpansionTemplate = (data) => {
        return <RowExpansionGrid id={data._id}/>
    }


    return (
        <AdminLayout>
            <Toast ref={toast}/>
            <StepHeader text="Oμάδες"/>
            <Toolbar start={leftToolbarTemplate}></Toolbar>
            <DataTable
                header={header}
                value={data}
                paginator
                rows={8}
                rowsPerPageOptions={[20, 50, 100, 200, 500]}
                showGridlines
                rowExpansionTemplate={RowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                dataKey="_id"
                filters={filters}
                paginatorRight={true}
                removableSort
                onFilter={(e) => setFilters(e.filters)}
                //edit:
                size="small"
                loading={loading}
                editMode="row"
                selectOnEdit
            >
                <Column bodyStyle={{textAlign: 'center'}} expander={allowExpansion} style={{width: '20px'}}/>
                <Column field="groupIcon" header="Εικονίδιο" body={logoTemplate} style={{width: '50px'}}></Column>
                <Column field="groupImage" header="Φωτογραφία Ομάδας" body={imageTemplate}
                        style={{width: '50px'}}></Column>
                <Column field="category.categoryName" header="Κατηγορία"></Column>
                <Column field="groupName" header="Όνομα Ομάδας"></Column>
                <Column field="englishName" header="Μετάφραση"></Column>

                {/* <Column field="createdFrom" sortable header="createdFrom" style={{ width: '90px' }} body={CreatedFromTemplate}></Column> */}
                <Column field="updatedFrom" sortable header="Τροποποιήθηκε Από" style={{width: '90px'}}
                        body={UpdatedFromTemplate}></Column>
                {/* <Column field="status" sortable header="Status" style={{ width: '90px' }}  bodyStyle={{ textAlign: 'center' }}  body={ActiveTempate}></Column> */}
                {user?.role === 'admin' ? (
                    <Column body={actionBodyTemplate} exportable={false} sortField={'delete'}
                            bodyStyle={{textAlign: 'center'}} style={{width: '40px'}}></Column>
                ) : null}


            </DataTable>
            {/*<EditDialog*/}
            {/*    style={dialogStyle}*/}
            {/*    data={editData}*/}
            {/*    setData={setEditData}*/}
            {/*    dialog={editDialog}*/}
            {/*    setDialog={setEditDialog}*/}
            {/*    hideDialog={hideDialog}*/}
            {/*    setSubmitted={setSubmitted}*/}

            {/*/>*/}
            {/*<AddDialog*/}
            {/*    dialog={addDialog}*/}
            {/*    setDialog={setAddDialog}*/}
            {/*    hideDialog={hideDialog}*/}
            {/*    setSubmitted={setSubmitted}*/}
            {/*/>*/}
            <GroupDialog
                isEdit={dialog.isEdit}
                dialog={dialog.state}
                hideDialog={hideDialog}
                setSubmitted={setSubmitted}
            />
        </AdminLayout>
    );
}


const UpdatedFromTemplate = ({updatedFrom, updatedAt}) => {
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
const RowExpansionGrid = ({id}) => {
    const dispatch = useDispatch()
    const {data: session} = useSession()
    let user = session?.user?.user;
    const [editDialog, setEditDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false);
    const [addDialog, setAddDialog] = useState(false);

    const handleFetch = async () => {
        setLoading(true);
        let res = await axios.post('/api/product/apiCategories', {action: 'findSubGroups', groupId: id})
        setData(res.data.result)
        setLoading(false);
    }

    useEffect(() => {
        handleFetch()
    }, [submitted])

    const logoTemplate = (data) => {
        return <GridLogoTemplate logo={data.subGroupIcon}/>
    }

    const editProduct = async (product) => {
        setEditDialog(true)
        setSubmitted(false);
        dispatch(setGridRowData(product))
    };


    const hideDialog = () => {
        setEditDialog(false);
    };

    const openNew = () => {
        setSubmitted(false);
        setAddDialog(true);
    };

    const Actions = (product) => {
        return (
            <div>
                <i className="pi pi-pencil cursor-pointer" onClick={() => editProduct(product)}></i>
            </div>
        )
    }
    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Νέο" icon="pi pi-plus" severity="secondary" onClick={openNew}/>
            </div>
        );
    };

    return (
        <SubGridStyles>
            <span className="subgrid-title">Subgroups:</span>
            <div className="data-table">
                <Toolbar start={leftToolbarTemplate}></Toolbar>

                <DataTable
                    value={data}
                    loading={loading}
                    showGridlines
                    dataKey="_id"
                    removableSort
                    rows={8}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    paginator
                >
                    <Column field="subGroupIcon" body={logoTemplate} header="Εικονίδιο"
                            style={{width: '50px'}}></Column>
                    <Column field="subGroupName" header="Όνομα Υποομάδας"></Column>
                    <Column field="englishName" header="Μετάφραση"></Column>
                    <Column field="updatedFrom" sortable header="Τροποποιήθηκε Από" tableStyle={{width: '5rem'}}
                            body={UpdatedFromTemplate}></Column>
                    {user?.role === 'admin' ? (
                        <Column body={Actions} exportable={false} bodyStyle={{textAlign: 'center'}}
                                style={{width: '100px'}}></Column>
                    ) : null}
                </DataTable>
            </div>
            < SubGroupEdit
                dialog={editDialog}
                setDialog={setEditDialog}
                hideDialog={hideDialog}
                setSubmitted={setSubmitted}

            />
        </SubGridStyles>
    );
};















