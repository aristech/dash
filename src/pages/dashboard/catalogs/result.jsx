import React, {useEffect, useState} from 'react'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Button} from 'primereact/button'
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';
import StepHeader from '@/components/StepHeader';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import {useRouter} from 'next/router';
import {Toolbar} from 'primereact/toolbar';
import XLSXDownloadButton from '@/components/exportCSV/Download';
import {VirtualScroller} from 'primereact/virtualscroller';
import Link from 'next/link';
import {Dialog} from 'primereact/dialog';

const StepshowData = () => {
    const [returnedProducts, setReturnedProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const {gridData, attributes, mongoKeys, newData,} = useSelector((state) => state.catalog)
    const [resultData, setResultData] = useState([])
    const router = useRouter()
    const [visible, setVisible] = useState(false)


    useEffect(() => {
        if (gridData === null) return;
        //Create a new set of data only for the selected columns.
        //Replace the old key with the newly selected key:
        const _newData = gridData.map(row => {
            const newRow = mongoKeys.reduce((acc, keyObj) => {
                if (keyObj.related !== 0) {
                    acc[keyObj.related] = row[keyObj.oldKey];
                }
                return acc;
            }, {});
            // Include the attributes:
            attributes.forEach(attribute => {
                newRow[attribute.name] = row[attribute.oldKey];
            });
            return newRow;

        })
        setResultData(_newData)


    }, [gridData, attributes, mongoKeys, newData])


    const footerContent = (
        <div>
            <Button
                label="Ακύρωση"
                icon="pi pi-times"
                onClick={() => setVisible(false)}
                className="p-button-text"/>

        </div>
    );
    return (
        <AdminLayout>
            <StepHeader text="Τελική μορφή Αρχείου"/>
            <Link
                href="#"
                className="text-blue-500 cursor-pointer my-2 underline inline-block"
                onClick={(e) => {
                    setVisible(true)
                }}
            >
                Δείτε την αντιστοίχιση των κλειδιών
            </Link>
            <Dialog
                visible={visible}
                modal
                header={'Κλειδιά'}
                footer={footerContent}
                style={{width: '25rem', height: '25rem', overflow: 'auto'}}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}>
                <div className="mb-6">
                    <h3 className="text-lg">Custom Attributes:</h3>
                    {attributes.map((attribute, index) => {
                        return (
                            <div className="my-3" key={index}>
                                <p className="text-sm">
                                    Αρχικό Κλειδί: <strong>{attribute.oldKey}</strong>
                                </p>
                                <p className="text-sm mt-1">
                                    Τελικό Κλειδί: <strong>{attribute.name}</strong>
                                </p>
                                {index !== attributes.length - 1 && (
                                    <div className="seperator"></div>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="my-2">
                    <h3 className="text-lg">Συσχετισμένα Κλειδία:</h3>
                    {mongoKeys.map((key, index) => {
                        return (
                            <div className="my-2" key={index}>
                                <p className="text-sm">
                                    Αρχικό Κλειδί: <strong>{key.header}</strong>
                                </p>
                                <p className="text-sm mt-1">
                                    Τελικό Κλειδί: <strong>{key.related}</strong>
                                </p>
                                {index !== key.length - 1 && (
                                    <div className="seperator"></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </Dialog>

            <Table
                setReturnedProducts={setReturnedProducts}
                mongoKeys={mongoKeys}
                attributes={attributes}
                setLoading={setLoading}
                loading={loading}
                data={resultData}
                returnedProducts={returnedProducts}
            />

        </AdminLayout>
    )
}


const Table = ({data, loading, mongoKeys, attributes}) => {
    const {selectedSupplier} = useSelector(state => state.supplierOrder)
    const [newData, setNewData] = useState([])

    

    const name = selectedSupplier?.NAME
    const trdr = selectedSupplier?.TRDR

    // const handleFetch = async (code, name) => {
    //     let {data} = await axios.post('/api/uploadedProducts', {
    //         action: 'returnedUploadedProducts',
    //         UNIQUE_CODE: code,
    //         NAME: name
    //     })
    //     setNewData(prev => [...prev, data.result])
    // }

    const handleSubmit = async () => {
        const res = await axios.post('/api/insertProductFromFile', {
            data: data,
            SUPPLIER_NAME: name,
            SUPPLIER_TRDR: trdr,
        })
        console.log(res.data)
    }


    return (
        <>
            <DataTable
                loading={loading}
                key={Math.random()}
                showGridlines
                paginator rows={10} rowsPerPageOptions={[20, 50, 100, 200]}
                value={data}
                tableStyle={{minWidth: '50rem'}}>
                {
                    mongoKeys.map(key => {
                        if (key.related === 0) return;
                        return <Column key={key.related} field={key.related} header={key.header}/>
                    })

                }
                {
                    attributes.map(attribute => {
                        return <Column key={attribute.name} field={attribute.name} header={attribute.header}/>
                    })
                }
            </DataTable>

            <div className='mt-3'>
                <Button loading={loading} label="Αποστολή" className='ml-2' onClick={handleSubmit}/>
            </div>
            {newData.length ? (
                <UploadedProductsGrid data={newData}/>
            ) : null}

        </>
    )
}


const UploadedProductsGrid = ({data}) => {
    const Start = () => {
        return (
            <div className='flex align-items-center justify-content-between'>
                <XLSXDownloadButton data={data} fileName="catalog_result"/>
            </div>
        )
    }
    return (
        <div>
            <Toolbar start={Start} className='mt-3'/>
            <DataTable value={data} tableStyle={{minWidth: '50rem'}} className=''>
                <Column field="NAME" header="Όνομα"></Column>
                <Column field="SUPPLIER_NAME" header="Προμηθευτής"></Column>
                <Column field="STATUS" header="Status"></Column>
                <Column field="SHOULD_UPDATE_SOFTONE" header="SHOULD_UPDATE_SOFTONE"></Column>
                <Column field="UPDATED_SOFTONE" header="UPDATED_SOFTONE"></Column>
            </DataTable>
        </div>
    )
}

export default StepshowData;