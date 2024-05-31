"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { useDispatch } from "react-redux";
import { setGridRowData } from "@/features/grid/gridSlice";
import RegisterUserActions from "@/components/grid/GridRegisterUserActions";
import { MultiSelect } from "primereact/multiselect";
import { TabView, TabPanel } from "primereact/tabview";
import { InputTextarea } from "primereact/inputtextarea";
import ProductActions from "@/components/grid/Product/ProductActions";
import { ProductDialog } from "@/GridDialogs/ProductDialog";
import ClassificationDialog from "@/GridDialogs/product/ClassificationDialog";
import ProductToolbar from "@/components/grid/Product/ProductToolbar";
import {
  ProductAvailability,
  ProductOrdered,
  ProductReserved,
} from "@/components/grid/Product/ProductAvailability";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { ProductQuantityProvider } from "@/_context/ProductGridContext";
import { useSession } from "next-auth/react";
import { Button } from "primereact/button";
import { useRouter } from "next/router";
import StepHeader from "@/components/StepHeader";
import { OverlayPanel } from "primereact/overlaypanel";
import XLSXDownloadButton from "@/components/exportCSV/Product";
import MassiveImageUpload from "@/components/MassiveImageUpload";
import format from "date-fns/format";
import { el } from "date-fns/locale";
import { useSelector } from "react-redux";
import {
  setCategory,
  setGroup,
  setSubgroup,
  setFilters,
  setLazyState2,
  setLoading,
  resetSelectedFilters,
  setSearchTerm,
  setSort,
  setSortEan,
  setSoftoneFilter,
  setSubmitted,
  setMarka,
  setSortPrice,
  setSortImpa,
  setSelectedProducts,
} from "@/features/productsSlice";
import ProductImagesComp from "@/components/grid/Product/ProductImageComp";
import { Image as PrimeImage } from "primereact/image";
import Link from "next/link";
import { Message } from "primereact/message";
import { SearchAndSort } from "@/components/Forms/SearchAndSort";
import DropdownCategories from "@/components/Forms/DropdownCategories";
import DropdownGroups from "@/components/Forms/DropdownGroups";
import DropdownSubroups from "@/components/Forms/DropdownSubgroups";
import DropdownManufacturers from "@/components/Forms/DrodownManufactures";
import DropdownBrands from "@/components/Forms/DropdownBrands";
import DropdownCustom from "@/components/Forms/DropdownCustom";

const initialColumns = [
  {
    header: "Εμπορική Κατηγορία",
    id: 9,
  },
  {
    header: "Ομάδα",
    id: 10,
  },
  {
    header: "Υποομάδα",
    id: 11,
  },
  {
    header: "Διαθέσιμα",
    id: 12,
  },
  {
    header: "Όνομα",
    id: 14,
  },
];

const columns = [
  ...initialColumns,
  {
    header: "Ανανέωση Από",
    id: 1,
  },

  {
    header: "Δεσμευμένα",
    id: 2,
  },

  {
    header: "Μάρκα",
    id: 4,
  },
  {
    header: "EAN",
    id: 5,
  },
  {
    header: "Κωδ. ΙMPA",
    id: 6,
  },
  {
    header: "Τιμή Scroutz",
    id: 7,
  },
  {
    header: "Τιμή Κόστους",
    id: 13,
  },
  {
    header: "Ελαχιστοποίηση",
    id: 15,
  },
  {
    header: "Κατασκευαστής",
    id: 16,
  },
  {
    header: "Κωδικός ERP",
    id: 17,
  },
  {
    header: "Τιμή Χονδρικής",
    id: 18,
  },
];

export default function ProductLayout() {
  return (
    <ProductQuantityProvider>
      <Product />
    </ProductQuantityProvider>
  );
}

function Product() {
  const op = useRef(null);
  const toast = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  let user = session?.user?.user;
  const [data, setData] = useState([]);
  const {
    selectedProducts,
    submitted,
    filters,
    category,
    group,
    subgroup,
    lazyState2,
    // loading,
    searchTerm,
    sort,
    softoneFilter,
    sortAvailability,
    marka,
    sortPrice,
    sortEan,
    sortImpa,
  } = useSelector((store) => store.products);
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [classDialog, setClassDialog] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(initialColumns);
  const [expandedRows, setExpandedRows] = useState(null);
  //DIALOG:
  const [dialog, setDialog] = useState({
    state: false,
    isEdit: false,
  });

  const [sortState, setSortState] = useState({
    NAME: 1,
    //EAN CODE:
    CODE1: 0,
    //ΛΙΑΝΙΚΗΣ:
    PRICER: 0,
    impas: 0,
  });

  const INITIAL_STATE_FILTERS = {
    //SEARCHES:
    nameSearch: "",
    impaSearch: "",
    erpCode: "",
    codeSearch: "",
    //CATEGORIZATION:
    manufacturer: null,
    MTRCATEGORY: null,
    MTRGROUP: null,
    CCCSUBGROUP2: null,
    MTRMARK: null,
    MANUFACTURER: null,
    //STATUSES:
    SOFTONESTATUS: true,
    ISACTIVE: true,
    skroutz: null,
    active: true,
    images: null,
  }

  const [stateFilters, setStateFilters] = useState(INITIAL_STATE_FILTERS);

  console.log({stateFilters})
  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: message,
      detail: message,
      life: 4000,
    });
  };
  const fetchProducts = async () => {
    if ( !stateFilters.codeSearch && !stateFilters.impaSearch && !stateFilters.erpCode && !stateFilters.nameSearch) {
        //create a conditional loading state:
        setLoading(true)
    }
 
    try {
      let { data } = await axios.post("/api/product/apiProductFilters", {
        action: "productSearchGrid",
        sortState: sortState,
        skip: lazyState2.first,
        limit: lazyState2.rows,
        stateFilters: stateFilters,
      });

      setData(data?.result);
      setTotalRecords(data?.totalRecords);
      
    } catch (e) {
      console.log(e);
      showError(e.message)
    } finally {
      setLoading(false)
    }
  };


  useEffect(() => {
      dispatch(setSelectedProducts([]))
  }, [])
  useEffect(() => {
    fetchProducts();
  }, [lazyState2,submitted,stateFilters,sortState]);

  const allowExpansion = (rowData) => {
    return rowData;
  };

  const onColumnToggle = (event) => {
    //change the visible columns
    let selectedColumns = event.value;
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.id === col.id)
    );
    setVisibleColumns(orderedSelectedColumns);
  };

  // -------------------- ADD / EDIT DIALOG ACTIONS --------------------------------
  const onAdd = async () => {
    dispatch(setSubmitted());
    setDialog((prev) => ({ ...prev, state: true, isEdit: false }));
  };

  const onEdit = async (product) => {
    dispatch(setSubmitted());
    setDialog((prev) => ({ ...prev, state: true, isEdit: true }));
    setRowData(product);
  };

  const editClass = async (product) => {
    setClassDialog(true);
    dispatch(setGridRowData(product));
  };

  const hideDialog = () => {
    setDialog({
      state: false,
      isEdit: false,
    });
    setClassDialog(false);
  };

  // -------------------- DISPATCH SELECTED PRODUCTS --------------------------------
  const onSelection = (e) => {
    dispatch(setSelectedProducts(e.value));
  };

  // Pagination state changes:
  const onPage = (event) => {
    dispatch(
      setLazyState2({ ...lazyState2, first: event.first, rows: event.rows })
    );
  };



  //HANDLE THE DROPDOWN FILTERS:
  const handleDropdownState = (value, name) => {
    setStateFilters((prev) => ({ ...prev, [name]: value }));
  };

  //HANDLE SORTING:
  //IF THERE IS NO VALUE RESET TO THE DEFAULT STATE AND EMPTY THE OBJECT FULLY (INTENIONAL)
  const handleSort = (value, name) => {
    if(value === null) {
        setSortState({ })
        return;
    }
    setSortState({ [name]: value });
  };

  //CREAL STATES FOR THE CATEGORIZATION DROPDOWNS AND THE DEPENDATS:
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
    <AdminLayout>
      <Toast ref={toast} />
      <div>
        <StepHeader text="Προϊόντα" />
      </div>
      <Button
        size="small"
        type="button"
        className="mb-3"
        severity="secondary"
        icon="pi pi-bars"
        label="Menu"
        onClick={(e) => op.current.toggle(e)}
      />
      <div className="mb-2">
        <Message
          severity="info"
          text="Κάνοντας click πάνω στον πίνακα των προϊόντων, πατώντας τα βελάκια δεξί/αριστερό μπορείτε να πλοηγηθείτε στο εσωτερικό του πίνακα για να δείτε τις στήλες που δεν φαίνονται"
        />
      </div>
      <OverlayPanel ref={op}>
        <div className="flex flex-column align-center">
          <Button
            label="Προσφορές πολλαπλών επιλογών"
            outlined
            severity="secondary"
            className="mt-2 w-20rem"
            onClick={() => router.push("/dashboard/multi-offer")}
          />
          <Button
            label="Προσφορές σε πελάτη"
            outlined
            severity="secondary"
            className="mb-3 mt-1 w-20rem"
            onClick={() => router.push("/dashboard/offer")}
          />
          <MassiveImageUpload />
          <div className="flex align-items-center justify-content-center">
            <Link
              className="underline cursor-pointer mt-2"
              href="/uploadImagesKoll1.xlsx"
            >
              Κατεβάστε το δείγμα xlsx φωτογραφιών
            </Link>
          </div>
        </div>
      </OverlayPanel>
      <ProductToolbar
        setSubmitted={setSubmitted}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
      />
      <div className="dataTable">
        <DataTable
          header={() => (
            <RenderHeader
              INITIAL_STATE_FILTERS={INITIAL_STATE_FILTERS}
              setVisibleColumns={setVisibleColumns}
              selectedProducts={selectedProducts}
              setStateFilters={setStateFilters}
              stateFilters={stateFilters}
              visibleColumns={visibleColumns}
              onColumnToggle={onColumnToggle}
              columns={columns}
            />
          )}
          first={lazyState2.first}
          lazy
          totalRecords={totalRecords}
          onPage={onPage}
          className="p-dataTable-sm "
          selectionMode={"checkbox"}
          selection={selectedProducts}
          onSelectionChange={onSelection}
          paginator
          rows={lazyState2.rows}
          rowsPerPageOptions={[20, 50, 100, 200, 500]}
          value={data}
          showGridlines
          dataKey="_id"
          filterDisplay="row"
          loading={loading}
          removableSort
          editMode="row"
          onRowExpand={(e) => setExpandedRows({ [e.data._id]: true })}
          onRowCollapse={(e) => setExpandedRows(null)}
          rowExpansionTemplate={rowExpansionTemplate}
          expandedRows={expandedRows}
        >
          <Column
            bodyStyle={{ textAlign: "center" }}
            expander={allowExpansion}
            style={{ width: "30px" }}
          />
          <Column selectionMode="multiple" style={{ width: "30px" }}></Column>
          {user?.role === "admin" ? (
            <Column
              style={{ width: "30px" }}
              body={(rowData) => (
                <ProductActions
                  rowData={rowData}
                  onEdit={onEdit}
                  onAdd={onAdd}
                  onEditClass={editClass}
                />
              )}
            ></Column>
          ) : null}
          <Column body={ImagesTemplate} style={{ width: "30px" }}></Column>
          {visibleColumns.some((column) => column.id === 14) && (
            <Column
              field="NAME"
              style={{ minWidth: "400px" }}
              header="Όνομα"
              filter
              showFilterMenu={false}
              filterElement={() => (
                <SearchAndSort
                  state={stateFilters?.nameSearch}
                  handleState={(value) =>
                    setStateFilters((prev) => ({ ...prev, nameSearch: value }))
                  }
                  sort={sortState.NAME}
                  handleSort={(val) => handleSort(val, "NAME")}
                />
              )}
              body={NameTemplate}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 15) && (
            <Column
              field="NAME"
              style={{ minWidth: "400px" }}
              header="Όνομα"
              filter
              showFilterMenu={false}
              filterElement={() => (
                <SearchAndSort
                  state={stateFilters.nameSearch}
                  handleState={(value) =>
                    setStateFilters((prev) => ({ ...prev, nameSearch: value }))
                  }
                  sort={sortState.NAME}
                  handleSort={(val) => handleSort(val, "NAME")}
                />
              )}
              body={MinimalTemplate}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 6) && (
            <Column
              field="impas.code"
              className="column_med"
              header="Κωδικός Impa"
              body={ImpaCode}
              filter
              filterElement={() => (
                <SearchAndSort
                  state={stateFilters.impaSearch}
                  handleState={(value) =>
                    setStateFilters((prev) => ({ ...prev, impaSearch: value }))
                  }
                  sort={sortState.impas}
                  handleSort={(val) => handleSort(val, "impas")}
                />
              )}
              showFilterMenu={false}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 9) && (
            <Column
              field="CATEGORY_NAME"
              header="Εμπορική Κατηγορία"
              filter
              //products.css // maxWidth: 185px
              className="column_med"
              filterElement={() => (
                <DropdownCategories
                  isFilter
                  handleState={(val) => handleDropdownState(val, "MTRCATEGORY")}
                  handleClear={handleCategoryClear}
                  state={stateFilters?.MTRCATEGORY}
                />
              )}
              showFilterMenu={false}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 10) && (
            <Column
              field="GROUP_NAME"
              showFilterMenu={false}
              filter
              filterElement={() => (
                <DropdownGroups
                  isFilter
                  handleState={(val) => handleDropdownState(val, "MTRGROUP")}
                  handleClear={handleGroupClear}
                  state={stateFilters?.MTRGROUP}
                  categoryId={stateFilters?.MTRCATEGORY?.softOne?.MTRCATEGORY}
                />
              )}
              //products.css // maxWidth: 185px
              className="column_med"
              header="Ομάδα"
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 11) && (
            <Column
              field="SUBGROUP_NAME"
              header="Υποομάδα"
              filter
              //products.css // maxWidth: 185px
              className="column_med"
              showFilterMenu={false}
              filterElement={() => (
                <DropdownSubroups
                  isFilter
                  state={stateFilters?.CCCSUBGROUP2}
                  handleState={(val) =>
                    handleDropdownState(val, "CCCSUBGROUP2")
                  }
                  handleClear={handleSubgroupClear}
                  groupId={stateFilters?.MTRGROUP?.softOne?.MTRGROUP}
                  categoryId={stateFilters?.MTRCATEGORY?.softOne?.MTRCATEGORY}
                />
              )}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 16) && (
            <Column
              field="MTRMARK_NAME"
              header="Κατασκευαστής"
              filter
              //products.css // maxWidth: 185px
              className="column_med"
              showFilterMenu={false}
              filterElement={() => (
                <DropdownManufacturers
                  state={stateFilters.MANUFACTURER}
                  handleState={(val) =>
                    handleDropdownState(val, "MANUFACTURER")
                  }
                />
              )}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 12) && (
            <Column
              field="availability.DIATHESIMA"
              bodyStyle={{ textAlign: "center" }}
              body={productAvailabilityTemplate}
              style={{ maxWidth: "130px" }}
              header="Διαθέσιμα"
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 1) && (
            <Column
              field="availability.SEPARAGELIA"
              body={productOrderedTemplate}
              style={{ width: "90px" }}
              header="Παραγγελία"
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 2) && (
            <Column
              field="availability.DESVMEVMENA"
              body={productReservedTemplate}
              style={{ width: "90px" }}
              header="Δεσμευμένα"
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 3) && (
            <Column
              field="updatedFrom"
              header="Ανανέωση Από"
              style={{ width: "80px" }}
              body={UpdatedFromTemplate}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 4) && (
            <Column
              field="MTRMARK_NAME"
              header="Μάρκα"
              filter
              //products.css // maxWidth: 185px
              className="column_med"
              style={{ maxWidth: "160px" }}
              showFilterMenu={false}
              filterElement={() => (
                <DropdownBrands
                  isFilter
                  state={stateFilters.MTRMARK}
                  handleState={(val) => handleDropdownState(val, "MTRMARK")}
                />
              )}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 5) && (
            <Column
              field="CODE1"
              header="EAN"
              filter
              //products.css // maxWidth: 185px
              className="column_med"
              showFilterMenu={false}
              filterElement={() => (
                <SearchAndSort
                state={stateFilters.eanSearch}
                handleState={(value) =>
                  setStateFilters((prev) => ({ ...prev, eanSearch: value }))
                }
                sort={sortState.CODE1}
                handleSort={(val) => handleSort(val, "CODE1")}
              />
              )}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 13) && (
            <Column
              field="COST"
              style={{ width: "40px" }}
              header="Τιμή Κόστους"
              body={Cost}
            ></Column>
          )}
          {visibleColumns.some((column) => column.id === 18) && (
            <Column
              field="PRICEW"
              style={{ width: "40px" }}
              header="Τιμή Xονδρικής"
              body={(data) => <PriceTemplate price={data.PRICEW} />}
            ></Column>
          )}
          <Column
            style={{ width: "40px" }}
            field="PRICER"
            header="Τιμή Λιανικής"
            body={(data) => <PriceTemplate price={data.PRICER} />}
            filter
            showFilterMenu={false}
            filterElement={() => (
                <SearchAndSort
                isSearch={false}
                sort={sortState.PRICER}
                handleSort={(val) => handleSort(val, "PRICER")}
              />
            )}
          ></Column>
          {visibleColumns.some((column) => column.id === 7) && (
            <Column field="PRICER01" header="Τιμή Scroutz"></Column>
          )}
          {visibleColumns.some((column) => column.id === 17) && (
            <Column field="CODE2" header="Κωδικός ERP"></Column>
          )}
          {/* <Column style={{ width: '40px' }} field="PRICER01" header="Τιμή Scroutz"></Column> */}
        </DataTable>
      </div>
      {dialog.state ? (
        <ProductDialog
          isEdit={dialog.isEdit}
          data={rowData}
          dialog={dialog.state}
          hideDialog={hideDialog}
          setSubmitted={setSubmitted}
        />
      ) : null}
      <ClassificationDialog
        dialog={classDialog}
        setDialog={setClassDialog}
        hideDialog={hideDialog}
        setSubmitted={setSubmitted}
      />
    </AdminLayout>
  );
}

const RenderHeader = ({

  setStateFilters,
  stateFilters,
  visibleColumns,
  onColumnToggle,
  columns,
  selectedProducts,
  setVisibleColumns,
  INITIAL_STATE_FILTERS
}) => {

  console.log({INITIAL_STATE_FILTERS})
  const ref = useRef(null);
 

  const makeMinimalGrid = () => {
    if (visibleColumns.some((column) => column.id === 15))
      setVisibleColumns(initialColumns);
    else
      setVisibleColumns([
        {
          header: "Minimized",
          id: 15,
        },
      ]);
  };

  const clearAllFilters = () => {
    setStateFilters(INITIAL_STATE_FILTERS)
  }
  return (
    //product.css //
    <div className="header_container">
      <div className="header_left ">
        <div>
          <Button
            type="button"
            size="small"
            className="mr-2"
            severity="secondary"
            label="Συμπαγής Προβολή"
            onClick={makeMinimalGrid}
          />
        </div>
        <div className="card flex flex-column align-items-center gap-3 ">
          <span className="p-buttonset">
            <Button
              type="button"
              size="small"
              icon="pi pi-filter"
              onClick={(e) => ref.current.toggle(e)}
            />
            <Button
              type="button"
              size="small"
              className="bg-primary-400"
              onClick={clearAllFilters}
              icon="pi pi-filter-slash"
            />
          </span>
          <OverlayPanel ref={ref} className="h-26rem overflow-y-scroll">
            <div className="form">
              <DropdownCustom
                state={stateFilters?.SOFTONESTATUS}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, SOFTONESTATUS: val }))
                }
                optionLabel={"header"}
                label="Kατάσταση SOFTONE"
                placeholder={"Eπιλέξτε Κατάσταση"}
                options={[
                  { header: "Στο SOFTONE", value: true },
                  { header: "Όχι στο SOFTONE", value: false },
                ]}
              />
              <DropdownCustom
                state={stateFilters?.ISACTIVE}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, ISACTIVE: val }))
                }
                optionLabel={"header"}
                label="Κατάσταση Προϊόντος"
                placeholder={"Eπιλέξτε Κατάσταση"}
                options={[
                  { header: "Ενεργό", value: true },
                  { header: "Ανενεργό", value: false },
                ]}
              />
              <DropdownCustom
                state={stateFilters?.isSkroutz}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, isSkroutz: val }))
                }
                optionLabel={"header"}
                label="Κατάσταση Skroutz"
                placeholder={"Eπιλέξτε Κατάσταση"}
                options={[
                  { header: "Είναι στο Skroutz ", value: true },
                  { header: "Δεν είναι στο Skroutz", value: false },
                ]}
              />
              <DropdownCategories
                state={stateFilters?.MTRCATEGORY}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, MTRCATEGORY: val }))
                }
                handleClear={() =>
                  setStateFilters((prev) => ({
                    ...prev,
                    MTRCATEGORY: null,
                    MTRGROUP: null,
                    CCCSUBGROUP2: null,
                  }))
                }
              />
              <DropdownGroups
                state={stateFilters?.MTRGROUP}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, MTRGROUP: val }))
                }
                handleClear={() =>
                  setStateFilters((prev) => ({
                    ...prev,
                    MTRGROUP: null,
                    CCCSUBGROUP2: null,
                  }))
                }
              />
              <DropdownSubroups
                state={stateFilters?.CCCSUBGROUP2}
                handleState={() =>
                  setStateFilters((prev) => ({ ...prev, CCCSUBGROUP2: val }))
                }
                handleClear={() =>
                  setStateFilters((prev) => ({ ...prev, CCCSUBGROUP2: null }))
                }
              />
              <DropdownManufacturers
                state={stateFilters?.MANUFACTURER}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, MANUFACTURER: val }))
                }
              />
              <DropdownBrands
                state={stateFilters?.MTRMARK}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, MTRMARK: val }))
                }
              />
              <DropdownCustom
                state={stateFilters?.images}
                handleState={(val) =>
                  setStateFilters((prev) => ({ ...prev, images: val }))
                }
                optionLabel={"header"}
                label="Φίλτρο Εικόνας"
                placeholder={"Eπιλέξτε Κατάσταση"}
                options={[
                  { header: "Με φωτογραφία ", value: true },
                  { header: "Χωρίς Φωτογραφία", value: false },
                ]}
              />
            </div>
          </OverlayPanel>
        </div>
        
      </div>
      <div>
        <XLSXDownloadButton products={selectedProducts} />
      </div>
    </div>
  );
};

// --------------------------------- TABLE EXPANSION TEMPLATE: ---------------------------------

const rowExpansionTemplate = (data) => {
  return (
    <div className="card p-20" style={{ maxWidth: "1000px" }}>
      <TabView>
        <TabPanel header="Λεπτομέρειες">
          <ExpansionDetails data={data} />
        </TabPanel>
        <TabPanel header="Φωτογραφίες">
          <ProductImagesComp id={data._id} />
        </TabPanel>
      </TabView>
    </div>
  );
};

// --------------------------------- TABLE TEMPLATES: ---------------------------------

const ImagesTemplate = ({ images }) => {
  let image = images[0]?.name;

  return (
    <div className="flex justify-content-center cursor-pointer">
      {image ? (
        <div style={{ height: "40px", width: "50px", overflow: "hidden" }}>
          <PrimeImage
            src={`https://kolleris.b-cdn.net/images/${image}`}
            alt="Image"
            width="100%"
            style={{ objectFit: "contain", height: "100%" }}
            preview
          />
        </div>
      ) : (
        <i className="pi pi-image text-400" style={{ fontSize: "1rem" }}></i>
      )}
    </div>
  );
};

//WHEN THE USER PRESSES MINIMAL GRID: MINIMAL GRID TEMPLATE:
const MinimalTemplate = ({
  NAME,
  CATEGORY_NAME,
  GROUP_NAME,
  SUBGROUP_NAME,
  SOFTONESTATUS,
  availability,
  updatedAt,
  PRICER,
}) => {
  const yourDate = new Date(updatedAt);
  const formattedDate = format(yourDate, "dd-MM-yyyy:HH:mm", { locale: el });
  return (
    <div className="flex flex-column">
      <span className="font-semibold ">{NAME} </span>
      <span className="mb-2 text-xs">
        Ημ. ενημέρωσης:
        <span className="font-semibold text-primary">{` ${formattedDate}`}</span>
      </span>
      <div>
        <div className="flex align-items-center">
          <i
            className="pi pi-tag mr-1 mt-1 text-600"
            style={{ fontSize: "10px" }}
          ></i>
          <span className="text-600" style={{ fontSize: "11px" }}>
            {CATEGORY_NAME}
          </span>
          <i
            className="pi pi-tag mr-1 ml-2 mt-1 text-600"
            style={{ fontSize: "10px" }}
          ></i>
          <span className="text-600" style={{ fontSize: "11px" }}>
            {GROUP_NAME}
          </span>
        </div>
        <div>
          <div className="flex align-items-center"></div>
          <i
            className="pi pi-tag mr-1 mt-1 text-600"
            style={{ fontSize: "10px" }}
          ></i>
          <span className="text-600" style={{ fontSize: "11px" }}>
            {SUBGROUP_NAME ? SUBGROUP_NAME : "-----"}
          </span>
        </div>
        <div className="flex align-items-center">
          <div
            style={{ width: "5px", height: "5px" }}
            className={`${
              SOFTONESTATUS === true ? "bg-green-500" : "bg-red-500"
            } border-circle mr-1 mt-1`}
          ></div>
          <p className="text-500">softone</p>
        </div>
        {availability?.DIATHESIMA === "0" ? (
          <div
            className=" bg-red-500 text-white p-1 flex align-items-center justify-content-center  mt-1"
            style={{
              padding: "2px 4px",
              borderRadius: "3px",
              height: "18px",
              fontSize: "10px",
              maxWidth: "70px",
            }}
          >
            <p style={{ marginBottom: "2px" }}>not available</p>
          </div>
        ) : null}
        <div className="flex mt-2">
          <span>Τιμή Λιανικής:</span>
          <p className="font-bold ml-1">{PRICER}€</p>
        </div>
        <div className="flex ">
          <span className="text-sm">Διαθέσιμα:</span>
          <p className="font-bold ml-1 text-sm">{availability?.DIATHESIMA}</p>
        </div>
      </div>
    </div>
  );
};

//RRICE COLUMN TEMPLATE:
const PriceTemplate = ({ price }) => {
  return (
    <div>
      <p>{price?.toFixed(2)} €</p>
    </div>
  );
};

//COST TEMPLATE:
const Cost = ({ COST }) => {
  return (
    <div>
      <p className="font-bold">{`${COST?.toFixed(2)}€`}</p>
    </div>
  );
};

//UPDATE FROM COLUMN TEMPLATE:
const UpdatedFromTemplate = ({ updatedFrom, updatedAt }) => {
  return (
    <RegisterUserActions
      actionFrom={updatedFrom}
      at={updatedAt}
      icon="pi pi-user"
      color="#fff"
      backgroundColor="var(--yellow-500)"
    />
  );
};
//NAME  COLUMN TEMPLATE:
const NameTemplate = ({
  NAME,
  SOFTONESTATUS,
  isSkroutz,
  ISACTIVE,
  availability,
  impas,
}) => {
  return (
    <div>
      <p className="product_name">{NAME}</p>
      <div className="tags_wrapper">
        <div className="flex align-items-center">
          <div
            style={{ width: "5px", height: "5px" }}
            className={`${
              SOFTONESTATUS === true ? "bg-green-500" : "bg-red-500"
            } border-circle mr-1 mt-1`}
          ></div>
          <p className="product_tags">softone</p>
        </div>
        <div className="flex align-items-center ml-2">
          <div
            style={{ width: "5px", height: "5px" }}
            className={`${
              ISACTIVE ? "bg-green-500" : "bg-red-500"
            } border-circle mr-1 mt-1`}
          ></div>
          <p className=" product_tags">active</p>
        </div>
        {impas?.code ? (
          <div className="flex align-items-center ml-2">
            <div
              style={{ width: "5px", height: "5px" }}
              className={` bg-green-500 border-circle mr-1 `}
            ></div>
            <p className="product_tags">
              IMPA:
              <b className={"black"}>{impas?.code}</b>
            </p>
          </div>
        ) : null}
        {isSkroutz ? (
          <div className="flex align-items-center ml-2">
            <div
              style={{ width: "5px", height: "5px" }}
              className={`bg-orange-500 border-circle mr-1 mt-1`}
            ></div>
            <p className="product_tags">skroutz</p>
          </div>
        ) : null}

        {availability?.DIATHESIMA === "0" ? (
          <div className=" product_availability">
            <p style={{ marginBottom: "2px" }}>not available</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const productAvailabilityTemplate = ({ availability }) => {
  return <ProductAvailability data={availability} />;
};

const productOrderedTemplate = ({ availability }) => {
  return <ProductOrdered data={availability} />;
};
const productReservedTemplate = ({ availability }) => {
  return <ProductReserved data={availability} />;
};

//IMPA COLUMN TEMPLATE
const ImpaCode = ({ impas }) => {
  return (
    <div>
      <p className="font-bold">{impas?.code}</p>
      <p className="impa_text">
        {impas?.englishDescription || impas?.greekDescription}
      </p>
    </div>
  );
};

// --------------------------------- END OF TABLE TEMPLATES: ---------------------------------

const ExpansionDetails = ({ data }) => {
  const [vat, setVat] = useState("");
  const handleVat = async () => {
    try {
      const res = await axios.post("/api/vat", {
        action: "findVatName",
        VAT: data?.VAT,
      });
  
      setVat(res.data.result);
    } catch (e) {
      setVat(null)
    }
  };
  useEffect(() => {
    handleVat();
  }, []);

  return (
    <div className="expansion_form">
      <div className="expansion_row">
        <div className="disabled-card">
          <label>Κωδικός ERP</label>
          <InputText disabled value={data?.CODE} />
        </div>
        <div className="disabled-card">
          <label>Κωδικός ΕΑΝ</label>
          <InputText disabled value={data?.CODE1} />
        </div>
        <div className="disabled-card">
          <label>Κωδικός Εργοστασίου</label>
          <InputText disabled value={data?.CODE2} />
        </div>
      </div>
      <div className="expansion_row">
        <div className="disabled-card">
          <label>Κόστος</label>
          <InputText disabled value={data?.COST?.toFixed(2)} />
        </div>
        <div className="disabled-card">
          <label>Τιμή Λιανικής</label>
          <InputText disabled value={data?.PRICER?.toFixed(2)} />
        </div>
        <div className="disabled-card">
          <label>Τιμή Χονδρικής</label>
          <InputText disabled value={data?.PRICEW?.toFixed(2)} />
        </div>
      </div>
      <div className="expansion_row">
        <div className="disabled-card">
          <label>Κατασκευαστής</label>
          <InputText disabled value={data?.MMTRMANFCTR_NAME} />
        </div>
        <div className="disabled-card">
          <label>Μάρκα</label>
          <InputText disabled value={data?.MTRMARK_NAME} />
        </div>
      </div>
      <div className="expansion_row">
        <div className="disabled-card">
          <label>Ημερομηνία Τελευταίας Τροποποίησης</label>
          <InputText disabled value={data?.UPDDATE} />
        </div>
        <div className="disabled-card">
          <label>ΦΠΑ</label>
          <InputText onChange={handleVat} disabled value={vat} />
        </div>
      </div>
      <div className="disabled-card">
        <label>Περιγραφή</label>
        <InputTextarea autoResize disabled value={data?.description} />
      </div>

      <div className="disabled-card">
        <label>Αγγλική Περιγραφή</label>
        <InputTextarea autoResize disabled value={data?.descriptions?.en} />
      </div>
    </div>
  );
};






