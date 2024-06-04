import React, { useEffect } from 'react'
import AdminLayout from '@/layouts/Admin/AdminLayout';
import UploadedProductsGrid from '@/components/grid/UploadedProductsGrid';
import ProductStats from '@/components/grid/ProductStats';
import StepHeader from '@/components/StepHeader';
import { DataTable } from 'primereact/datatable';
import OffersSection from '@/components/grid/Product/OffersSection';
import { ProductCard } from '@/components/grid/ProductStats';
const Page = () => {


  return (
    <AdminLayout>
        <div className='ml-2'>
      <StepHeader text={"Προϊόν"} />
      </div>
        <div className='grid mt-1 '>
        <div className='col-4'>
        < ProductStats />
        </div>
        <div className='col-8'>
          <ProductCard />
        </div>
      </div>
     <OffersSection />
    </AdminLayout>

  )
}






export default Page;