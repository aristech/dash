import React, { useState, useContext, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {
  setSelectedHeaders,
  setSelectedMongoKey,
  setCurrentPage,
  setAttribute,
  setPricesMultiplier,
  setNewData
} from '@/features/catalogSlice';
import { InputText } from "primereact/inputtext";
import StepHeader from '@/components/StepHeader';
import AdminLayout from '@/layouts/Admin/AdminLayout';
import { useRouter } from 'next/router';
// ------------------- STEP 2 -------------------



const StepCalcPrice = () => {
  const { selectedPriceKey, pricesMultiplier, gridData, newData } = useSelector((state) => state.catalog)
  const dispatch = useDispatch();
    const router = useRouter();

  useEffect(() => {
    const _newData = gridData.map((item) => {
      let value = parseInt(item[selectedPriceKey])

      if (item.hasOwnProperty(selectedPriceKey) && !isNaN(value)) {
        	
			function calculateAndRound(a, b) {
				const result = a * b;
				return Math.round(result * 100) / 100;
			}
        return {
          ...item,
          [selectedPriceKey]: item[selectedPriceKey],
          PRICER: calculateAndRound(value, pricesMultiplier.PRICER),
          PRICEW: calculateAndRound(value, pricesMultiplier.PRICEW),
          PRICER05:calculateAndRound(value, pricesMultiplier.PRICER05),
        };
      }
      return {}; // or null or any other fallback value you'd like
    }).filter(item => Object.keys(item).length !== 0);  // Remove items that don't have the key

    dispatch(setNewData(_newData))
  }, [gridData, pricesMultiplier, dispatch, selectedPriceKey])

  return (
    <AdminLayout>
      <div className='mb-2 mt-2'>
        <StepHeader text="Υπολογισμός Τιμών"/>
      </div>
      <StepCalculatePrice />
      {newData ? (
        <DataTable
          showGridlines
          paginator rows={10} rowsPerPageOptions={[20, 50, 100, 200]}
          value={newData}
          tableStyle={{ minWidth: '50rem' }}>
          <Column header={'Τιμή αρχείου'} field={selectedPriceKey} />
          <Column header={'Tιμή Λιανικής'} field={'PRICER'} style={{ width: '200px' }} />
          <Column header={'Τιμή Χονδρικής'} field={'PRICEW'} style={{ width: '200px' }} />
          <Column header={'Τιμή Scroutz'} field={'PRICER05'} style={{ width: '200px' }} />
        </DataTable>
      ) : null}

      <div className='mt-3'>
        <Button label="STEP 1" severity="success" icon="pi pi-arrow-left" onClick={() => dispatch(setCurrentPage(1))} />
        <Button label="STEP 3" severity="success" icon="pi pi-arrow-right" className='ml-2' onClick={() => {
            router.push('/dashboard/catalogs/other-keys')
        }} />
      </div>
    </AdminLayout>
  )
}






const StepCalculatePrice = () => {
  const {  pricesMultiplier } = useSelector((state) => state.catalog)

  const dispatch = useDispatch();

  const handleScroutzPrice = (e) => {
    setPricesMultiplier(prev => ({ ...prev, PRICER05: e.value }))
    dispatch(setPricesMultiplier({
      type: 'PRICER05',
      value: e.value.toFixed(2)
    }))

  }
  const handleRetail = (e) => {
    dispatch(setPricesMultiplier({
      type: 'PRICER',
      value:  e.value.toFixed(2)
    }))
  }
  const handleWholesale = (e) => {
    dispatch(setPricesMultiplier({
      type: 'PRICEW',
      value:  e.value.toFixed(2)
    }))
  }


  return (
    <div>

      <div className='bg-white-alpha-90'>
        {/* //ITEM */}
        <div className='mb-3 border-bottom-1 p-4	 border-300	'>
          <div className="flex-auto">
            <label htmlFor="input1" className="font-bold block mb-2">Συντελεστής Τιμής Scroutz</label>
            <InputNumber inputId="input1" value={pricesMultiplier.PRICER05} minFractionDigits={1} maxFractionDigits={1} onValueChange={handleScroutzPrice} showButtons min={0} max={100} step={0.1}/>
          </div>
        </div>
        {/* //ITEM */}
        <div className='mb-3 border-bottom-1 p-4	 border-300	'>
          <div className="flex-auto">
            <label htmlFor="input2" className="font-bold block mb-2">Συντελεστής Λιανικής</label>
            <InputNumber inputId="input2" value={pricesMultiplier.PRICER} onValueChange={handleRetail} minFractionDigits={1} maxFractionDigits={1} showButtons min={0} max={100} step={0.1} />
          </div>
        </div>

        {/* //ITEM */}
        <div className='mb-3 border-bottom-1 p-4	 border-300	'>
          <div className="flex-auto">
            <label htmlFor="input3" className="font-bold block mb-2">Συντελεστής Χρονδρικής</label>
            <InputNumber inputId="input3" value={pricesMultiplier.PRICEW} onValueChange={handleWholesale}  minFractionDigits={1} maxFractionDigits={2} showButtons min={0} max={100} step={0.1} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default StepCalcPrice;