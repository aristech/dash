import React, { useState, useEffect, lazy } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import XLSXDownloadButton from '../exportCSV/Download';

const ProductStats = () => {
    const [state, setState] = useState({
        totalProducts: 0,
        imageStat: 0,
        totalWithImages: 0,
        descriptions: 20,
        haveDescriptions: 0,
        haveDescriptionsStat: 0,
        inSoftoneStat: 0,
        inSoftone: 0,
        inSkroutzStat: 0,
        inSkroutz: 0,
        activeProductsStat: 0,
        activeProducts: 0,

    })
    const handleFetch = async () => {
        let {data} = await axios.post('/api/dashboard', {action: 'getStats'})
        setState(data.result)
    }

    useEffect(() => {
        handleFetch()
    }, [])
  return (
    <div className='bg-white p-4 border-round h-full'>
         <div className="card">
            <div className='mb-3'>
                <p className='text-lg font-bold'>Σύνολο Προϊόντων:</p>
                <span className='text-sm'>{state.totalProducts}</span>

            </div>
            <ProgressDiv  value={state.imageStat} total={state.totalWithImages} text="Προϊόντα με φωτογραφίες" />
            <ProgressDiv color={'#1ecbe1'}  value={state.inSoftoneStat} total={state.inSoftone} text="Προϊόντα και στα 2 συστήματα" />
            <ProgressDiv color={'orange'}  value={state.inSkroutzStat} total={state.inSkroutz} text="Στο Skroutz" />
            <ProgressDiv color={'#29e01f'}  value={state.activeProductsStat} total={state.activeProducts} text="Ενεργά προϊόντα" />
            <ProgressDiv color={'#786897'}  value={state.haveDescriptionsStat} total={state.haveDescriptions} text="Ενεργά προιόντα με περιγραφή" />
        </div>
    </div>
  )
}




const ProgressDiv = ({color, total, text, value}) => {
    return (
        <div className='grid mb-2'>
            <div className='col-12'>
                <div className='mb-2'>
                    <span className='font-bold'>{`${total} `}</span>
                    <span>{`${text} `}</span>

                </div>
                <div className='flex align-items-center'>
                    <div className='w-full mr-3'>
                    <ProgressBar color={color} size="small" style={{ height: '10px', minWidth: '100px' }} value={value} showValue={false}></ProgressBar>
                    </div>

                    <div className='w-2rem'>
                    <span className='font-bold text-xs' >{`${value && value.toFixed(2)}%`}</span>
                    </div>
                </div>
            </div>

        </div>
    )
}



export const ProductCard = () => {
    const [data, setData] = useState({
        grid: [],
        download: []
    })
    const [selectedFilter, setSelectedFilter] = useState(
        { name: 'Προϊόντα στο softOne', filter: {SOFTONESTATUS: true}, footerText: "Προϊόντα στο softone" },
    );
    const [totalRecords, setTotalRecords] = useState(0)
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 4,
        page: 1,
    });
    const filters = [
        { name: 'Προϊόντα στο softOne', filter: {SOFTONESTATUS: true}, footerText: "Προϊόντα στο softone" },
        { name: 'Προϊόντα: Δεν υπάρχουν στο softone', filter: {SOFTONESTATUS: false}, footerText: "Not in SoftOne" },
        { name: 'Προϊόντα με Φωτογραφίες', filter: {hasImage: true}, footerText: "Προϊόντα με Φωτογραφίες" },
        { name: 'Προϊόντα στο Skroutz', filter: {isSkroutz: true}, footerText: "Προϊόντα στο Skroutz" },
    ];

    useEffect(() => {
        setSelectedFilter(filters[0])
    }, [])

    const handleFetchInSoftone = async () => {
        let {data} = await axios.post('/api/dashboard', {action: 'fetchProducts', filter: selectedFilter?.filter, limit: lazyState.rows,  skip: lazyState.first})
        setTotalRecords(data.totalRecords)

        setData(prev => ({...prev, grid: data.result}))
    }

    useEffect(() => {
        if(data.grid.length === 0) return
        let _newData = transformData(data.grid)
       
        setData(prev => ({...prev, download: _newData}))
    }, [data.grid])

    useEffect(() => {
        handleFetchInSoftone()

    }, [selectedFilter, lazyState])

    function transformData(data) {
        return data.map((item) => {
            return {
                TYPE: selectedFilter.footerText,
                NAME: item.NAME,
             
            }
        })
    }


    return (
        <div className="card bg-white  flex flex-column p-3 h-full">

            <div className="flex align-items-center justify-content-between mb-3">
            <div className="card flex  w-17rem  ">
                <Dropdown className="w-full" value={selectedFilter} onChange={(e) => setSelectedFilter(e.value)} options={filters} optionLabel="name"
                    editable placeholder="Επιλογή Φίλτρου" />
            </div>
            <XLSXDownloadButton disabled={!data.download.length} data={data?.download} fileName={selectedFilter?.footerText} />
            </div>
            <DataTableDash data={data.grid} totalRecords={totalRecords} lazyState={lazyState} setlazyState={setlazyState} footerText={selectedFilter?.footerText} />
        </div>
    )
}

export const DataTableDash = ({data, lazyState, setlazyState, totalRecords, footerText}) => {


    const Footer = () => {
        return (
            <div>
                <span className="p-mr-2 font-normal mr-1">{footerText}:</span>
                <span>{totalRecords}</span>
            </div>
        )
    }
    return (
        <div className="card">
        <DataTable
            footer={Footer}
            rows={lazyState.rows}
            first={lazyState.first}
            paginatorTemplate="FirstPageLink PrevPageLink  NextPageLink LastPageLink CurrentPageReport "
            lazy
            showGridlines
            paginator
            paginatorRight
            totalRecords={totalRecords}
            onPage={(e) => setlazyState({ ...lazyState, first: e.first, rows: e.rows, page: e.page })}
            value={data}
            tableStyle={{ minWidth: '50rem' }}
            >
            <Column field="NAME" header="Προϊόν"></Column>
        </DataTable>
    </div>
    )
}


export default ProductStats