import React from 'react';
import { InputText } from 'primereact/inputtext';

export function SearchAndSort({ 
    state,
    isSearch = true,
    handleState,
    placeholder = "Αναζήτηση..", // Default placeholder text
    sort,
    handleSort,
}) {

 
    const SortIcon = () => {
        if (sort === 1) return <i className="sort_icon pi pi-sort-amount-up" aria-label="Sort Ascending" onClick={() => handleSort(-1)}></i>;
        if (sort === -1) return <i className="sort_icon  pi pi-sort-amount-down-alt" aria-label="Sort Descending" onClick={() => handleSort(null)}></i>;
       return <i className="sort_icon pi pi-sort-alt" aria-label="Sort" onClick={() => handleSort(1)}></i>;
    };

    return (
      <div className="flex align-items-center">
        {isSearch ? (
           <div className="p-input-icon-left w-full">
           <i className="pi pi-search" />
           <InputText
             className="custom_search_input"
             value={state}
             placeholder={placeholder}
             onChange={(e) => handleState(e.target.value)}
           />
         </div>
        ) : null}
        <div className="ml-2">
            <SortIcon />
        </div>
      </div>
    );
}
