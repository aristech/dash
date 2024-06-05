import React, { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import {  useDispatch } from 'react-redux'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import axios from 'axios'
import StepHeader from '@/components/StepHeader'
import { useRouter } from 'next/router';
import { setSelectedProducts } from '@/features/productsSlice';
import CreatedAt from '@/components/grid/CreatedAt'
import { OverlayPanel } from 'primereact/overlaypanel';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import AdminLayout from '@/layouts/Admin/AdminLayout'
import EmailTemplate from '@/components/emails/EmailTemplate'

const PendingOrders = ({ id }) => {
    const [data, setData] = useState([])
    const toast = useRef(null);
    const [refetch, setRefetch] = useState(false)
    const [loading, setLoading] = useState(false)
    const [expandedRows, setExpandedRows] = useState(null);
    


    const allowExpansion = (rowData) => {
        return rowData
    };

    const handleFetch = async () => {
        setLoading(true)
        let { data } = await axios.post('/api/createSmallOrder', { action: 'getOrders'})
        setData(data.result)
        setLoading(false)
    }

    useEffect(() => {
        handleFetch();
    }, [refetch, id])



    const Actions = ({ supplierName, supplierEmail,TRDR, PURDOCNUM, _id }) => {
        const op = useRef(null);
        const onBulletsClick = (e) => {
            op.current.toggle(e)
        }

        const handleDelete = async () => {
            await axios.post('/api/createSmallOrder', {action: 'deleteOrder', id: _id})
            setRefetch(prev => !prev)
        }

        const handleSubmit = async () => {
            let {data} = await axios.post('/api/createSmallOrder', {action: 'issueFinDoc', id: _id, TRDR: TRDR})
            console.log(data)
            setRefetch(prev => !prev)
        }
        return (
            <div>
                <i className="pi pi-ellipsis-v pointer" style={{ fontSize: '1.1rem', color: 'blue' }} onClick={onBulletsClick}></i>
                <OverlayPanel className='w-15rem' ref={op}>
                    <Button disabled={PURDOCNUM} className='w-full' severity='secondary' label='Εκ. Παραστατικού' onClick={handleSubmit} />
                    <div className='mt-2'>
                    <SendSmallOrderEmail
                        disabled={!PURDOCNUM}
                        email={supplierEmail}
                        name={supplierName}
                        id={_id}
                        setRefetch={setRefetch}
                    />
                    </div>
                    <Button onClick={handleDelete} className='mt-2 w-full' severity='danger' label="Διαγραφή" icon="pi pi-trash"/>
                </OverlayPanel>

            </div>
        )
    }

    const RowExpansionTemplate = ({ products, NAME, supplierEmail, _id,  PURDOCNUM }) => {
        return (
            <RowExpansionGrid 
                id={_id}
                products={products} 
                setRefetch={setRefetch}
                NAME={NAME} 
                supplierEmail={supplierEmail} 
                PURDOCNUM={PURDOCNUM}
            />
        )
    }

    console.log({data})
 
 
    return (
        <AdminLayout>
              <div className='mt-4 mb-5'>
            <Toast ref={toast} />
            <StepHeader text="Ενεργή Παραγγελία" />
                  <DataTable
                  loading={loading}
                  expandedRows={expandedRows}
                  onRowToggle={(e) => setExpandedRows(e.data)}
                  rowExpansionTemplate={RowExpansionTemplate}
                  value={data}
                  editMode="row"
                  showGridlines

              >
                  <Column expander={allowExpansion} style={{ width: '5rem' }} />
                  <Column header="Όνομα προμηθευτή" field="supplierName"></Column>
                  <Column header="Κωδικός Παρ." style={{ width: '150px' }} field="PURDOCNUM"></Column>
                  <Column header="Email" field="supplierEmail"></Column>
                  <Column header="Κατάσταση" field="status"></Column>
                  <Column header="Ημερομ. Δημ" style={{minWidth: '250px'}} body={CreatedAt}></Column>
                  <Column header="Aποστολή" body={Actions} style={{ width: "120px" }} bodyStyle={{ textAlign: 'center' }}></Column>
              </DataTable>
        </div>
        </AdminLayout>
      
    )
}





const RowExpansionGrid = ({ products, id,  PURDOCNUM}) => {
    const [state, setState] = useState({
        products: [],
        total_cost: 0,
        loading: false,
        refetch: false,
    })
    const router = useRouter();
    const dispatch = useDispatch()


    const handleFetch = async () => {
        setState(prev => ({ ...prev, loading: !prev.loading }))
        let { data } = await axios.post('/api/createSmallOrder', { action: 'getProducts', id: id})
        setState(prev => ({ 
            ...prev, loading: !prev.loading, 
            products: data.result.products, total_cost: 
            data.result.total_cost 
        }))

    }



    useEffect(() => {
        handleFetch();
    }, [state.refetch, id])

    const onAddMore = () => {
        dispatch(setSelectedProducts([]))
        router.push(`/dashboard/suppliers/add-more-sm-bucket/${id}`)
    }

   

    const Footer = () => {
        let items = products.map(product => product.QTY1).reduce((a, b) => a + b, 0)
        return (
            <div className='flex justify-content-between align-items-center p-2 w-full'>
                <div>
                    <Button disabled={PURDOCNUM} size="small" icon={'pi pi-plus'} severity={"secondary"} className="p-button-sm  mr-2" onClick={onAddMore} />
                </div>
                <div className='flex'>
                    <div className='mr-3'>
                        <span className='text-500 mr-1'>{`TOTAL ITEMS:`}</span>
                        <span>{items}</span>
                    </div>
                    <div className='mr-3'>
                        <div>
                            <span className='text-500 mr-1'>{`TOTAL PRICE:`}</span>
                            <span>{` ${state.total_cost} €`}</span>
                        </div>
                    </div>
                </div>

            </div>
        )

    }
    const Quantity = ({ QTY1, MTRL,  }) => {
        const [quantity, setQuantity] = useState(QTY1)

        const handleQuantity = async () => {
            setState(prev => ({ ...prev, loading: !prev.loading }))
            const {data} = await axios.post('/api/createSmallOrder', {action: 'updateQuantity', QTY1: quantity, MTRL: MTRL, id: id})
            setState(prev => ({ ...prev, refetch: !prev.refetch, loading: !prev.loading }))
        }

        useEffect(() => {
            if (quantity === QTY1) return;
            handleQuantity();
        }, [quantity])
        return (
            <div>
                <InputNumber
                    disabled={PURDOCNUM}
                    value={quantity}
                    size='small'
                    min={0}
                    onValueChange={(e) => setQuantity(e.value)}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    inputStyle={{ width: '70px', textAlign: 'center' }}
                />
            </div>
        )
    }

    const Delete = ({ MTRL}) => {
        const handleDelete = async () => {
            if(PURDOCNUM) return;
            await axios.post('/api/createSmallOrder', {action: 'deleteProduct', id: id, MTRL: MTRL})
            setState(prev => ({ ...prev, refetch: !prev.refetch }))
        }
        return (
            <div>
                <i onClick={handleDelete} className="pi pi-trash cursor-pointer" style={{ fontSize: '0.9rem', color: PURDOCNUM ? 'grey' : 'red' }}></i>
            </div>
        )
    }
    
    return (
        <div className="p-2">
            <p className='mb-3 font-bold ml-1'>Προϊόντα Παραγγελίας</p>
            <DataTable
                disabled={PURDOCNUM}
                laoding={state.loading}
                className='border-1 border-300'
                value={state.products}
                footer={Footer}
            >
                <Column header="Όνομα" field="NAME"></Column>
                <Column header="COST" style={{ width: '110px' }} field="COST" body={Cost}></Column>
                <Column header="QT" style={{ width: '60px' }} field="QTY1" body={Quantity}></Column>
                <Column header="TOTAL" style={{ width: '100px' }} body={TotalTemplate} field="TOTAL_COST"></Column>
                <Column style={{ width: '50px' }} body={Delete}></Column>
            </DataTable>
        </div>
    )
};


const Cost = ({COST}) => {
    return (
        <div>
            <span className='font-bold'>{COST.toFixed(2) + " €"}</span>
        </div>
    )

}

const TotalTemplate = ({ TOTAL_COST }) => {
    return (
        <div>
            <span className='font-bold'>{TOTAL_COST.toFixed(2) + "€"}</span>
        </div>
    )
}
const SendSmallOrderEmail = ({ 
    email,  
    name, 
    setRefetch,
    id,
    disabled,
}) => {
   
  
    const finalSubmit = async (formData) => {
        try {
            const { data } = await axios.post('/api/createSmallOrder', 
            { 
                action: 'sentEmail',
                formData,
                id
            })
            setRefetch(prev => !prev)
            return data.message
        } catch (e) {
            return e.message
        }
    }


    return (
        <EmailTemplate
        disabled={disabled}
        handleSend={finalSubmit}
        email={email}
        subject= {`Παραγγελία στον προμηθευτή ${name}`} 
        fileName={`kollers.order`}
        message={`Καλησπέρα σας στον παρόν email θα βρείτε επισυναπτόμενο το αρχείο της προσφοράς. Στείλε το μας πίσω συμπληρωμένο με τα προϊόντα που έχετε αποδεχτεί. Ευχαριστούμε.`}
    />
    )
}



export default PendingOrders;