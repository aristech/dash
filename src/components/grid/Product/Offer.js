import React, { useState, useContext } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import axios from 'axios'
import { lazy } from 'react'
import { useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import { set } from 'mongoose'
import { Button } from 'primereact/button'
import { ProductQuantityContext } from './ProductToolbar'

const Offer = ({ total, selectedProducts }) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [totalRecords, setTotalRecords] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,

    });
    const [selectedClient, setSelectedClient] = useState(null)
    console.log(selectedClient)
    const [rowClick, setRowClick] = useState(true);

    // const handleClients = async () => {
    //         let {data} = await axios.post('/api/clients/apiClients', {action: 'fetchBatch', skip: lazyState.first, limit: lazyState.rows})
    //         setData(data.result)
    //         setFilteredData(data.result)
    //         setTotalRecords(data.totalRecords)
    // }

    // useEffect(() => {
    //     handleClients()
    // }, [lazyState.first])

    const onSelection = (e) => {
        setSelectedClient(e.value)
    }

    const onPage = (event) => {
        setlazyState(event);
    };


    const onSearch = async (event) => {
        const value = event.target.value;
        setSearchTerm(value)

    };

    useEffect(() => {
        let handleSearch = async () => {
            console.log('searchterm ' + searchTerm)
            setLoading(true)
            let res = await axios.post('/api/clients/apiClients', { action: 'search', searchTerm: searchTerm, skip: lazyState.first, limit: lazyState.rows })
            console.log(res.data.result)

            setFilteredData(res.data.result)
            setTotalRecords(res.data.totalRecords)
            setLoading(false)
        }
        handleSearch();
    }, [searchTerm, lazyState.first])




    const renderHeader = () => {
        return (
            <div className="flex">
                <div className="">
                    <span className="p-input-icon-left mr-3">
                        <i className="pi pi-search" />
                        <InputText type="search" value={searchTerm} onChange={onSearch} placeholder="Αναζήτηση" />
                    </span>
                </div>
            </div>

        );
    };



    const header = renderHeader();

    return (
        <div>
            <div className='box border-1 border-200'>

            </div>
            {!selectedClient ? (
                <DataTable
                    value={filteredData}
                    rows={4}
                    paginator
                    lazy
                    rowsPerPageOptions={[4, 8, 20, 50, 100, 200]}
                    selectionMode={rowClick ? null : 'radiobutton'}
                    selection={selectedClient}
                    onSelectionChange={onSelection}
                    first={lazyState.first} totalRecords={totalRecords}
                    loading={loading}
                    onPage={onPage}
                    header={header}
                >
                    <Column selectionMode="single" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="TRDR" header="Προϊόν"></Column>
                    <Column field="NAME" header="Προϊόν"></Column>
                </DataTable>
            ) : (
                <AfterClientSelection selectedClient={selectedClient} setSelectedClient={setSelectedClient} selectedProducts={selectedProducts} />
            )}
        </div>
    )
}


const AfterClientSelection = ({ selectedClient, setSelectedClient, selectedProducts }) => {
    const { mtrlines } = useContext(ProductQuantityContext);
    const [saldoc, setSaldoc] = useState(null)

    const CalculateBasket = () => {
        let total = 0
        selectedProducts && selectedProducts.forEach((item) => {
            total += parseInt(item.PRICER)
        })
        return (
            <p className='mr-3 ml-3'> Σύνολο:<span className='font-bold ml-1'>{`${total},00$`}</span> </p>
        )
    }

    const sendOffer = async () => {
        console.log(mtrlines)
        const obj = {
            TRDR: parseInt(selectedClient.TRDR),
            MTRLINES: mtrlines,
        }

        console.log(obj)
        let { data } = await axios.post('/api/clients/apiClients', { action: 'sendOffer', data: obj })
        console.log(data.result)
        setSaldoc(data.result)
    }


    return (
        <div>
            <Button label="Eπίλεξε Πελάτη" severity="warning" onClick={() => setSelectedClient(null)} />
            <div className='surface-100 p-4 mt-3 mb-2 border-round'>

                <p className='text-lg font-bold '>Λεπτομέριες Πελάτη</p>
                <div className='mt-3'>
                    <span className='font-bold text-sm mr-2'>Κωδικός:</span>
                    <span className='text-sm'>{selectedClient.CODE}</span>
                </div>
                <div className='mt-2'>
                    <span className='font-bold text-sm mr-2'>Όνομα Πελάτη:</span>
                    <span className='text-sm'>{selectedClient.NAME}</span>
                </div>
                <div className='mt-2'>
                    <span className='font-bold text-sm mr-2'>Διεύθυνση:</span>
                    <span className='text-sm'>{selectedClient.ADDRESS}</span>
                </div>
                <div className='border-400 border-top-1  mt-3'>

                    <div className='flex mt-2'>
                        <p>Προϊόντα:</p>
                        <p className='ml-1 font-bold'>{selectedProducts.length}</p>
                        <CalculateBasket />
                    </div>
                    <div className='mt-4'>
                    </div>

                </div>
            </div>


            {saldoc ? (
                <div className='bg-yellow-400 inline-flex p-3'>
                    <p>Αριθμός Προσφοράς:</p>
                    <p className='font-bold ml-2 border-round'>{saldoc && saldoc.SALDOCNUM}</p>
                </div>
            ) :
                (<Button onClick={sendOffer} className='w-full mt-2' label="Aποστολή Προσφοράς" />)}

        </div>
    )
}

export default Offer