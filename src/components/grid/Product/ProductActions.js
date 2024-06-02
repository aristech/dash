import React, { useRef, useContext, useState } from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ProductQuantityContext, ProductQuantityProvider } from '@/_context/ProductGridContext';
import { useSelector, useDispatch } from 'react-redux'
import { setSingleProductForSoftone } from '@/features/productsSlice'
import { Toast } from 'primereact/toast'
import { setSelectedProducts, setSubmitted } from '@/features/productsSlice'
import axios from 'axios'
import Image from 'next/image'
import { useToast } from '@/_context/ToastContext'

const ProductActions = ({ rowData, onEdit, onEditClass, onAdd }) => {
	const { setActiveIndex, setVisible } = useContext(ProductQuantityContext)
	const {showMessage} = useToast();
	const dispatch = useDispatch()
	const router = useRouter();

    const { selectedProducts } = useSelector(store => store.products)

	const [loading, setLoading] = useState({
		active: false,
		skroutz: false,
	})
	const op = useRef(null)
	const toast = useRef(null)
	
	const showSuccess = (message) => {
		toast.current.show({ severity: 'success', summary: 'Success', detail: message, life: 4000 });
	}

	const showError = (message) => {
		toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
	}

	const handleChangeClass = () => {
		dispatch(setSelectedProducts([rowData]))
		setVisible(true)
		setActiveIndex(1)
	}

	const handleChangeAvailability = () => {
		dispatch(setSelectedProducts([rowData]))
		setVisible(true)
		setActiveIndex(4)
	}
	const handleImpaChange = () => {
		dispatch(setSelectedProducts([rowData]))
		setVisible(true)
		setActiveIndex(2)
	}


	const handleAddToSoftone = () => {
		if(!selectedProducts.length) {
			showMessage("error", "Προσθέστε προϊόντα στο καλάθι", "error")
			return;
		}
		if (rowData.SOFTONESTATUS) {
			showError("To προϊόν υπάρχει ήδη στο softone");
			return;
		}
		dispatch(setSingleProductForSoftone(rowData))
		router.push('/dashboard/add-to-softone')
	}

	const handleAddToBucket = () => {
		dispatch(setSelectedProducts([...selectedProducts, rowData]))
	}

	
	const updateActiveMtrl  = async () => {
		setLoading(prev => ({...prev, active: true}))
		const ISACTIVE = rowData.ISACTIVE
		const MTRL = rowData.MTRL
		let {data} = await axios.post('/api/product/apiProduct', { action: "updateActiveMtrl", id: rowData._id, MTRL: MTRL, ISACTIVE: ISACTIVE})
		if(data.success) {
			showSuccess(data.message)
		} else {
			showError(data?.error)
		}
		dispatch(setSubmitted())
		setLoading(prev => ({...prev, active: false}))
		op.current.hide();
	}

	const updateSkroutz = async () => {
		let isSkroutz = rowData.isSkroutz;
		const MTRL = rowData.MTRL
		const {data} = await axios.post('/api/product/apiProduct', { action: "updateSkroutz", id: rowData._id, MTRL: MTRL, isSkroutz: isSkroutz})
		if(data.success) {
			showSuccess(data.message)
		} else {
			showError(data?.error)
		}
		dispatch(setSubmitted())
		setLoading(prev => ({...prev, active: false}))
		op.current.hide();
	}
	
	return (
		<div className="">
			<Toast ref={toast} />
			<div onClick={(e) => op.current.toggle(e)} className='flex align-items-center justify-content-center w-full h-full cursor-pointer'>
				<i className=" pi pi-cog" style={{ color: 'var(--primary-color)' }}></i>
			</div>
			<OverlayPanel className='w-20rem product-overlay' ref={op} showCloseIcon >
				<Button
					onClick={() => onEdit(rowData)}
					text
					className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1"
				>
					<div className='mr-2 w-2rem	h-2rem bg-primary-600 border-circle flex  align-items-center justify-content-center'>
						<i className="text-white pi pi-pencil text-sm " ></i>
					</div>
					Τροποποίηση
				</Button>
				<Button
					onClick={() => onAdd(rowData)}
					text
					className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1"
				>
					<div className='mr-2 w-2rem	h-2rem bg-primary-600 border-circle flex  align-items-center justify-content-center'>
						<i className="text-white pi pi-plus text-sm " ></i>
					</div>
					Προσθήκη Νέου
				</Button>
				<Button
					loading={loading.active}
					onClick={updateActiveMtrl}
					text
					className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1"
				>
					<div className='flex flex-column'>
						<div className='flex align-items-center'>
							<div style={{ width: '8px', height: '8px', borderRadius: '50%' }} className={`${rowData.ISACTIVE ? "bg-green-500 " : "bg-red-500"}  mt-1 mr-1`}></div>
							<span className='font-semibold'>{rowData.ISACTIVE ? 'Eνεργό' : 'Aνενεργό'} προϊόν</span>
						</div>
						<div className='flex justify-content-start'>
							<span style={{ fontSize: '11px', marginLeft: '11px' }} className='block' >{rowData.ISACTIVE ? 'Aπενεργοποίηση' : 'Ενεργοποίηση'}</span>
						</div>
					</div>
				</Button>
				<Button
					loading={loading.skroutz}
					onClick={updateSkroutz}
					text
					className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1"
				>
					<div className='w-full flex justify-content-between align-items-center'>
					<div className='flex flex-column '>
						<div className='flex align-items-center'>
							<div style={{ width: '8px', height: '8px', borderRadius: '50%' }} className={`${rowData.isSkroutz ? "bg-green-500 " : "bg-red-500"}  mt-1 mr-1`}></div>
							<span className='font-semibold'>{rowData.isSkroutz ? 'Eνεργό' : 'Aνενεργό'} Skroutz</span>
						</div>
						<div className='flex justify-content-start'>
							<span style={{ fontSize: '11px', marginLeft: '11px' }} className='block' >{rowData.isSkroutz ?'Aπενεργοποίηση' : 'Ενεργοποίηση'}</span>
						</div>
					</div>
					<div>
						<Image 
							src='/uploads/skroutz.png' 
							width={50} 
							height={15} 
							alt='skroutz'
						/>
					</div>
					</div>
				</Button>

				<Button
					onClick={handleChangeClass}
					text className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1">
					Αλλαγή Κατηγοριοποίησης
				</Button>
				<Button
					onClick={handleChangeAvailability}
					text className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1">
					{/* <div className='mr-2 w-2rem	h-2rem bg-orange-600 border-circle flex  align-items-center justify-content-center'>
            <i className="text-white pi pi-arrow-right text-sm " ></i>
          </div> */}
					Ενημέρωση αποθέματος
				</Button>
				<Button
					onClick={handleImpaChange}
					text className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1">
					Ανάθεση – τροποποίηση IMPA
				</Button>
				<Button
					onClick={handleAddToSoftone}
					text className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1">
					Προσθήκη στο Softone
				</Button>
				<Button
					onClick={handleAddToBucket}
					text className=" w-full  hover:bg-bluegray-60 border-bluegray-100 text-bluegray-800 mt-1 mb-1">
					 Προσθήκη στο καλάθι
				</Button>
			</OverlayPanel>
		</div>
	)
}



export default ProductActions