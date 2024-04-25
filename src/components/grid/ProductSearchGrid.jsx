'use client'
import React, { useState, useEffect, useRef, use } from 'react'
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector, useDispatch } from 'react-redux';
import { InputText } from 'primereact/inputtext';
import { useRouter } from 'next/router';
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
    setMarka
} from "@/features/productsSlice";


const ProductSearchGrid = () => {
    const dispatch = useDispatch()
    const { filters, category, group, marka, subgroup, lazyState, loading, searchTerm, sort, selectedProducts } = useSelector(store => store.products)
    const { selectedMarkes } = useSelector(state => state.supplierOrder)
    const [totalRecords, setTotalRecords] = useState(0);
    const [data, setData] = useState([])
    const [codeSearch, setCodeSearch] = useState('');
    const [stateFilters, setStateFilters] = useState({
        impaSearch: '',
        codeSearch: '',
        skroutz: null,
        active: true,
    })



    useEffect(() => {
        dispatch(setSearchTerm(''))
        dispatch(setSelectedProducts([]))
      
        if(selectedMarkes?.NAME) {
            dispatch(setMarka({softOne: {NAME: selectedMarkes.NAME, MTRMARK: selectedMarkes.mtrmark}}))
        } else {
            dispatch(setMarka(null))
        }
    }, [])

    const fetch = async () => {
        if (!searchTerm  && !codeSearch) {
            dispatch(setLoading(true))
        }
        try {
            let { data } = await axios.post('/api/product/apiProductFilters', {
                action: 'productSearchGrid',
                searchTerm: searchTerm,
                skip: lazyState.first,
                limit: lazyState.rows,
                categoryID: category?.softOne.MTRCATEGORY,
                groupID: group?.softOne.MTRGROUP,
                subgroupID: subgroup?.softOne.cccSubgroup2,
                mtrmark: selectedMarkes?.mtrmark,
                sort: sort,
                marka: marka,
                softoneFilter: null,
                codeSearch: codeSearch,
                stateFilters: stateFilters,
                
            })
            console.log(data.result)
            setData(data.result);
            setTotalRecords(data.totalRecords)
            dispatch(setLoading(false))

        } catch (e) {
            console.log(e)
        }

    }
    useEffect(() => {
        fetch();
    }, [selectedMarkes, lazyState.rows,
        lazyState.first, searchTerm,
        category,
        group,
        subgroup,
        marka,
        sort,
        codeSearch,
        stateFilters
    ])

    useEffect(() => {
        dispatch(setLazyState({ ...lazyState, first: 0 }))
    }, [selectedMarkes])

    const onSelectionChange = (e) => {
        dispatch(setSelectedProducts(e.value))
    }

    const onPage = (event) => {
        dispatch(setLazyState({ ...lazyState, first: event.first, rows: event.rows }))
    };



    const onFilterCategoryChange = (e) => {
        dispatch(setCategory(e.value))

    }
    const onFilterGroupChange = (e) => {
        dispatch(setGroup(e.value))
    }
    const onFilterSubGroupChange = (e) => {
        dispatch(setSubgroup(e.value))
    }
    const onFilterMarkChange = (e) => {
        dispatch(setMarka(e.value))
    }


    const Search = () => {
        const onSort = () => {

            dispatch(setSort())

        }
        return (
            <div className="flex align-items-center justify-content-start w-20rem ">
                <div className="p-input-icon-left w-full">
                    <i className="pi pi-search" />
                    <InputText value={searchTerm} placeholder='Αναζήτηση Προϊόντος' onChange={(e) => dispatch(setSearchTerm(e.target.value))} />
                </div>
                <div className='ml-3'>
                    {sort === 0 ? (<i className="pi pi-sort-alt" onClick={onSort}></i>) : null}
                    {sort === 1 ? (<i className="pi pi-sort-amount-up" onClick={onSort}></i>) : null}
                    {sort === -1 ? (<i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>) : null}
                </div>
            </div>
        )
    }


    const CategoriesRowFilterTemplate = (options) => {
        useEffect(() => {
            const handleCategories = async () => {
                let { data } = await axios.post('/api/product/apiProductFilters', {
                    action: 'findCategories',
                })
                dispatch(setFilters({ action: 'category', value: data.result }))
            }
            handleCategories()

        }, [])

        const onDelete = () => {
            dispatch(resetSelectedFilters())

        }
        return (
            <div className="flex align-items-center">
                <div className='flex align-items-center'>
                    <Dropdown
                        emptyMessage="Δεν υπάρχουν κατηγορίες"
                        value={category}
                        options={filters.category}
                        onChange={onFilterCategoryChange}
                        optionLabel="categoryName"
                        placeholder="Φίλτρο Κατηγορίας"
                        className="p-column-filter  grid-filter w-14rem"

                    />
                    <i className="pi pi-times ml-2 cursor-pointer" onClick={onDelete} ></i>
                </div>

            </div>

        )
    };


    const GroupRowFilterTemplate = (options) => {
        useEffect(() => {
            const handleCategories = async () => {

                let { data } = await axios.post('/api/product/apiProductFilters', {
                    action: 'findGroups',
                    categoryID: category?.softOne.MTRCATEGORY
                })
                dispatch(setFilters({ action: 'group', value: data.result }))
            }
            handleCategories()
        }, [category])


        return (
            <div className='flex align-items-center'>
                <Dropdown
                    emptyMessage="Δεν υπάρχουν ομάδες"
                    disabled={!category ? true : false}
                    value={group}
                    options={filters.group}
                    onChange={onFilterGroupChange}
                    optionLabel="groupName"
                    placeholder="Φίλτρο Κατηγορίας"
                    className="p-column-filter  grid-filter"
                    style={{ minWidth: '14rem', fontSize: '12px' }}
                />
                <i className="pi pi-times ml-2 cursor-pointer" onClick={() => dispatch(setGroup(null))} ></i>
            </div>

        )
    };

    

    const MarkesFilter = ({ value, options, onChange }) => {
        const dispatch = useDispatch();
        useEffect(() => {
            const handleCategories = async () => {
                let { data } = await axios.post('/api/product/apiProductFilters', {
                    action: 'findBrands',
                })
                dispatch(setFilters({ action: 'marka', value: data.result }))
    
            }
            handleCategories()
    
        }, [])
        return (
            <div className='flex align-items-center'>
                <Dropdown
                    emptyMessage="Δεν υπάρχουν υποομάδες"
                    size="small"
                    filter
                    value={marka}
                    options={filters.marka}
                    onChange={onFilterMarkChange}
                    optionLabel="softOne.NAME"
                    placeholder="Φίλτρο Υποομάδας"
                    className="p-column-filter grid-filter"
                    style={{ minWidth: '14rem', fontSize: '12px' }}
                />
                <i className="pi pi-times ml-2 cursor-pointer" onClick={() => dispatch(setMarka(null))} ></i>
            </div>
        )
    }


    const SubGroupsRowFilterTemplate = (options) => {
        useEffect(() => {
            const handleCategories = async () => {
                let { data } = await axios.post('/api/product/apiProductFilters', {
                    action: 'findSubGroups',
                    groupID: group?.softOne.MTRGROUP
                })
                dispatch(setFilters({ action: 'subgroup', value: data.result }))

            }
            handleCategories()
        }, [group])

        return (
            <div className="flex align-items-center">
                <Dropdown
                    emptyMessage="Δεν υπάρχουν υποομάδες"
                    size="small"
                    disabled={!group ? true : false}
                    value={subgroup}
                    options={filters.subgroup}
                    onChange={onFilterSubGroupChange}
                    optionLabel="subGroupName"
                    placeholder="Φίλτρο Υποομάδας"
                    className="p-column-filter grid-filter"
                    style={{ minWidth: '14rem', fontSize: '12px' }}
                />
                <i className="pi pi-times ml-2 cursor-pointer" onClick={() => dispatch(setSubgroup(null))} ></i>
            </div>
        )
    };


    const SearchEAN = () => {
        const onSort = () => {
            dispatch(setSort())

        }
        return (
            <div className="flex align-items-center justify-content-start w-20rem ">
                <div className="p-input-icon-left w-full">
                    <i className="pi pi-search" />
                    <InputText value={stateFilters.codeSearch} placeholder='Αναζήτηση Kωδικού' onChange={(e) => setStateFilters(prev => ({...prev, codeSearch: e.target.value}))} />
                </div>
                <div className='ml-3'>
                    {sort === 0 ? (<i className="pi pi-sort-alt" onClick={onSort}></i>) : null}
                    {sort === 1 ? (<i className="pi pi-sort-amount-up" onClick={onSort}></i>) : null}
                    {sort === -1 ? (<i className="pi pi-sort-amount-down-alt" onClick={onSort}></i>) : null}
                </div>
            </div>
        )
    }

    return (
        <DataTable
            value={data}
            paginator
            loading={loading}
            rows={lazyState.rows}
            rowsPerPageOptions={[5, 10, 20, 50, 100, 200]}
            first={lazyState.first}
            lazy
            totalRecords={totalRecords}
            onPage={onPage}
            selectionMode={'checkbox'}
            selection={selectedProducts}
            onSelectionChange={onSelectionChange}
            className='border-1 border-round-sm	border-50'
            size="small"
            filterDisplay="row"
            showGridlines
            id={'_id'}

        >
            <Column selectionMode="multiple" headerStyle={{ width: '30px' }}></Column>
            <Column field="NAME" filter showFilterMenu={false} filterElement={Search} body={NameTemplate} header="Προϊόν"></Column>
            <Column
                        field="MTRMARK_NAME"
                        style={{ width: '300px' }}
                        header="Όνομα Μάρκας"
                        filter
                        showFilterMenu={false}
                        filterElement={MarkesFilter}>
                    </Column>
            <Column field="CATEGORY_NAME" header="Εμπορική Κατηγορία" filter filterElement={CategoriesRowFilterTemplate} showFilterMenu={false}></Column>
            <Column field="GROUP_NAME" showFilterMenu={false} filter filterElement={GroupRowFilterTemplate} header="Ομάδα" ></Column>
            <Column field="SUBGROUP_NAME" header="Υποομάδα" filter showFilterMenu={false} filterElement={SubGroupsRowFilterTemplate}></Column>
            <Column field="CODE" header="EAN" filter showFilterMenu={false} filterElement={SearchEAN}></Column>

        </DataTable>
    )
}


const NameTemplate = ({ NAME, SOFTONESTATUS }) => {

    return (
        <div>
            <p className='font-bold'>{NAME}</p>
            <div className='flex align-items-center'>
                <div style={{ width: '5px', height: '5px' }} className={`${SOFTONESTATUS === true ? "bg-green-500" : "bg-red-500"} border-circle mr-1 mt-1`}></div>
                <p>softone</p>
            </div>
        </div>
    )
}


export default ProductSearchGrid;