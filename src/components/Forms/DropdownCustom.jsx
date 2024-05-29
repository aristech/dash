
import {Dropdown} from "primereact/dropdown"

export default function DropdownCustom({
    state,
    label,
    options,
    handleState, 
    optionLabel,
    isEdit = false, 
    required, 
    error,
    placeholder
}) {



    return (
        <div className="">
            <label className={`custom_label ${error && "text-red-500"}`}>{label} {required && "*"}</label>
            <Dropdown
                showClear
                className='w-full custom_dropdown'
                value={state}
                onChange={(e) => handleState(e.target.value)}
                options={options}
                optionLabel={optionLabel}
                placeholder={placeholder}
            />
            <p className="text-red-500 mt-1">{error}</p>
        </div>
    )
}