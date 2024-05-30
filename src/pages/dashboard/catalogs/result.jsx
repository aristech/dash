import React, { useState} from 'react'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'
import {Button} from 'primereact/button'
import {useSelector} from 'react-redux';
import axios from 'axios';
import StepHeader from '@/components/StepHeader';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {Dialog} from 'primereact/dialog';

 const CatalogResults = () => {
    const [returnedProducts, setReturnedProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const {attributes, mongoKeys, newData,} = useSelector((state) => state.catalog)
    // const [resultData, setResultData] = useState([])
    const router = useRouter()
    const [visible, setVisible] = useState(false)



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
                data={newData}
                returnedProducts={returnedProducts}
            />

        </AdminLayout>
    )
}


const Table = ({data, loading, mongoKeys, attributes}) => {
    const {selectedSupplier} = useSelector(state => state.supplierOrder)
    const name = selectedSupplier?.NAME
    const trdr = selectedSupplier?.TRDR
    console.log({data})


    const handleSubmit = async () => {
        const res = await axios.post('/api/insertProductFromFile', {
            data: data,
            SUPPLIER_NAME: name,
            SUPPLIER_TRDR: trdr,
        })
        // console.log(res.data)
    }


    const attributeColumns = () => {
        const attributeKeys = attributes.map((attr) => attr.name);
        console.log({attributeKeys})
        return attributeKeys.map((key) => (
            <Column key={key} field={key} header={key} body={(rowData) => {
                const attribute = rowData.ATTRIBUTES.find((attr) => attr.label === key);
                return attribute ? attribute.value : '';
            }} />
        ));
    };
    return (
        <>
            <DataTable
                loading={loading}
                key={Math.random()}
                showGridlines
                paginator rows={20} rowsPerPageOptions={[20, 50, 100, 200]}
                value={data}
                tableStyle={{minWidth: '50rem'}}>
                {
                    mongoKeys.map(key => {
                        if (key.related === 0) return;
                        return <Column key={key.related} field={key.related} header={key.header}/>
                    })

                }
               {attributeColumns()}
            </DataTable>

            <div className='mt-3'>
                <Button loading={loading} label="Αποστολή" className='ml-2' onClick={handleSubmit}/>
            </div>
           

        </>
    )
}




export default CatalogResults;