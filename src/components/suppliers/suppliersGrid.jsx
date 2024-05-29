'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { setSelectedSupplier, setInputEmail } from '@/features/supplierOrderSlice';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/router';
import StepHeader from '../multiOffer/StepHeader';
import SearchInput from "@/components/Forms/SearchInput";

const SuppliersGrid = () => {
    const router = useRouter();
    const { selectedSupplier } = useSelector(state => state.supplierOrder)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [sortOffers, setSortOffers] = useState(1)
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
        rows: 20,
        page: 1,
    });
    const [totalRecords, setTotalRecords] = useState(0);
    const dispatch = useDispatch()
    useEffect(() => {
       dispatch(setSelectedSupplier(null)) 
    }, [])




    const fetchClients = async () => {
        const isAnyFieldNotEmpty = Object.values(searchTerm).some(value => value == '');
        if (isAnyFieldNotEmpty) {
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
        fetchClients();
    }, [
        lazyState.rows,
        lazyState.first,
        searchTerm,
        sortOffers
    ])




    const onSelectionChange = (e) => {
        dispatch(setSelectedSupplier(e.value))
    }

    const onPage = (event) => {
        setlazyState(event);
    };


    const handleSearch = (e) => {
        const { name, value } = e.target;
        console.log({name})
        setSearchTerm(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    return (
        <>
                <DataTable
                    value={data}
                    paginator
                    rows={lazyState.rows}
                    rowsPerPageOptions={[20, 50, 100, 200, 500]}
                    first={lazyState.first}
                    lazy
                    totalRecords={totalRecords}
                    onPage={onPage}
                    selectionMode={'radio'}
                    selection={selectedSupplier}
                    onSelectionChange={onSelectionChange}
                    loading={loading}
                    filterDisplay="row"
                    className="p-datatable-gridlines p-datatable-sm"
                    id={'_id'}
                    showGridlines
                >  
                    <Column selectionMode="single" ></Column>
                <Column
                    field="NAME"
                    filter
                    showFilterMenu={false}
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
                    header="ΑΦΜ"
                    filter
                    showFilterMenu={false}
                    style={{ width: '120px' }}
                    filterElement={() => {
                        return <SearchInput
                            name="afm"
                            value={searchTerm.afm}
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
                            name={"email"}
                            value={searchTerm.email}
                            handleSearch={handleSearch}
                        />
                    }}

                >

                </Column>
                </DataTable>
        </>
    )
}






export default SuppliersGrid;