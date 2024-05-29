import React, { useState, useContext, useRef } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { ProductQuantityContext } from '@/_context/ProductGridContext'
import CustomersGrid from '../clientGrid'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedClient } from '@/features/impaofferSlice'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Toast } from 'primereact/toast'

const Offer = () => {
    const { selectedClient } = useSelector(state => state.impaoffer)
    return (
        <div>
            {!selectedClient ? (
                <CustomersGrid />
            ) : (
                <AfterClientSelection selectedClient={selectedClient} setSelectedClient={setSelectedClient} />
            )}
        </div>
    )
}


const AfterClientSelection = () => {
    const { selectedClient } = useSelector(state => state.impaoffer)
    const { selectedProducts, mtrLines } = useSelector(state => state.products)
    const { data: session } = useSession();
    const user = session?.user?.user;
    const toast = useRef(null);
    const [loading, setLoading] = useState(false)
    // const [saldoc, setSaldoc] = useState(null)
    const dispatch = useDispatch();
    const router = useRouter()

    const showSuccess = (message) => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    }

    const showError = (message) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }

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
        setLoading(true)
        const { data } = await axios.post('/api/singleOffer', {
            action: "createOrder",
            data: mtrLines,
            email: selectedClient?.EMAIL,
            name: selectedClient?.NAME,
            TRDR: selectedClient?.TRDR,
            createdFrom: user?.lastName
        })



        if (!data.success) {
            showError(data.error)
            return;
        }
        setLoading(false)
        showSuccess('Η προσφορά δημιουργήθηκε με επιτυχία')
        router.push('/dashboard/offer')
    }


    return (
        <div>
            <Toast ref={toast} />
            <Button label="Eπίλεξε Πελάτη" severity="warning" onClick={() => dispatch(setSelectedClient(null))} />
            <div className='surface-100 p-4 mt-3 mb-2 border-round'>
                <p className='text-lg font-bold '>Λεπτομέρειες Πελάτη</p>
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
            {/* {saldoc ? (
                <div className='bg-yellow-400 inline-flex p-3'>
                    <p>Αριθμός Προσφοράς:</p>
                    <p className='font-bold ml-2 border-round'>{saldoc && saldoc.SALDOCNUM}</p>
                </div>
            ) :
                (<Button onClick={sendOffer} className='w-full mt-2' label="Aποστολή Προσφοράς" />)} */}
            <Button loading={loading} onClick={sendOffer} className='w-200 mt-2' label="Ολοκλήρωση" />
        </div>
    )
}

export default Offer