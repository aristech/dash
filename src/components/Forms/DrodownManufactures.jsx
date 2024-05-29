import {useState, useEffect} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";


export default function DropdownManufacturers ({ 
    state, 
    handleState, 
    isEdit =false, 
    error, 
    required = false 
}) {
    const [options, setOptions] = useState([]);
  
    const handleFetch = async () => {
        let { data } = await axios.post("/api/product/apiProductFilters", {
          action: "findManufacturers",
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
        let option = options.find((option) => option.MTRMANFCTR == state);
        if(!option) return;
        handleState(option);
    }, [options]);
   
  
    return (
      <div>
        <label className={`custom_label ${error ? "text-red-500" : null}`}>
            Κατασκευαστής 
            {required && <span className="ml-1 font-bold text-red-500">*</span>}
            </label>
        <Dropdown
          filter
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="NAME"
          placeholder="Κατασκευαστής"
          className="w-full custom_dropdown"
        />
        {error && <p className="text-red-500 mt-1">{error}</p>}
      </div>
    );
  };

 