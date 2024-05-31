import { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";

export default function DropdownCategories({
  state,
  handleState,
  isEdit = false,
  error,
  required = false,
  isFilter = false,
  handleClear
}) {
  //if the dropdown is used for filters then remove the label, and make it smaller:

  //setValue comes from react-hook-forms, it is used to set the value of the dropdown
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log({ state })
  const handleFetch = async () => {
    setLoading(true);
    let { data } = await axios.post("/api/product/apiProductFilters", {
      action: "findCategories",
    });
    setOptions(data.result);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await handleFetch();
    })();
  }, []);

  //if the dropdown is used for editing a product, the value recieved is different than the one we need to display
  //so we filter the options based on the state that will be a number to find the correct object:
  useEffect(() => {
    if (isEdit) {
      handleEdit(options);
    }
  }, [options]);

  const handleEdit = (options) => {
    let option = options.find((option) => option.softOne.MTRCATEGORY == state);
    if (option) {
      handleState(option);
    }
  };



  return (
    <div className="w-full">
      {!isFilter && (
        <label className="custom_label">
          Κατηγορία
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="custom_dropdown_wrapper">
        <Dropdown
          disabled={loading}
          size="small"
          value={state}
          onChange={(e) => handleState(e.target.value)}
          options={options}
          optionLabel="categoryName"
          placeholder="Κατηγορία"
          style={isFilter ? { width: '140px' } : null}
          className="custom_dropdown"
        />
         {error ?  <p className="text-red-500 mt-1">{error}</p> : null}
      {handleClear && state ? <i className="icon pi pi-times" onClick={handleClear} /> : null}
      </div>
    </div>
  );
}
