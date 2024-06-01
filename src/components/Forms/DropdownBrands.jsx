import {useState, useEffect} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";


export default function DropdownBrands({ 
    state, 
    handleState, 
    isEdit =false,
    isFilter=false, 
    error, 
    required = false 
}) {
    const [options, setOptions] = useState([]);

  
    const handleFetch = async () => {
        let { data } = await axios.post("/api/product/apiProductFilters", {
          action: "findBrands",
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
        let option = options.find((option) => option.softOne.MTRMARK === state);
        if(!option) return;
        handleState(option);
    }, [options]);

    return (
      <div className="w-full">
        {!isFilter ? (
            <label className={`custom_label ${error ? "text-red-600" : null}`}>
            Μάρκα
            {required && <span className="ml-1 font-bold text-red-500">*</span>}
            </label>
        ): null}
        <Dropdown
          filter
          value={state}
          showClear
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="softOne.NAME"
          placeholder="Μάρκα"
          className={`custom_dropdown ${error ? "p-invalid" : null}`}
          style={isFilter ? { width: '140px' } : null}
        />
        {error && <p className="text-red-600 mt-1">{error}</p>}

      </div>
    );
  };

 