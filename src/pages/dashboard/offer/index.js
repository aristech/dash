import { Button } from 'primereact/button';
import React from 'react'
import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedProducts } from '@/features/productsSlice';
import OfferGrid from '@/components/offer/OfferGrid';
const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedProducts } = useSelector(state => state.products);


 
  const onClick = () => {
    dispatch(setSelectedProducts([]))
    router.push('/dashboard/offer/select-client')

  }
  return (
    < AdminLayout >
      <div>
        <Button icon="pi pi-plus" label="Δημιουργία Προσφοράς"  severity='secondary' onClick={onClick} />
      </div>
      <OfferGrid />
    </ AdminLayout >

  )
}



export default Page;