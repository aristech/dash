'use client'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import StepHeader from '@/components/StepHeader';
import { useRouter } from 'next/router';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import ProductSearchGrid from '@/components/grid/ProductSearchGrid';
import SelectedProducts from '@/components/grid/SelectedProducts';
import { setSelectedProducts } from '@/features/productsSlice';
import SoftoneStatusButton from '@/components/grid/SoftoneStatusButton';

const ChooseProducts = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [state, setState] = useState({
    TRDR:'',
    NAME:'',
    EMAIL: '',
    minOrderValue: 0,
  })
  const {  inputEmail, selectedSupplier } = useSelector(state => state.supplierOrder)
  const {mtrLines, selectedProducts} = useSelector(state => state.products)
  const {id} = router.query
  
  


  useEffect(() => {
    dispatch(setSelectedProducts([]))
    let TRDR = id[0];
    let NAME = id[1];
    let EMAIL = id[2];
    let minOrderValue= parseInt(id[3]);
    
    setState({
      TRDR: TRDR,
      NAME: NAME,
      EMAIL: EMAIL,
      minOrderValue: minOrderValue,
    })
  }, [selectedSupplier, id])





  const handleFinalSubmit = async () => {
    let { data } = await axios.post('/api/createOrder', {
      action: 'createBucket',
      products: mtrLines,
      email: state.EMAIL,
      TRDR: state.TRDR,
      NAME: state.NAME,
      minOrderValue: state.minOrderValue,
    })
    router.push(`/dashboard/suppliers/order/${state.TRDR}`)
  }
  return (
    <AdminLayout>
      <StepHeader text="Προσθήκη Προϊόντων Στον Κουβά" />
      <ProductSearchGrid />
      {selectedProducts.length !== 0 ? (
         <div className='mt-3'>
          <StepHeader text="Επιλεγμένα Προϊόντα" />
     <SelectedProducts  />
          <div className='mt-3 flex align-items-center'>
            <Button className='mr-3' severity='success' icon="pi pi-arrow-left" onClick={() => router.back()} />
         <SoftoneStatusButton btnText="Επόμενο" onClick={handleFinalSubmit}/>

          </div>
       </div>
      ) : null}
     

    </AdminLayout>
  )
}







export default ChooseProducts;