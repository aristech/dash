"use client";
import React, { useState, useEffect, useRef, use } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/router";
import { Dropdown } from "primereact/dropdown";
import {
  setCategory,
  setGroup,
  setSubgroup,
  setFilters,
  setLazyState,
  setLoading,
  resetSelectedFilters,
  setSearchTerm,
  setSort,
  setSelectedProducts,
  setMarka,
} from "@/features/productsSlice";
import DropdownCategories from "../Forms/DropdownCategories";
import DropdownGroups from "../Forms/DropdownGroups";
import DropdownSubroups from "../Forms/DropdownSubgroups";
import DropdownBrands from "../Forms/DropdownBrands";
import { SearchAndSort } from "../Forms/SearchAndSort";

const ProductSearchGrid = () => {
  const dispatch = useDispatch();
  const { marka, lazyState, searchTerm, sort, selectedProducts } = useSelector(
    (store) => store.products
  );
  const { selectedMarkes } = useSelector((state) => state.supplierOrder);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [data, setData] = useState([]);
  const [codeSearch, setCodeSearch] = useState("");
  const [sortState, setSortState] = useState({
    ean: 0,
    name: 1,
  });
  const [stateFilters, setStateFilters] = useState({
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
    console.log({ data });
  }, [data]);

  const fetch = async () => {
    try {
      let { data } = await axios.post("/api/product/apiProductFilters", {
        action: "productSearchGrid",
        skip: lazyState.first,
        limit: lazyState.rows,
        mtrmark: selectedMarkes?.mtrmark,
        sort: sort,
        marka: marka,
        softoneFilter: null,
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
    selectedMarkes,
    lazyState.rows,
    lazyState.first,
    searchTerm,
    marka,
    sort,
    codeSearch,
    stateFilters,
  ]);

  useEffect(() => {
    dispatch(setLazyState({ ...lazyState, first: 0 }));
  }, [selectedMarkes]);

  const onSelectionChange = (e) => {
    dispatch(setSelectedProducts(e.value));
  };

  const onPage = (event) => {
    dispatch(
      setLazyState({ ...lazyState, first: event.first, rows: event.rows })
    );
  };

  //CATEGORIZATION:
  const handleCategoryChange = (value) => {
    setStateFilters((prev) => ({ ...prev, MTRCATEGORY: value }));
  };

  const handleGroupChange = (value) => {
    setStateFilters((prev) => ({ ...prev, MTRGROUP: value }));
  };
  const handleSubgroupChange = (value) => {
    setStateFilters((prev) => ({ ...prev, CCCSUBGROUP2: value }));
  };
  //BRANDS:
  const handleBrandChange = (value) => {
    setStateFilters((prev) => ({ ...prev, MTRMARK: value }));
  };

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
              setStateFilters((prev) => ({ ...prev, nameSearch: value }))
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
          <span className="font-bold">{availability.DIATHESIMA}</span>
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
            handleState={handleBrandChange}
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
            handleState={handleCategoryChange}
            handleClear={handleCategoryClear}
            state={stateFilters?.MTRCATEGORY}
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
            handleState={handleGroupChange}
            handleClear={handleGroupClear}
            categoryId={stateFilters?.MTRCATEGORY?.softOne.MTRCATEGORY}
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
            handleState={handleSubgroupChange}
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
              setStateFilters((prev) => ({ ...prev, eanSearch: value }))
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
