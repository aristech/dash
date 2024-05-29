import {InputText} from "primereact/inputtext";
import React from "react";

export default function SearchInput({handleSearch, name, value}) {
    return (
        <div className="flex justify-content-start  ">
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search "/>
                    <InputText
                        style={{ minWidth: '120px', maxWidth: '140px' }}
                        name={name}
                        value={value}
                        className="custom_input"
                        onChange={handleSearch}
                    />
                </span>
    </div>
    )
}