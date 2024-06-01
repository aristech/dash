import {use, useEffect, useState} from "react"
import axios from "axios"
import {Dropdown} from "primereact/dropdown"

export default function CountriesDropdown({
    state,
    handleState, 
    isEdit = false, 
    required, 
    error
}) {

    const [options, setOptions] = useState([])

    
    useEffect(() => {
        if(!isEdit && !options) return
        let option = options.find(option => option.COUNTRY == state);
        if(!option) return;
        handleState(option);
    }, [options]);


  

    const handleFetchData = async () => {
        const countries = await axios.post('/api/suppliers', {action: 'getCountries'})
        setOptions(countries.data.result)

    }

    useEffect(() => {
        handleFetchData();
    }, [])

    return (
        <div  className="w-full">
            <label className={`custom_label ${error && "text-red-600"}`}>Χώρα {required && "*"}</label>
            <Dropdown
                filter
                className='w-full custom_dropdown'
                value={state}
                onChange={(e) => handleState(e.target.value)}
                options={options}
                optionLabel="NAME"
                placeholder="Χώρα"
            />
            <p className="text-red-600 mt-1">{error}</p>
        </div>
    )
}