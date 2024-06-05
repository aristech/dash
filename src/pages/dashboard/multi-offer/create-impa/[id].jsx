'use client';
import { useState,  useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  setDataSource, setShowImpaTable, } from '@/features/impaofferSlice';
import StepHeader from '@/components/StepHeader';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import ImpaGrid from '@/components/grid/impaGrid';
import ImpaDataTable from '@/components/multiOffer/ImpaProductsTable';
import axios from 'axios';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';
import ProductSearchGrid from '@/components/grid/ProductSearchGrid';
import SelectedProducts from '@/components/grid/SelectedProducts';
import { Toast } from 'primereact/toast';


const ImpaHolder = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const {id} = router.query;
    const toast = useRef(null);

    const { selectedProducts, mtrLines } = useSelector(state => state.products)
    const { selectedImpa } = useSelector(state => state.impaoffer)

    const showError = (message) => {
        toast.current.show({severity:'error', summary: 'Error', detail:message, life: 5000});
    }



    const onHolderCompletions = async () => {
        setLoading(prev => !prev)
        const {data} = await axios.post('/api/createOffer', { action: 'createImpaHolder', impa: selectedImpa, products: mtrLines, holderId: id })
        await axios.post('/api/createOffer', { action: 'addProductsToImpa', products: selectedProducts, impa:selectedImpa.code})

       console.log(data)
        setLoading(prev => !prev)
        if(data.message) {
            showError(data.message)
            return;
        }
        router.push('/dashboard/multi-offer')
    }


    return (
        <AdminLayout >
            <Toast ref={toast} />
            <div className='flex align-items-center justify-content-between mb-5'>
                <Button loading={loading} size="small" icon="pi pi-angle-left" label="Πίσω" onClick={() => router.back()} />
            </div>
            <PickListComp title={'Επιλογή Impa'} />
            {selectedProducts.length ? (
                <Button 
                    label="Ολοκλήρωση Holder"
                    className='ml-2'
                    onClick={onHolderCompletions}
                    icon="pi pi-check"
                />
            ) : null}
        </AdminLayout>
    )
}




export const PickListComp = ({disableImpaBtn = false, title, code}) => {
    const { selectedImpa, dataSource, showImpaTable } = useSelector(state => state.impaoffer)
    const { selectedProducts } = useSelector(state => state.products)
    const [show, setShow] = useState(true)

    return (
        <div >
            <div className='mt-4' >
                <StepHeader text={title} />
                <CustomToolbar disableImpaBtn={disableImpaBtn} setShow={setShow} show={show} />
                {showImpaTable ? (<ImpaGrid />) : null}

                {(!showImpaTable && selectedImpa) ? (
                    <div>
                        {(dataSource == 2 && show) ? (<ProductSearchGrid />) : null}
                        {(dataSource == 1 && show) ? (<ImpaDataTable code={code} />) : null}
                    </div>
                ) : null}



            </div>
            <div className='col-12 mt-6'>
                {selectedProducts.length > 0 ? (
                    <div>
                        <StepHeader text={`Συνολο Προϊόντων για Impa ${selectedImpa?.code}:`} />
                        <SelectedProducts />
                    </div>
                ) : null}

            </div>
        </div>
    )

}


export const CustomToolbar = ({ setShow, show, disableImpaBtn = false }) => {
    const { selectedImpa, dataSource } = useSelector(state => state.impaoffer)
    const dispatch = useDispatch()

    const onAllProductsClick = () => {
        dispatch(setShowImpaTable(false))
        dispatch(setDataSource(2))
    }

    const resetToImpa = () => {
        dispatch(setDataSource(1))
    }

    const StartContent = () => {
        return (
            <div className='w-full flex justify-content-between '>
                <Button disabled={disableImpaBtn} severity='secondary' label={`Eπιλογή Impa: ${(selectedImpa) ? selectedImpa?.code : ''}`} onClick={() => dispatch(setShowImpaTable((true)))} />
            </div>
        )
    }


    const EndContent = () => {
        return (
            <div className=''>
                {dataSource == 1 ? (<Button icon="pi pi-tag" disabled={!selectedImpa} severity='warning' label="όλα τα Προϊόντα" onClick={onAllProductsClick} />) : null}
                {dataSource == 2 ? (<Button icon="pi pi-tag" disabled={!selectedImpa} label={`Προϊόντα του IMPA: ${selectedImpa?.code}`} onClick={resetToImpa} />) : null}
                <Button icon={`pi  ${!show ? "pi-angle-down" : " pi-angle-up"}`} className='ml-3' severity='secondary' onClick={() => setShow(prev => !prev)} />
            </div>
        )
    }

    return (
        <Toolbar start={StartContent} end={EndContent} />
    )
}


export default ImpaHolder;