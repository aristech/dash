'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import axios from 'axios'
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { OverlayPanel } from 'primereact/overlaypanel';
import CreatedAt from '../grid/CreatedAt'
import XLSXDownloadButton from '../exportCSV/Download'
import { setSelectedProducts } from '@/features/productsSlice'
import { setSelectedImpa } from '@/features/impaofferSlice'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import EmailTemplate from '../emails/EmailTemplate'


const ClientHolder = ({ NAME }) => {
    const [expandedRows, setExpandedRows] = useState(null);
   const [loading, setLoading] = useState({
        findoc: false,
        delete: false,
        grid: false,
    })
    const [statuses] = useState(['pending', 'done', 'rejected']);
    const [data, setData] = useState([])
    const [refetch, setRefetch] = useState({
        grid: false,
        holder: false,
        products: false,
    })



    const handleFetch = async () => {
        setLoading(prev => ({ ...prev, grid: true }))
        let res = await axios.post('/api/createOffer', { action: 'findClientHolder', clientName: NAME })
      
        setData(res.data.result)
        setLoading(prev => ({ ...prev, grid: false }))

    }



    useEffect(() => {
        handleFetch();
    }, [refetch.grid, NAME])



    const allowExpansion = (rowData) => {
        return rowData
    };


    const getSeverity = (value) => {
        switch (value) {
            case 'done':
                return 'warning';

            case 'rejected':
                return 'danger';

            default:
                return null;
        }
    };


    const statusEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"
                itemTemplate={(option) => {
                    return <Tag value={option} severity={getSeverity(option)}></Tag>;
                }}
            />
        );
    };

    const onRowEditComplete = async (e) => {
        let { newData, index } = e;
        setLoading(prev => ({ ...prev, grid: true }))
        let { data } = await axios.post('/api/createOffer', { action: 'updateStatus', status: newData.status, id: newData._id, TRDR: newData.TRDR, data: newData.holders })
        setLoading(prev => ({ ...prev, grid: false }))
        setRefetch(prev => ({ ...prev, grid: !prev.grid }))
    };



    const Actions = ({_id, holders, TRDR, SALDOCNUM, clientName, clientEmail, createdAt, num, FINCODE }) => {
        const op = useRef(null);
        const _products = []
        holders.map((holder) => {
            holder.products.map((product) => {
                _products.push({
                    "Προϊόν": product.NAME,
                    "Τιμή": product.PRICE,
                    "Ποσότητα": product.QTY1,
                    "Συνολική Τιμή": product.TOTAL_PRICE
                })

            })
        })
        const handleDelete = async () => {
            setLoading(prev => ({ ...prev, delete: true }))
            await axios.post('/api/createOffer', { action: 'deleteOffer', id: _id, TRDR: TRDR })
            setLoading(prev => ({ ...prev, delete: false }))
            setRefetch(prev => ({ ...prev, grid: !prev.grid }))
        }

        const handlePDF = async () => {
            
            setLoading(prev => ({ ...prev, pdf: true }))
            const {data} = await axios.post('/api/createPDF', {
                FINDOCTYPE: 'SALDOC',
                FINDOCNUM: SALDOCNUM,
                PRINTFORM: 1109
            })
           
            if(data.result) {
                window.open(data.result, "_blank")
            }
            setLoading(prev => ({ ...prev, pdf: true }))
        }

        const handleFinDoc = async () => {
            setLoading(prev => ({ ...prev, findoc: true }))
            let { data } = await axios.post('/api/createOffer', { action: 'createFinDoc', id: _id, TRDR: TRDR  })
            if(!data.success && data?.error){
                showError(data.error)
            
            }
            setLoading(prev => ({ ...prev, findoc: false }))
            setRefetch(prev => !prev)
        }
        return (
            <div className='flex justify-content-center'>
                <i className="pi pi-ellipsis-v pointer" style={{ fontSize: '1.1rem', color: 'blue' }} onClick={(e) => op.current.toggle(e)}></i>
                <OverlayPanel className='w-15rem' ref={op}>
                    <Button disabled={FINCODE} loading={loading.findoc} label="Εκ. Παραστατικού" severity='secondary' className='w-full mb-2' onClick={handleFinDoc} />
                    <Button loading={loading.delete} label="Διαγραφή" icon="pi pi-trash" severity='danger' className='w-full mb-2' onClick={handleDelete} />
                    <XLSXDownloadButton data={_products} fileName={`${clientName}.offer`} />
                    <div className='mt-2'>
                    <SendMultiOfferEmail
                        email={clientEmail}
                        products={_products}
                        name={clientName}
                        setRefetch={setRefetch}
                        id={_id}
                    />
                    </div>
                    <Button disabled={!FINCODE} className='w-full mt-2' severity='warning'  label="pdf" icon="pi pi-file-pdf" onClick={handlePDF} />
                </OverlayPanel>
            </div>


        )
    }

    const RowExpansionTemplate = ({ holders, _id, TRDR, discountedTotal, discount, totalPrice, FINCODE }) => {
        return <RowExpansionGrid 
            holders={holders} 
            documentID={_id} 
            setRefetch={setRefetch} 
            refetch={refetch} 
            TRDR={TRDR} 
            totalPrice={totalPrice}
            discountedTotal={discountedTotal}
            discount={discount}
            FINCODE={FINCODE}
            />
    }
    return (
        <>
            <DataTable
                loading={loading.grid}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={RowExpansionTemplate}
                value={data}
                paginator
                rows={4}
                rowsPerPageOptions={[4, 10, 20]}
                editMode="row"
                onRowEditComplete={onRowEditComplete}
                showGridlines
            >
                <Column expander={allowExpansion} style={{ width: '20px', textAlign: 'center' }} />
                <Column header="Όνομα Πελάτη" field="clientName" body={Client}></Column>
                <Column header="Kωδ. Παραστατικού" field="FINCODE" style={{ maxWidth: '90px' }}></Column>
                <Column header="Ημερομηνία Δημιουργίας" field="createdAt" body={CreatedAt}></Column>
                <Column  header="Δημιουργήθηκε Από" field="createdFrom"  body={CreatedFrom} style={{ width: '60px' }}></Column>
                <Column header="Status" field="status" body={Status} style={{ width: '160px' }} editor={(options) => statusEditor(options)}></Column>
                <Column header="Status Edit" rowEditor headerStyle={{ width: '50px' }} bodyStyle={{ textAlign: 'center' }}></Column>
                <Column headerStyle={{ width: '30px' }} bodyStyle={{ textAlign: 'end' }} body={Actions}></Column>
            </DataTable>
        </>
    )
}



const RowExpansionGrid = ({ holders, documentID, setRefetch, refetch, TRDR,  discountedTotal, discount, totalPrice, FINCODE }) => {

    const [newtotalPrice, setNewTotalPrice] = useState(null)
    const [newdiscount, setNewDiscount] = useState(0)
    const dispatch = useDispatch();
    const router = useRouter();
    const op = useRef(null);
    const [expandedRows, setExpandedRows] = useState(null);

    useEffect(() => {
        setNewDiscount(discount ? discount : 0)
    }, [])

    useEffect(() => {
        const handleFooterData = async () => {
            let { data } = await axios.post('/api/createOffer', { action: 'holdersTotalPrice', documentID: documentID })
            setNewTotalPrice(data.result)
        }
        handleFooterData();
    }, [refetch])



    const allowExpansion = (rowData) => {
        return rowData
    };

    const createImpaHolder = () => {
        dispatch(setSelectedProducts([]))
        dispatch(setSelectedImpa(null))
        router.push(`/dashboard/multi-offer/create-impa/${documentID}`)
    }

    const createHolder = () => {
        dispatch(setSelectedProducts([]))
        router.push(`/dashboard/multi-offer/create-plain-holder/${documentID}`)

    }

    const RowExpansionTemplate = ({ products, _id, name, isImpa, impaCode }) => {
        return (
            <SubRowExpansionGrid
                FINCODE={FINCODE}
                products={products}
                documentID={documentID}
                holderID={_id}
                isImpa={isImpa}
                impaCode={impaCode}
                TRDR={TRDR}
                refetch={refetch}
                setRefetch={setRefetch}
            />
        )
    }


    const RenderHolderActions = ({  _id, products }) => {
        const op = useRef(null);

        const deleteHolder = async () => {
            await axios.post('/api/createOffer', { action: 'deleteHolder', documentID: documentID, holderId: _id })
            setRefetch(prev => ({ ...prev, holder: !prev.holder }))
        }
        return (
            <div>
                <i className="pi pi-ellipsis-v pointer" style={{ fontSize: '1.1rem', color: 'blue' }} onClick={(e) => op.current.toggle(e)}></i>
                <OverlayPanel className='w-15rem' ref={op}>
                    <Button label="Διαγραφή" icon="pi pi-trash" severity='danger' className='w-full mb-2' onClick={deleteHolder} />
                    <XLSXDownloadButton data={products} fileName={`${products[0].clientName}.offer`} />
                </OverlayPanel>
            </div>
        )
    }

    const Footer = () => {
       
        const handleDiscount = (e) => {
            setNewDiscount(e.value)
        }

        const onValueChange = async () => {
            let { data } = axios.post('/api/createOffer', { action: 'totalDiscount', documentID: documentID, discount: newdiscount, totalPrice: newtotalPrice })
            setRefetch(prev => ({ ...prev, grid: !prev.grid }))

        }
        const handleRefresh = async () => {
            setRefetch(prev => ({ ...prev, grid: !prev.grid }))
        }
        return (
            <div className='flex align-items-center'>
                <div>
                    <div>
                        <span className='font-light'>Συνολική Τιμή: </span>
                        <span>{totalPrice}</span>
                    </div>
                    <div>
                        <span onClick={handleRefresh} className='cursor-pointer underline text-primary-700 font-medium'>ανανέωση τιμής</span>
                    </div>
                </div>
                <div className='ml-2 flex justify-content-center align-items-center'>
                    <div className='flex'>
                        <span className="p-input-icon-right">
                            <span className='ml-2 font-light'>Έκπτωση: </span>
                            <i className={`pi pi-check `} onClick={onValueChange} />
                            <InputNumber value={discount} onChange={handleDiscount} onValueChange={onValueChange} max={80} min={0} mode="decimal" maxFractionDigits={2} />
                        </span>
                    </div>
                    <div className='bg-surface-400 ml-2'>
                        <span className='font-light'>Τελική Τιμή:</span>
                        <span>{discountedTotal}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-2">
            <Button disabled={FINCODE} className='my-3' size="small" type="button" icon="pi pi-plus" label="Νέο Holder" onClick={(e) => op.current.toggle(e)} />
            <OverlayPanel ref={op}>
                <div className="">
                    <Button onClick={createImpaHolder} className='w-full mb-1' type="button" label="Με ΙMPA" severity='warning' />
                    <Button onClick={createHolder} className='w-full' type="button" label="Απλό Holder" />
                </div>
            </OverlayPanel>
           {holders.length > 0 ? (
             <DataTable
             footer={Footer}
             header="Holders"
             className='p-datatable-sm border-1 border-300'
             expandedRows={expandedRows}
             onRowToggle={(e) => setExpandedRows(e.data)}
             rowExpansionTemplate={RowExpansionTemplate}
             value={holders}
         >
             <Column expander={allowExpansion} style={{ width: '40px' }} />
             <Column header="Όνομα" field="name"></Column>
             <Column body={RenderHolderActions} style={{ width: '30px ' }}></Column>

         </DataTable>
           ) : (
            <p>Δεν υπάρχει Ηolder</p>
           )}
        </div>
    )
};







const SubRowExpansionGrid = ({ documentID, holderID, isImpa, impaCode, TRDR, refetch, setRefetch, FINCODE }) => {
    const [data, setData] = useState([])
    const toast = useRef(null);

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            let { data } = await axios.post('/api/createOffer', { action: 'findHolderProducts', documentID: documentID, holderID: holderID })

            let updateData = data.result.holders[0].products
            setData(updateData)
            setLoading(false)
        }
        fetch();
    }, [refetch])

    const onRemove = (MTRL) => {
        if(FINCODE) return;
        setLoading(true)
        let { data } = axios.post('/api/createOffer', { action: 'removeHolderItems', mtrl: MTRL, documentID: documentID, holderID: holderID })
        setRefetch(prev => ({ ...prev, products: !prev.products }))
    }
    const RemoveItem = ({ MTRL }) => {

        return (
            <div>
                <i  className="pi pi-trash pointer p-1" style={{ fontSize: '1rem', color: FINCODE ? 'grey' : '' }} onClick={() => onRemove(MTRL)}></i>
            </div>
        )
    }

    const TotalPrice = ({ TOTAL_PRICE }) => {
        return (
            <div>
                <p className='font-bold'>{TOTAL_PRICE + " €"}</p>
            </div>
        )
    }
    const Price = ({ PRICE }) => {
        return (
            <div>
                <p className='font-bold'>{PRICE + " €"}</p>
            </div>
        )
    }

    let sum = 0;
    let productSum = 0;
    data.map((product) => {
        sum += product.TOTAL_PRICE
    })
    data.map((product) => {
        productSum += product.QTY1
    })

    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
    }

    const footer = `Συνολο Προϊόντων: ${productSum}  /  Συνολο Τιμής: ${sum}€  `;

    const handleAddMore = () => {
        dispatch(setSelectedProducts([]))
        if (isImpa) {
            router.push(`/dashboard/multi-offer/add-more-to-impa/${holderID}/${impaCode}`)
        } else {
            router.push(`/dashboard/multi-offer/add-more-to-holder/${holderID}`)

        }
    }
    const Quantity = ({ QTY1, MTRL, PRICE, DISCOUNTED_PRICE }) => {
        const [quantity, setQuantity] = useState(QTY1)


        const handleQuantity = async () => {
            let { data } = await axios.post('/api/createOffer', {
                action: 'updateQuantity',
                quantity: quantity,
                price: PRICE,
                discountedPrice: DISCOUNTED_PRICE,
                documentID: documentID,
                holderID: holderID,
                MTRL: MTRL
            })
            setRefetch(prev => ({ ...prev, products: !prev.products }))
        }

        useEffect(() => {
            if (quantity === QTY1) return;
            handleQuantity();
        }, [quantity])
        return (
            <div>
                <InputNumber
                    disabled={FINCODE}
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
    const Discount = ({ MTRL, PRICE, QTY1, DISCOUNTED_PRICE, DISCOUNT }) => {

        const [value, setValue] = useState(0)

        const onValueChange = async () => {
            let { data } = await axios.post('/api/createOffer', {
                action: 'updateDiscount',
                discount: value,
                MTRL: MTRL,
                QTY1: QTY1,
                PRICE: PRICE,
                documentID: documentID,
                holderID: holderID,
                TRDR: TRDR,
            })
            if (!data.success && data?.message) {
                showError(data.message)
            }
            setRefetch(prev => ({ ...prev, products: !prev.products }))

        }



        useEffect(() => {
            setValue(DISCOUNT ? DISCOUNT : 0)


        }, [])

        const onChange = async (e) => {
            console.log(e.value)
            setValue(e.value)
        }
        return (
            <div className='flex'>
                <span className="p-input-icon-right">
                    <i className={`pi pi-check ${value == DISCOUNT ? 'text-500' : 'text-green-400'}`} onClick={onValueChange} />
                    <InputNumber disabled={FINCODE} value={value} onChange={onChange} onValueChange={onValueChange} max={80} min={0} mode="decimal" maxFractionDigits={2} />
                </span>
            </div>
        )
    }
    return (
        <div className='p-3'>
            <Toast ref={toast} />
            <Button disabled={FINCODE} className='my-3 bg-primary-400' size="small" label="προσθήκη" icon="pi pi-plus" onClick={handleAddMore} />
            <DataTable
                value={data}
                loading={loading}
                footer={footer}
            >
                <Column header="Όνομα Προϊόντος" field="NAME"></Column>
                <Column header="Τιμ. M" body={Price} style={{ width: '100px' }} field="PRICE"></Column>
                <Column header="%" style={{ width: '100px' }} field="MTRL" body={Discount}></Column>
                <Column header="Τιμ. Έκπ." style={{ width: '50px' }} field="DISCOUNTED_PRICE"></Column>
                <Column header="Πoσ." field="QTY1" body={Quantity} style={{ width: '100px' }}></Column>
                <Column header="ΣT" body={TotalPrice} style={{ width: '80px' }} field="TOTAL_PRICE"></Column>
                <Column body={RemoveItem} bodyStyle={{ textAlign: 'center' }} style={{ width: '30px' }}></Column>
            </DataTable>
        </div>
    )
}






const Status = ({ status }) => {
    let color;
    if (status === 'created') color = "bg-green-500"
    if (status === 'pending') color = "bg-green-500"
    if (status === 'sent') color = "bg-blue-500"
    if (status === 'done') color = "bg-orange-500"
    if (status === 'rejected') color = "bg-red-500"

    return (
        <div className='flex align-items-center '>

            <span className={`mt-1 ${color} border-circle`} style={{ width: '7px', height: '7px' }}>
            </span >
            <span className='ml-2 text-600'>{status.toUpperCase()}</span>
        </div>
    )
}



const Client = ({ clientName, clientEmail }) => {
    return (
        <div>
            <p className=''>{clientName}</p>
            <p style={{ fontSize: '13px' }} className='text-500'>{clientEmail}</p>
        </div>
    )
}

const CreatedFrom = ({ createdFrom }) => {
    return (
        <div className='flex align-items-center'>
            {createdFrom ? (
                <>
                    <i className="pi pi-user mr-1 mt-1 text-primary" style={{ fontSize: '12px' }}></i>
                    <span className="text-600">{createdFrom}</span>
                </>
            ) : null}

        </div>
    )
}



const SendMultiOfferEmail = ({ 
    email,  
    name, 
    products,
    setRefetch,
    id,
}) => {
   
  
    const finalSubmit = async (formData) => {
        try {
            const { data } = await axios.post('/api/createOffer', { 
                action: 'sendEmail', 
                products,
                formData,
                id,
            })
            console.log({data})
            setRefetch(prev => !prev)
            return data.message
        } catch (e) {
            console.error({e})
            return e.message
        }
        
    
    }


    return (
        <EmailTemplate
        handleSend={finalSubmit}
        email={email}
        subject={`Προσφορά σε πελάτη ${name}`}
        fileName={`${name}.offer`}
        message={`Καλησπέρα σας στον παρόν email θα βρείτε επισυναπτόμενο το αρχείο της προσφοράς. Στείλε το μας πίσω συμπληρωμένο με τα προϊόντα που έχετε αποδεχτεί. Ευχαριστούμε.`}
    />
    )
}


export default ClientHolder;