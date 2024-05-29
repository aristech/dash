"use client";
import React, {useState, useEffect, useRef} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import axios from "axios";
import {InputText} from "primereact/inputtext";
import {useDispatch} from "react-redux";
import {setGridRowData} from "@/features/grid/gridSlice";
import RegisterUserActions from "@/components/grid/GridRegisterUserActions";
import {MultiSelect} from "primereact/multiselect";
import {TabView, TabPanel} from "primereact/tabview";
import {InputTextarea} from "primereact/inputtextarea";
import ProductActions from "@/components/grid/Product/ProductActions";
import {ProductDialog} from "@/GridDialogs/ProductDialog";
import ClassificationDialog from "@/GridDialogs/product/ClassificationDialog";
import ProductToolbar from "@/components/grid/Product/ProductToolbar";
import {
    ProductAvailability,
    ProductOrdered,
    ProductReserved,
} from "@/components/grid/Product/ProductAvailability";
import {Toast} from "primereact/toast";
import {Dropdown} from "primereact/dropdown";
import {ProductQuantityProvider} from "@/_context/ProductGridContext";
import {useSession} from "next-auth/react";
import {Button} from "primereact/button";
import {useRouter} from "next/router";
import StepHeader from "@/components/StepHeader";
import {OverlayPanel} from "primereact/overlaypanel";
import XLSXDownloadButton from "@/components/exportCSV/Product";
import MassiveImageUpload from "@/components/MassiveImageUpload";
import format from "date-fns/format";
import {el} from "date-fns/locale";
import {useSelector} from "react-redux";
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
import {Image as PrimeImage} from "primereact/image";
import Link from "next/link";
import {Message} from "primereact/message";
import FilterManufacturer from "@/components/grid/Product/FilterManufacturer";



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
    }, {
        header: "Τιμή Χονδρικής",
        id: 18,
    },
];

export default function ProductLayout() {
    return (
        <ProductQuantityProvider>
            <Product/>
        </ProductQuantityProvider>
    );
}

function Product() {
    const op = useRef(null);
    const toast = useRef(null);
    const router = useRouter();
    const {data: session} = useSession();
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
        loading,
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
    const [totalRecords, setTotalRecords] = useState(0);
    const [rowData, setRowData] = useState([])
    const [classDialog, setClassDialog] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(initialColumns);
    const [expandedRows, setExpandedRows] = useState(null);
    //DIALOG:
    const [dialog, setDialog] = useState({
        state: false,
        isEdit: false
    })
   
    
    const [stateFilters, setStateFilters] = useState({
        impaSearch: "",
        erpCode: "",
        images: null,
        codeSearch: "",
        skroutz: null,
        active: true,
        manufacturer: null,
    });

    const fetchProducts = async () => {
        if (!searchTerm && !stateFilters.codeSearch) {
            dispatch(setLoading(true));
        }
        try {
            let {data} = await axios.post("/api/product/apiProductFilters", {
                action: "productSearchGrid",
                searchTerm: searchTerm,
                skip: lazyState2.first,
                limit: lazyState2.rows,
                categoryID: category?.softOne.MTRCATEGORY,
                groupID: group?.softOne.MTRGROUP,
                subgroupID: subgroup?.softOne.cccSubgroup2,
                sort: sort,
                sortEan: sortEan,
                sortImpa: sortImpa,
                softoneFilter: softoneFilter,
                marka: marka,
                sortPrice: sortPrice,
                stateFilters: stateFilters,
            });
          
            return data;
        } catch (e) {
            console.log(e);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        dispatch(setSearchTerm(""));
    }, []);

    useEffect(() => {
        (async () => {
            let data = await fetchProducts();
           
            setData(data?.result);
            setTotalRecords(data?.totalRecords);
        })();


    }, [submitted]);


    useEffect(() => {
        (async () => {
            let data = await fetchProducts();
            setData(data?.result);
            setTotalRecords(data?.totalRecords);
        })()

    }, [
        lazyState2.rows,
        lazyState2.first,
        searchTerm,
        category,
        group,
        subgroup,
        sort,
        marka,
        softoneFilter,
        sortAvailability,
        submitted,
        stateFilters,
        sortPrice,
        sortEan,
        sortImpa,
    ]);


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

    // -------------------- REDNER THE TABLE HEADER --------------------------------
    const clearAllFilters = () => {
        dispatch(resetSelectedFilters());
        setStateFilters((prev) => ({
            ...prev,
            impa: 0,
            images: null,
            codeSearch: "",
            active: true,
        }));
    };

    const handleSoftoneStatusFilter = () => {
        dispatch(setSoftoneFilter({name: "Χωρίς Φίλτρο", value: null}));
    };
    const onSoftoneFilterChange = (e) => {
        dispatch(setSoftoneFilter(e.value));
    };

    // -------------------------- FILTERS CHANGES --------------------------------

    const onFilterCategoryChange = (e) => {
        dispatch(setCategory(e.value));
    };

    const onFilterGroupChange = (e) => {
        dispatch(setGroup(e.value));
    };
    const onFilterSubGroupChange = (e) => {
        dispatch(setSubgroup(e.value));
    };

    const onFilterMarkChange = (e) => {
        dispatch(setMarka(e.value));
    };

    let onSortImpa = () => {
        dispatch(setSortImpa());
    };

    const onImpaChange = (e) => {
        setStateFilters((prev) => ({...prev, impaSearch: e.target.value}));
    };

    const onManufacturerChange = (value) => {
        setStateFilters(prev => ({...prev, manufacturer: value}))
    }

    // -------------------- ADD / EDIT DIALOG ACTIONS --------------------------------
    const onAdd = async () => {
        dispatch(setSubmitted());
        setDialog(prev => ({...prev, state: true, isEdit: false}))
    };
   
    const onEdit = async (product) => {
        dispatch(setSubmitted());
        setDialog(prev => ({...prev, state: true, isEdit: true}))
        // dispatch(setGridRowData(product));
        setRowData(product)
    };



    const editClass = async (product) => {
        setClassDialog(true);
        dispatch(setGridRowData(product));
    };

    const hideDialog = () => {
      
        setDialog({
            state: false,
            isEdit: false,
        })
        setClassDialog(false);
    };

    // -------------------- DISPATCH SELECTED PRODUCTS --------------------------------
    const onSelection = (e) => {
        dispatch(setSelectedProducts(e.value));
    };

    // Pagination state changes:
    const onPage = (event) => {
        dispatch(
            setLazyState2({...lazyState2, first: event.first, rows: event.rows})
        );
    };

    // ----------  SORT IMPA: ---------

    const onSearchName = () => {
        const onSort = () => {
            dispatch(setSort());
        };
        return (
            <div>
                <div className="flex align-items-center justify-content-start w-20rem ">
                    <div className="p-input-icon-left w-full">
                        <i className="pi pi-search"/>
                        <InputText
                            value={searchTerm}
                            placeholder="Αναζήτηση Προϊόντος"
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                        />
                    </div>
                    <div className="ml-3">
                        {sort === 0 ? (
                            <i className="pi pi-sort-alt" onClick={onSort}></i>
                        ) : null}
                        {sort === 1 ? (
                            <i className="pi pi-sort-amount-up" onClick={onSort}></i>
                        ) : null}
                        {sort === -1 ? (
                            <i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    const SearchEAN = () => {
        const onSort = () => {
            dispatch(setSortEan());
        };
        return (
            <div className="flex align-items-center justify-content-start">
                <div className="p-input-icon-left w-full">
                    <i className="pi pi-search"/>
                    <InputText
                        value={stateFilters.codeSearch}
                        placeholder="Αναζήτηση"
                        //product.css
                        className="column_input_med"
                        onChange={(e) =>
                            setStateFilters((prev) => ({
                                ...prev,
                                codeSearch: e.target.value,
                            }))
                        }
                    />
                </div>
                <div className="ml-3">
                    {sortEan === 0 ? (
                        <i className="pi pi-sort-alt" onClick={onSort}></i>
                    ) : null}
                    {sortEan === 1 ? (
                        <i className="pi pi-sort-amount-up" onClick={onSort}></i>
                    ) : null}
                    {sortEan === -1 ? (
                        <i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>
                    ) : null}
                </div>
            </div>
        );
    };

    const SortPrice = () => {
        const onSort = () => {
            dispatch(setSortPrice());
        };
        return (
            <div className="ml-3">
                {sortPrice === 0 ? (
                    <i className="pi pi-sort-alt" onClick={onSort}></i>
                ) : null}
                {sortPrice === 1 ? (
                    <i className="pi pi-sort-amount-up" onClick={onSort}></i>
                ) : null}
                {sortPrice === -1 ? (
                    <i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>
                ) : null}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Toast ref={toast}/>
            <div>
                <StepHeader text="Προϊόντα"/>
            </div>
            <Button
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
                    <MassiveImageUpload/>
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
                            selectedProducts={selectedProducts}
                            clearAllFilters={clearAllFilters}
                            filters={filters}
                            category={category}
                            group={group}
                            subgroup={subgroup}
                            marka={marka}
                            softoneFilter={softoneFilter}
                            onFilterCategoryChange={onFilterCategoryChange}
                            onFilterGroupChange={onFilterGroupChange}
                            onFilterSubGroupChange={onFilterSubGroupChange}
                            onFilterMarkChange={onFilterMarkChange}
                            onManufacturerChange={onManufacturerChange}
                            setVisibleColumns={setVisibleColumns}
                            onSoftoneFilterChange={onSoftoneFilterChange}
                            setStateFilters={setStateFilters}
                            stateFilters={stateFilters}
                            visibleColumns={visibleColumns}
                            onColumnToggle={onColumnToggle}
                            columns={columns}
                            handleSoftoneStatusFilter={handleSoftoneStatusFilter}
                        />
                    )}
                    first={lazyState2.first}
                    lazy
                    totalRecords={totalRecords}
                    onPage={onPage}
                    className="product-datatable"
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
                    onRowExpand={(e) => setExpandedRows({[e.data._id]: true})}
                    onRowCollapse={(e) => setExpandedRows(null)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    expandedRows={expandedRows}

                >
                    <Column
                        bodyStyle={{textAlign: "center"}}
                        expander={allowExpansion}
                        style={{width: "30px"}}
                    />
                    <Column
                        selectionMode="multiple"
                        style={{width: "30px"}}
                    ></Column>
                    {user?.role === "admin" ? (
                        <Column
                            style={{width: "30px"}}
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
                    <Column body={ImagesTemplate} style={{width: "30px"}}></Column>
                    {visibleColumns.some((column) => column.id === 14) && (
                        <Column
                            field="NAME"
                            style={{minWidth: "400px"}}
                            header="Όνομα"
                            filter
                            showFilterMenu={false}
                            filterElement={onSearchName}
                            body={NameTemplate}
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 15) && (
                        <Column
                            field="NAME"
                            style={{minWidth: "400px"}}
                            header="Όνομα"
                            filter
                            showFilterMenu={false}
                            filterElement={onSearchName}
                            body={MinimalTemplate}
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 6) && (
                        <Column
                            field="impas.code"
                            // style={{ minWidth: "250px" }}
                            className="column_med"
                            header="Κωδικός Impa"
                            body={ImpaCode}
                            filter
                            filterElement={() => (
                                <HasImpa
                                    sortImpa={sortImpa}
                                    stateFilters={stateFilters}
                                    onChange={(e) => onImpaChange(e)}
                                    onSortImpa={onSortImpa}
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
                                <CategoriesRowFilterTemplate
                                    value={category}
                                    options={filters.category}
                                    onChange={onFilterCategoryChange}
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
                                <GroupRowFilterTemplate
                                    value={group}
                                    options={filters.group}
                                    onChange={onFilterGroupChange}
                                    category={category}
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
                                <SubGroupsRowFilterTemplate
                                    value={subgroup}
                                    options={filters.subgroup}
                                    onChange={onFilterSubGroupChange}
                                    group={group}
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
                                <FilterManufacturer
                                    value={stateFilters.manufacturer}
                                    onChange={onManufacturerChange}
                                />
                            )}
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 12) && (
                        <Column
                            field="availability.DIATHESIMA"
                            bodyStyle={{textAlign: "center"}}
                            body={productAvailabilityTemplate}
                            style={{width: "110px"}}
                            header="Διαθέσιμα"
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 1) && (
                        <Column
                            field="availability.SEPARAGELIA"
                            body={productOrderedTemplate}
                            style={{width: "90px"}}
                            header="Παραγγελία"
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 2) && (
                        <Column
                            field="availability.DESVMEVMENA"
                            body={productReservedTemplate}
                            style={{width: "90px"}}
                            header="Δεσμευμένα"
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 3) && (
                        <Column
                            field="updatedFrom"
                            header="Ανανέωση Από"
                            style={{width: "80px"}}
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
                            showFilterMenu={false}
                            filterElement={() => (
                                <MarkesFilter
                                    value={marka}
                                    options={filters.marka}
                                    onChange={onFilterMarkChange}
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
                            filterElement={SearchEAN}
                        ></Column>
                    )}
                    {visibleColumns.some((column) => column.id === 13) && (
                        <Column
                            field="COST"
                            style={{width: "40px",}}
                            header="Τιμή Κόστους"
                            body={Cost}>
                        </Column>
                    )}
                    {visibleColumns.some((column) => column.id === 18) && (
                        <Column
                            field="PRICEW"
                            style={{width: "40px",}}
                            header="Τιμή Xονδρικής"
                            body={(data) => <PriceTemplate price={data.PRICEW}/>}

                        >
                        </Column>
                    )}
                    <Column
                        style={{width: "40px",}}
                        field="PRICER"
                        header="Τιμή Λιανικής"
                        body={(data) => <PriceTemplate price={data.PRICER}/>}
                        filter
                        showFilterMenu={false}
                        filterElement={SortPrice}
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
                          clearAllFilters,
                          filters,
                          category,
                          group,
                          subgroup,
                          marka,
                          softoneFilter,
                          onFilterCategoryChange,
                          onFilterGroupChange,
                          onFilterSubGroupChange,
                          onFilterMarkChange,
                          setStateFilters,
                          stateFilters,
                          visibleColumns,
                          onColumnToggle,
                          columns,
                          selectedProducts,
                          setVisibleColumns,
                          onSoftoneFilterChange,
                          handleSoftoneStatusFilter,
                          onManufacturerChange,
                      }) => {
    const ref = useRef(null);
    const optionsSoft = [
        {name: "IN softone", value: true},
        {name: "NOT IN softone", value: false},
        {name: "Χωρίς Φίλτρο", value: null},
    ];

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
                        <div className="mb-2  ">
                            <span className="font-bold block mb-1">Κατηγορία:</span>
                            <CategoriesRowFilterTemplate
                                value={category}
                                options={filters.category}
                                onChange={onFilterCategoryChange}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-1">Oμάδα:</span>
                            <GroupRowFilterTemplate
                                value={group}
                                options={filters.group}
                                onChange={onFilterGroupChange}
                                category={category}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-1">Yποομάδα:</span>
                            <SubGroupsRowFilterTemplate
                                value={subgroup}
                                options={filters.subgroup}
                                onChange={onFilterSubGroupChange}
                                group={group}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-1">Κατασκευαστής:</span>
                            <FilterManufacturer
                                value={stateFilters.manufacturer}
                                onChange={onManufacturerChange}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-1">Mάρκα:</span>
                            <MarkesFilter
                                value={marka}
                                options={filters.marka}
                                onChange={onFilterMarkChange}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-2">SoftOne status:</span>
                            <div className="mr-2">
                                <Dropdown
                                    size="small"
                                    value={softoneFilter}
                                    options={optionsSoft}
                                    onChange={onSoftoneFilterChange}
                                    optionLabel="name"
                                    placeholder="Φίλτρο Softone"
                                    className="p-column-filter grid-filter"
                                    style={{minWidth: "14rem", fontSize: "12px"}}
                                />
                                <i
                                    className="pi pi-times ml-2 cursor-pointer"
                                    onClick={handleSoftoneStatusFilter}
                                ></i>
                            </div>
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-2">Φίλτρο Εικόνας:</span>
                            <WithImages
                                value={stateFilters.images}
                                setState={setStateFilters}
                            />
                        </div>
                        <div className="mb-2 ">
                            <span className="font-bold block mb-2">Φίλτρο Skroutz:</span>
                            <IsSkroutz
                                value={stateFilters.skroutz}
                                setState={setStateFilters}
                            />
                        </div>
                        <div className="mb-2 ">
              <span className="font-bold block mb-2">
                Φίλτρο Ενεργού Προϊόντος:
              </span>
                            <IsActive
                                value={stateFilters.active}
                                setState={setStateFilters}
                            />
                        </div>
                    </OverlayPanel>
                </div>
                <div className="ml-2">
                    <MultiSelect
                        className="w-15rem"
                        value={visibleColumns}
                        options={columns}
                        onChange={onColumnToggle}
                        optionLabel="header"
                        display="chip"
                    />
                </div>
            </div>
            <div>
                <XLSXDownloadButton products={selectedProducts}/>
            </div>
        </div>
    );
};

// --------------------------------- TABLE EXPANSION TEMPLATE: ---------------------------------

const rowExpansionTemplate = (data) => {
    return (
        <div className="card p-20" style={{maxWidth: "1000px"}}>
            <TabView>
                <TabPanel header="Λεπτομέρειες">
                    <ExpansionDetails data={data}/>
                </TabPanel>
                <TabPanel header="Φωτογραφίες">
                    <ProductImagesComp id={data._id}/>
                </TabPanel>
            </TabView>
        </div>
    );
};

// --------------------------------- TABLE FILTERS: ---------------------------------

const HasImpa = ({sortImpa, stateFilters, onChange, onSortImpa}) => {
    return (
        <div className="flex align-items-center">
            <div className="p-input-icon-left w-full">
                <i className="pi pi-search"/>
                <InputText
                    value={stateFilters.impaSearch}
                    placeholder="Αναζήτηση Impa"
                    //product.css
                    className="column_input_med"
                    onChange={onChange}
                />
            </div>
            <div className="ml-3">
                {sortImpa === 0 ? (
                    <i className="pi pi-sort-alt" onClick={onSortImpa}></i>
                ) : null}
                {sortImpa === 1 ? (
                    <i className="pi pi-sort-amount-up" onClick={onSortImpa}></i>
                ) : null}
                {sortImpa === -1 ? (
                    <i className="pi pi-sort-amount-down-alt" onClick={onSortImpa}></i>
                ) : null}
            </div>
        </div>
    );
};

// --------------------------------- TABLE TEMPLATES: ---------------------------------

const ImagesTemplate = ({images}) => {
    let image = images[0]?.name;

    return (
        <div className="flex justify-content-center cursor-pointer">
            {image ? (
                <div style={{height: "40px", width: "50px", overflow: "hidden"}}>
                    <PrimeImage
                        src={`https://kolleris.b-cdn.net/images/${image}`}
                        alt="Image"
                        width="100%"
                        style={{objectFit: "contain", height: "100%"}}
                        preview
                    />
                </div>
            ) : (
                <i className="pi pi-image text-400" style={{fontSize: "1rem"}}></i>
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
    const formattedDate = format(yourDate, "dd-MM-yyyy:HH:mm", {locale: el});
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
                        style={{fontSize: "10px"}}
                    ></i>
                    <span className="text-600" style={{fontSize: "11px"}}>
            {CATEGORY_NAME}
          </span>
                    <i
                        className="pi pi-tag mr-1 ml-2 mt-1 text-600"
                        style={{fontSize: "10px"}}
                    ></i>
                    <span className="text-600" style={{fontSize: "11px"}}>
            {GROUP_NAME}
          </span>
                </div>
                <div>
                    <div className="flex align-items-center"></div>
                    <i
                        className="pi pi-tag mr-1 mt-1 text-600"
                        style={{fontSize: "10px"}}
                    ></i>
                    <span className="text-600" style={{fontSize: "11px"}}>
            {SUBGROUP_NAME ? SUBGROUP_NAME : "-----"}
          </span>
                </div>
                <div className="flex align-items-center">
                    <div
                        style={{width: "5px", height: "5px"}}
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
                        <p style={{marginBottom: "2px"}}>not available</p>
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
const PriceTemplate = ({price}) => {
    return (
        <div>
            <p>{price?.toFixed(2)} €</p>
        </div>
    );
};

//COST TEMPLATE:
const Cost = ({COST}) => {

    return (
        <div>
            <p className="font-bold">{`${COST?.toFixed(2)}€`}</p>
        </div>
    );
};


//UPDATE FROM COLUMN TEMPLATE:
const UpdatedFromTemplate = ({updatedFrom, updatedAt}) => {
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
                          impas
                      }) => {

    return (
        <div>
            <p className="font-medium">{NAME}</p>
            <div className="flex border-round mt-1">
                <div className="flex align-items-center">
                    <div
                        style={{width: "5px", height: "5px"}}
                        className={`${
                            SOFTONESTATUS === true ? "bg-green-500" : "bg-red-500"
                        } border-circle mr-1 mt-1`}
                    ></div>
                    <p className="text-500">softone</p>
                </div>
                <div className="flex align-items-center ml-2">
                    <div
                        style={{width: "5px", height: "5px"}}
                        className={`${
                            ISACTIVE ? "bg-green-500" : "bg-red-500"
                        } border-circle mr-1 mt-1`}
                    ></div>
                    <p className="text-500">active</p>
                </div>
                {impas?.code ? (
                    <div className="flex align-items-center ml-2">
                        <div
                            style={{width: "5px", height: "5px"}}
                            className={` bg-green-500 border-circle mr-1 mt-1`}
                        ></div>
                        <p className="text-500 text-xs">IMPA:
                            <b className={"black"}>{impas?.code}</b>
                        </p>
                    </div>
                ) : null}
                {isSkroutz ? (
                    <div className="flex align-items-center ml-2">
                        <div
                            style={{width: "5px", height: "5px"}}
                            className={`bg-orange-500 border-circle mr-1 mt-1`}
                        ></div>
                        <p className="text-500">skroutz</p>
                    </div>
                ) : null}

                {availability?.DIATHESIMA === "0" ? (
                    <div
                        className=" bg-red-500 text-white p-1 flex align-items-center justify-content-center ml-2 mt-1"
                        style={{
                            padding: "2px 4px",
                            borderRadius: "3px",
                            height: "18px",
                            fontSize: "10px",
                            maxWidth: "70px",
                        }}
                    >
                        <p style={{marginBottom: "2px"}}>not available</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const productAvailabilityTemplate = ({availability}) => {
    return <ProductAvailability data={availability}/>;
};

const productOrderedTemplate = ({availability}) => {
    return <ProductOrdered data={availability}/>;
};
const productReservedTemplate = ({availability}) => {
    return <ProductReserved data={availability}/>;
};

//IMPA COLUMN TEMPLATE
const ImpaCode = ({impas}) => {
    return (
        <div>
            <p className="font-bold">{impas?.code}</p>
            <p>{impas?.englishDescription || impas?.greekDescription}</p>
        </div>
    );
};

// --------------------------------- END OF TABLE TEMPLATES: ---------------------------------

const ExpansionDetails = ({data}) => {
    const [vat, setVat] = useState("");
    const handleVat = async () => {
        const res = await axios.post("/api/vat", {
            action: "findVatName",
            VAT: data?.VAT,
        });

        setVat(res.data.result);
    };
    useEffect(() => {
        handleVat();
    }, []);

    return (
        <div className="expansion_form">


            <div className="expansion_row">
                <div className="disabled-card">
                    <label>Κωδικός ERP</label>
                    <InputText disabled value={data?.CODE}/>
                </div>
                <div className="disabled-card">
                    <label>Κωδικός ΕΑΝ</label>
                    <InputText disabled value={data?.CODE1}/>
                </div>
                <div className="disabled-card">
                    <label>Κωδικός Εργοστασίου</label>
                    <InputText disabled value={data?.CODE2}/>
                </div>
            </div>
            <div className="expansion_row">
                <div className="disabled-card">
                    <label>Κόστος</label>
                    <InputText disabled value={data?.COST.toFixed(2)}/>
                </div>
                <div className="disabled-card">
                    <label>Τιμή Λιανικής</label>
                    <InputText disabled value={data?.PRICER.toFixed(2)}/>
                </div>
                <div className="disabled-card">
                    <label>Τιμή Χονδρικής</label>
                    <InputText disabled value={data?.PRICEW.toFixed(2)}/>
                </div>
            </div>
            <div className="expansion_row">
                <div className="disabled-card">
                    <label>Κατασκευαστής</label>
                    <InputText

                        disabled
                        value={data?.MMTRMANFCTR_NAME}
                    />
                </div>
                <div className="disabled-card">
                    <label>Μάρκα</label>
                    <InputText disabled value={data?.MTRMARK_NAME}/>
                </div>
            </div>
            <div className="expansion_row">
                <div className="disabled-card">
                    <label>Ημερομηνία Τελευταίας Τροποποίησης</label>
                    <InputText disabled value={data?.UPDDATE}/>
                </div>
                <div className="disabled-card">
                    <label>ΦΠΑ</label>
                    <InputText onChange={handleVat} disabled value={vat}/>
                </div>

            </div>
            <div className="disabled-card">
                <label>Περιγραφή</label>
                <InputTextarea autoResize disabled value={data.description}/>
            </div>

            <div className="disabled-card">
                <label>Αγγλική Περιγραφή</label>
                <InputTextarea autoResize disabled value={data.descriptions?.en}/>
            </div>


        </div>
    );
};

// --------------------------------- FILTERING TEMPLATES: ---------------------------------

const CategoriesRowFilterTemplate = ({value, options, onChange}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const handleCategories = async () => {
            let {data} = await axios.post("/api/product/apiProductFilters", {
                action: "findCategories",
            });
            dispatch(setFilters({action: "category", value: data.result}));
        };
        handleCategories();
    }, []);

    const onDelete = () => {
        dispatch(resetSelectedFilters());
    };
    return (
        <div className="flex align-items-center">
            <Dropdown
                emptyMessage="Δεν υπάρχουν κατηγορίες"
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="categoryName"
                placeholder="Φίλτρο Κατηγορίας"
                //product.css
                className="column_dropdown_med"
            />
            <i className="pi pi-times ml-2 cursor-pointer" onClick={onDelete}></i>
        </div>
    );
};

const GroupRowFilterTemplate = ({category, options, onChange, value}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const handleCategories = async () => {
            let {data} = await axios.post("/api/product/apiProductFilters", {
                action: "findGroups",
                categoryID: category?.softOne.MTRCATEGORY,
            });
            dispatch(setFilters({action: "group", value: data.result}));
        };
        handleCategories();
    }, [category]);

    return (
        <div className="flex align-items-center">
            <Dropdown
                disabled={!category}
                emptyMessage="Δεν υπάρχουν ομάδες"
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="groupName"
                placeholder="Φίλτρο Ομάδας"
                //product.css
                className="column_dropdown_med"
            />
            <i
                className="pi pi-times ml-2 cursor-pointer"
                onClick={() => dispatch(setGroup(null))}
            ></i>
        </div>
    );
};

const SubGroupsRowFilterTemplate = ({value, options, group, onChange}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const handleCategories = async () => {
            let {data} = await axios.post("/api/product/apiProductFilters", {
                action: "findSubGroups",
                groupID: group?.softOne.MTRGROUP,
            });
            dispatch(setFilters({action: "subgroup", value: data.result}));
        };
        handleCategories();
    }, [group]);

    return (
        <div className="flex align-items-center">
            <Dropdown
                emptyMessage="Δεν υπάρχουν υποομάδες"
                size="small"
                disabled={!group}
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="subGroupName"
                placeholder="Φίλτρο Υποομάδας"
                // style={{ minWidth: '14rem', fontSize: '12px' }}
                //product.css
                className="column_dropdown_med"
            />
            <i
                className="pi pi-times ml-2 cursor-pointer"
                onClick={() => dispatch(setSubgroup(null))}
            ></i>
        </div>
    );
};

const WithImages = ({value, setState}) => {
    const options = [
        {name: "Με φωτογραφία", value: true},
        {name: "Χωρίς φωτογραφία", value: false},
        {name: "Χωρίς φίλτρο", value: null},
    ];

    const onChange = (e) => {
        setState((prev) => ({...prev, images: e.value}));
    };

    const onClear = () => {
        setState((prev) => ({...prev, images: null}));
    };
    return (
        <div className="flex align-items-center">
            <Dropdown
                size="small"
                filter
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="name"
                placeholder="Φίλτρο Φωτογραφίας"
                className="p-column-filter grid-filter"
                style={{minWidth: "14rem", fontSize: "12px"}}
            />
            <i className="pi pi-times ml-2 cursor-pointer" onClick={onClear}></i>
        </div>
    );
};

const IsActive = ({setState, value}) => {
    const options = [
        {name: "Ενεργό", value: true},
        {name: "Ανενεργό", value: false},
        {name: "Όλα", value: null},
    ];

    const onChange = (e) => {
        setState((prev) => ({...prev, active: e.value}));
    };

    const onClear = () => {
        setState((prev) => ({...prev, active: null}));
    };
    return (
        <div className="flex align-items-center">
            <Dropdown
                size="small"
                filter
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="name"
                placeholder="Φίλτρο ενεργού προϊόντος"
                className="p-column-filter grid-filter"
                style={{minWidth: "14rem", fontSize: "12px"}}
            />
            <i className="pi pi-times ml-2 cursor-pointer" onClick={onClear}></i>
        </div>
    );
};

const IsSkroutz = ({setState, value}) => {
    const options = [
        {name: "Είναι στο Skroutz", value: true},
        {name: "Δεν είναι στο Skroutz", value: false},
        {name: "Όλα", value: null},
    ];

    const onChange = (e) => {
        setState((prev) => ({...prev, skroutz: e.value}));
    };

    const onClear = () => {
        setState((prev) => ({...prev, skroutz: null}));
    };
    return (
        <div className="flex align-items-center">
            <Dropdown
                size="small"
                filter
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="name"
                placeholder="Φίλτρο Skroutz"
                className="p-column-filter grid-filter"
                style={{minWidth: "14rem", fontSize: "12px"}}
            />
            <i className="pi pi-times ml-2 cursor-pointer" onClick={onClear}></i>
        </div>
    );
};
const MarkesFilter = ({value, options, onChange}) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const handleCategories = async () => {
            let {data} = await axios.post("/api/product/apiProductFilters", {
                action: "findBrands",
            });
            dispatch(setFilters({action: "marka", value: data.result}));
        };
        handleCategories();
    }, []);
    return (
        <div className="flex align-items-center">
            <Dropdown
                emptyMessage="Δεν υπάρχουν Μάρκες"
                size="small"
                filter
                value={value}
                options={options}
                onChange={onChange}
                optionLabel="softOne.NAME"
                placeholder="Φίλτρο Mάρκας"
                //product.css
                className="column_dropdown_med"
            />
            <i
                className="pi pi-times ml-2 cursor-pointer"
                onClick={() => dispatch(setMarka(null))}
            ></i>
        </div>
    );
};
