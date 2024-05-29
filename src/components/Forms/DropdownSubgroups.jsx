import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { sub } from "date-fns";


export default function DropdownSubroups({
  state,
  isFilter = false,
  isEdit = false,
  error,
  required = false,
  groupId,
  categoryId,
  handleState,
  handleClear
}) {
  const [options, setOptions] = useState([]);

  const handleFetch = async () => {
    let { data } = await axios.post("/api/product/apiProductFilters", {
      action: "findSubGroups",
      groupID: groupId,
    });
   
    if (data.success) {
      setOptions(data.result);
    }
  };


  useEffect(() => {
    if(!groupId) return
    (async () => {
      await handleFetch();
    })();
  }, [groupId, categoryId]);


  
  useEffect(() => {
    if (isEdit) {
      let option = options.find((option) => option.softOne.cccSubgroup2 == state);
      if (option) {
        handleState(option);
      }
    }
  }, [options, isEdit ]);


  return (
    <div>
      {
        !isFilter ? (
          <label className={`custom_label ${error ? "text-red-500" : null}`}>
          Υποομάδα
          {required && <span className="ml-1 font-bold text-red-500">*</span>}
        </label>
         ) : null
      }
      <div className="custom_dropdown_wrapper">
      <Dropdown
        filter
        loading
        disabled={!groupId}
        value={state}
        onChange={(e) => handleState( e.target.value)}
        options={options}
        optionLabel="subGroupName"
        placeholder="Yποομάδα"
        className="custom_dropdown"
        style={isFilter ? { width: '140px' } : null}
      />
      {error ?  <p className="text-red-500 mt-1">{error}</p> : null}
      {state ? <i className="icon pi pi-times" onClick={handleClear} /> : null}
      </div>
   
    </div>
  );
}
