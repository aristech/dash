import {useState, useEffect} from "react";
import {Dropdown} from "primereact/dropdown";
import axios from "axios";


export default function DropdownCategories
    ({
         state,
         handleState,
         isEdit = false,
         error,
         required = false
     }) {
    const [options, setOptions] = useState([]);
    const handleFetch = async () => {
        let {data} = await axios.post("/api/product/apiProductFilters", {
            action: "findCategories",
        });
        setOptions(data.result);
    };
    useEffect(() => {
        (async () => {
            await handleFetch();
        })()
    }, []);

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
    }


    return (
        <div>
            <label className={`mb-1 block ${error ? "text-red-500" : null}`}>
                Εμπορική Κατηγορία
                {required && <span className="ml-1 font-bold text-red-500">*</span>}
            </label>
            <Dropdown
                filter
                value={state}
                onChange={(e) => handleState(e.target.value)}
                options={options}
                optionLabel="categoryName"
                placeholder="Κατηγορία"
                className="w-full"
            />
            {error && <p className="text-red-500 mt-1">{error}</p>}
        </div>
    );
};

 