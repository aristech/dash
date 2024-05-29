import React from 'react'




export const ProductAvailability = ({ data }) => {
    return (
        <div className='prod_availability_container' >
            <div  className='prod_availability_content '>
                <div className='prod_availability_row'>
                <div className={`prod_availability_circle prod_availability_circle-div ${parseInt(data?.DIATHESIMA) < 0 ? 'circle-notavailable' : null }`}></div>
                    <span className='text-xs'>Διαθ:</span>
                    <span className='prod_availability_available'>{data?.DIATHESIMA}</span>
                </div>
            </div>
        </div>
    )
}


export const ProductOrdered = ({data}) => {
    return (
        <div className='prod_availability_container'>
        <div >
            <div className='prod_availability_row'>
                <div className='prod_availability_circle prod_availability_circle-ordered'></div>
                <span >Σε παραγγελία:</span>
                <span className='prod_availability_available'>{data?.SEPARAGELIA}</span>
            </div>
    
        </div>
    </div>
    )
}
export const ProductReserved = ({data}) => {
    return (
        <div className='prod_availability_container'>
        <div >
            <div className='prod_availability_row'>
                <div className='prod_availability_circle prod_availability_circle-reserved'></div>
                <span className='prod_availability_block'>Δεσμευμένα:</span>
                <span className='prod_availability_available'>{data?.DESVMEVMENA}</span>
            </div>
    
        </div>
    </div>
    )
}



export default ProductAvailability