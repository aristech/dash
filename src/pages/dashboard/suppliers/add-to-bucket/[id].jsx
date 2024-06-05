'use client'
import React from 'react'
import axios from 'axios';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import StepHeader from '@/components/StepHeader';
import { useRouter } from 'next/router';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import ProductSearchGrid from '@/components/grid/ProductSearchGrid';
import SelectedProducts from '@/components/grid/SelectedProducts';
import { useSession } from 'next-auth/react';

const Page = () => {

  const dispatch = useDispatch()
  const router = useRouter()
  const { data: session, update } = useSession();
  let user = session?.user?.user;
  const {id} = router.query
  const {selectedProducts, mtrLines} = useSelector(state => state.products)




  const handleFinalSubmit = async () => {
    let { data } = await axios.post('/api/createOrder', {
      action: 'updateBucket',
      products: mtrLines,
      TRDR: id,
      createdFrom: user?.lastName,
    })
      router.push(`/dashboard/suppliers/order/${id}`)
  }
  return (
    <AdminLayout>
      <StepHeader text="Προσθήκη Προϊόντων Στον Κουβά" />
      <ProductSearchGrid />
      {selectedProducts.length > 0 ? (
        <div className='mt-4'>
          <StepHeader text="Επιλεγμένα Προϊόντα" />
          <SelectedProducts />
          <div className='my-2'>
            <Button className='mr-2' severity='secondary' icon="pi pi-arrow-left" onClick={() => router.back()} />
            <Button className='mr-2' label="Oλοκλήρωση"  icon="pi pi-check" onClick={handleFinalSubmit} />
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}





export default Page;