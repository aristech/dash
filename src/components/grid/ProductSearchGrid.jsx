"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedProducts,
} from "@/features/productsSlice";
import DropdownCategories from "../Forms/DropdownCategories";
import DropdownGroups from "../Forms/DropdownGroups";
import DropdownSubroups from "../Forms/DropdownSubgroups";
import DropdownBrands from "../Forms/DropdownBrands";
import { SearchAndSort } from "../Forms/SearchAndSort";

const ProductSearchGrid = () => {
  const dispatch = useDispatch();
  const { selectedProducts } = useSelector(
    (store) => store.products
  );

  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [data, setData] = useState([]);

  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 20,
    page: 1,
  })
  const [sortState, setSortState] = useState({
    ean: 0,
    name: 1,
  });
  const [stateFilters, setStateFilters] = useState({
    nameSearch: "",
    impaSearch: "",
    eanSearch: "",
    skroutz: null,
    active: true,
    MTRCATEGORY: null,
    MTRGROUP: null,
    CCCSUBGROUP2: null,
    MTRMARK: null,
  });

  
  useEffect(() => {
    dispatch(setSelectedProducts([]));
  }, [])

  const fetch = async () => {
    try {
      let { data } = await axios.post("/api/product/apiProductFilters", {
        action: "productSearchGrid",
        skip: lazyState.first,
        limit: lazyState.rows,
        stateFilters: stateFilters,
      });
      setData(data.result);
      setTotalRecords(data.totalRecords);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetch();
  }, [
    lazyState,
    stateFilters,
  ]);



  const onSelectionChange = (e) => {
    dispatch(setSelectedProducts(e.value));
  };

  const onPage = (event) => {
      setLazyState((prev) => ({
        ...prev,
        first: event.first,
        rows: event.rows,
      }))
  };

 

  const handleInputChange = (value, name) => {
    setStateFilters((prev) => ({ ...prev, [name]: value }));
  }

  //On filter button clear empty the states and the dependats:
  const handleCategoryClear = () => {
    setStateFilters((prev) => ({
      ...prev,
      MTRCATEGORY: null,
      MTRGROUP: null,
      CCCSUBGROUP2: null,
    }));
  };
  const handleGroupClear = () => {
    setStateFilters((prev) => ({
      ...prev,
      MTRGROUP: null,
      CCCSUBGROUP2: null,
    }));
  };
  const handleSubgroupClear = () => {
    setStateFilters((prev) => ({ ...prev, CCCSUBGROUP2: null }));
  };

  return (
    <DataTable
      value={data}
      paginator
      loading={loading}
      rows={lazyState.rows}
      rowsPerPageOptions={[20, 50, 100, 200, 500]}
      first={lazyState.first}
      lazy
      totalRecords={totalRecords}
      onPage={onPage}
      selectionMode={"checkbox"}
      selection={selectedProducts}
      onSelectionChange={onSelectionChange}
      className="border-1 border-round-sm	border-50"
      size="small"
      filterDisplay="row"
      showGridlines
      id={"_id"}
    >
      <Column selectionMode="multiple" headerStyle={{ width: "30px" }}></Column>

      <Column
        field="NAME"
        filter
        showFilterMenu={false}
        body={NameTemplate}
        header="Προϊόν"
        filterElement={() => (
          <SearchAndSort
            state={stateFilters.nameSearch}
            handleState={(value) =>
              handleInputChange(value, "nameSearch")
            }
            sort={sortState.ean}
            handleSort={() =>
              setSortState((prev) => ({
                ...prev,
                name: prev.name === 0 ? 1 : prev.name === 1 ? -1 : 0,
              }))
            }
          />
        )}
      ></Column>
      <Column
        field="availability.DIATHESIMA"
        header="Διαθέσιμα"
		    style={{ maxWidth: "90px", textAlign: "center" }}
        body={({ availability }) => (
          <span className="font-bold">{availability?.DIATHESIMA}</span>
        )}
      ></Column>
      <Column
        field="MTRMARK_NAME"
        style={{ maxWidth: "160px" }}
        header="Όνομα Μάρκας"
        filter
        showFilterMenu={false}
        filterElement={() => (
          <DropdownBrands
            state={stateFilters.MTRMARK}
            handleState={(value) => handleInputChange(value, "MTRMARK")}
            isFilter
          />
        )}
      ></Column>
      <Column
        field="CATEGORY_NAME"
        header="Εμπορική Κατηγορία"
        filter
        showFilterMenu={false}
        filterElement={() => (
          <DropdownCategories
            isFilter
            handleState={(value) => handleInputChange(value, "MTRCATEGORY")}
            handleClear={handleCategoryClear}
            state={stateFilters.MTRCATEGORY}
          />
        )}
      ></Column>

      <Column
        header="Ομάδα"
        field="GROUP_NAME"
        showFilterMenu={false}
        filter
        filterElement={() => (
          <DropdownGroups
            state={stateFilters.MTRGROUP}
            handleState={(value) => handleInputChange(value, "MTRGROUP")}
            handleClear={handleGroupClear}
            categoryId={stateFilters?.MTRCATEGORY?.softOne?.MTRCATEGORY}
            isFilter
          />
        )}
      ></Column>
      <Column
        field="SUBGROUP_NAME"
        header="Υποομάδα"
        filter
        showFilterMenu={false}
        filterElement={() => (
          <DropdownSubroups
            state={stateFilters.CCCSUBGROUP2}
            handleState={(value) => handleInputChange(value, "CCCSUBGROUP2")}
            handleClear={handleSubgroupClear}
            groupId={stateFilters.MTRGROUP?.softOne.MTRGROUP}
            categoryId={stateFilters.MTRCATEGORY?.softOne.MTRCATEGORY}
            isFilter
          />
        )}
      ></Column>
      <Column
        field="CODE1"
        header="EAN"
        filter
        style={{ maxWidth: "150px" }}
        showFilterMenu={false}
        filterElement={() => (
          <SearchAndSort
            state={stateFilters.eanSearch}
            handleState={(value) =>
              handleInputChange(value, "eanSearch")
            }
            sort={sortState.ean}
            handleSort={() =>
              setSortState((prev) => ({
                ...prev,
                ean: prev.ean === 0 ? 1 : prev.ean === 1 ? -1 : 0,
              }))
            }
          />
        )}
      ></Column>
    </DataTable>
  );
};

const NameTemplate = ({ NAME, SOFTONESTATUS, PRICER }) => {
  return (
    <div>
      <p className="font-bold">{NAME}</p>
      <div>
        <div className="flex align-items-center">
          <div
            style={{ width: "5px", height: "5px" }}
            className={`${
              SOFTONESTATUS === true ? "bg-green-500" : "bg-red-500"
            } border-circle mr-1 mt-1`}
          ></div>
          <p>softone</p>
        </div>
		<div>
			<span className="text-600">Τιμή:</span>
			<span className="font-bold">{PRICER}€</span>
		</div>
      </div>
    </div>
  );
};

export default ProductSearchGrid;
