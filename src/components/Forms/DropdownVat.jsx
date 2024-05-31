import {useState, useEffect} from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

const VatDropdown = ({ state, handleState, isEdit =false, error, required = false }) => {
    const [options, setOptions] = useState([]);

    const handleFetch = async () => {
      let { data } = await axios.post("/api/product/apiProductFilters", {
        action: "findVats",
      });
      setOptions(data.result);
    };
    useEffect(() => {
      handleFetch();
    }, []); 

    useEffect(() => {
        if(!isEdit && !options) return
        let option = options.find((option) => option.VAT == state);
        if(!option) return;
        handleState(option);
    }, [options]);

    
    return (
      <div className="w-full">
        <label className={`custom_label ${error ? "text-red-500" : null}`}>Αλλαγή ΦΠΑ {required && "*"}</label>
        <Dropdown
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="NAME"
          placeholder="ΦΠΑ"
          className="w-full custom_dropdown"
        />
        <p className="text-red-500 mt-1">{error}</p>
      </div>
    );
  };

  export default VatDropdown;