import {useState, useEffect, use} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";


export default function DropdownIntrastat ({ 
    state, 
    handleState, 
    isEdit =false, 
    error, 
    required = false 
}) {
    const [options, setOptions] = useState([]);

  
    const handleFetch = async () => {
        let { data } = await axios.post("/api/product/apiProductFilters", {
          action: "findIntrastat",
        });
        setOptions(data.result);
      };
      useEffect(() => {
        (async () => {
          await  handleFetch();
        })()
      }, []);

    
      useEffect(() => {
        if(!isEdit && !options) return
          let option = options.find((option) => option?.INTRASTAT == state);
          if(!option) return;
          handleState(option);
      }, [options]);
  

 
  
    return (
      <div className="w-full">
        <label className={`custom_label ${error ? "text-red-600" : null}`}>
            INTRASTAT
            {required && <span className="ml-1 font-bold text-red-500">*</span>}
            </label>
        <Dropdown
          showClear
          filter
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="NAME"
          placeholder="INTRASTAT"
          className={`custom_dropdown ${error ? "p-invalid" : null}`}
        />
        {error && <p className="text-red-600 mt-1">{error}</p>}
      </div>
    );
  };

 