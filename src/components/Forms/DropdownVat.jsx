import {useState, useEffect} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

const VatDropdown = ({ state, handleState, isEdit =false, error, required = false, showOnly=false, disabled=false }) => {
    const [options, setOptions] = useState([]);
    console.log({state})
    const handleFetch = async () => {
      let { data } = await axios.post("/api/product/apiProductFilters", {
        action: "findVats",
      });
      console.log(data)
      setOptions(data.result);
    };
    useEffect(() => {
      handleFetch();
    }, []); 

    useEffect(() => {
        if(!isEdit && !options) return
        let option = options.find((option) => option.VAT == state);
        console.log({option})
        if(!option) return;
        handleState(option);
    }, [options]);

    
    return (
      <div className="w-full">
        <label className={`custom_label ${error ? "text-red-600" : null}`}>Αλλαγή ΦΠΑ {required && "*"}</label>
        <Dropdown
          disabled={disabled}
          showClear
          filter
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="NAME"
          placeholder="ΦΠΑ"
          className={`custom_dropdown ${error ? "p-invalid" : null}`}
        />
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  };

  export default VatDropdown;