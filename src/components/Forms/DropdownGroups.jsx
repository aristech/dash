import { useState, useEffect, use } from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

export default function DropdownGroups({
  state,
  handleState,
  handleClear,
  isEdit = false,
  isFilter = false,
  error,
  required = false,
  categoryId,
  type,
}) {
  const [options, setOptions] = useState([]);
  



  const handleFetch = async () => {
    let { data } = await axios.post("/api/product/apiProductFilters", {
      action: "findGroups",
      categoryID: categoryId,
    });
    setOptions(data.result);
  };

  useEffect(() => {
    if(!categoryId) return
    (async () => {
      await handleFetch();
    })();
  }, [categoryId]);

  useEffect(() => {
    if (!isEdit) return;
    let option = options?.find((option) => option.softOne.MTRGROUP == state);
    if (!option) return;
    handleState(option);
  }, [options]);

  return (
    <div>
      {!isFilter ? (
        <label className={`custom_label ${error ? "text-red-500" : null}`}>
          Ομάδα
          {required && <span className="ml-1 font-bold text-red-500">*</span>}
        </label>
      ) : null}
      <div className="custom_dropdown_wrapper">
        <Dropdown
          filter
          disabled={!categoryId}
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="groupName"
          placeholder="Ομάδα"
          className="custom_dropdown"
          style={isFilter ? { width: "140px" } : null}
        />
        <p className="text-red-500 mt-1">{error}</p>
        {error ? <p className="text-red-500 mt-1">{error}</p> : null}
        {handleClear && state ? (
          <i className="icon pi pi-times" onClick={handleClear} />
        ) : null}
      </div>
    </div>
  );
}
