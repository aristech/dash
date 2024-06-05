import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    selectedProducts: [],
    submitted: false,
    mtrLines: [],
    orderLines: [],
    loading: false,
    lazyState2: {
        first: 0,
        rows: 50,
        page: 1,
    },
}



const productsSlice = createSlice({
	name: 'products',
	initialState,
	reducers: {
        setSelectedProducts: (state, {payload}) => {
           
			state.selectedProducts = payload;
			
			const updateMTRLINES = payload.map(item => {
				return {
					NAME: item.NAME,
					QTY1: 1,
					PRICE: parseInt(item.PRICER),
                    COST: item.COST,
					MTRL: item.MTRL,
					TOTAL_PRICE: parseInt(item.PRICER),
                    TOTAL_COST: item.COST,
				}
			})
			state.mtrLines = updateMTRLINES;

		},
        setSubmitted: (state) => {
            state.submitted = !state.submitted;
        },
        deleteSelectedProduct: (state, {payload}) => {
			state.selectedProducts = state.selectedProducts.filter(product => product._id !== payload.id);
            state.mtrLines = state.mtrLines.filter(product => product.NAME !== payload.name);
		},

        //#used in the selected products grid to update the quantity and the total price
		setMtrLines: (state, {payload}) => {
			state.mtrLines = state.mtrLines.map(item => {
				if (item.MTRL === payload.MTRL) {
					return { ...item, QTY1: payload.QTY1, TOTAL_PRICE: payload.QTY1 * parseInt(item.PRICE) , TOTAL_COST: payload.QTY1 * item.COST};
				}
				return item;
			});
		},
	

        //set the state after dropwdown selection
        setCategory: (state, {payload}) => { 
            state.category = payload;
            state.group = null;
            state.subgroup = null;
            // state.marka = null;
            // state.searchTerm = '';
            state.lazyState.first = 0;
            state.lazyState2.first = 0;
        },
        setGroup: (state, {payload}) => {
            state.group = payload;
            state.subgroup = null;
            state.lazyState.first = 0;
            state.lazyState2.first = 0;
        },
        setSubgroup: (state, {payload}) => {
            state.subgroup = payload;
            state.lazyState.first = 0;
            state.lazyState2.first = 0;

        },
        setMarka: (state, {payload}) => {
            state.marka = payload;
            state.lazyState.first = 0;
            state.lazyState2.first = 0;
        },
        //set lazystate after a page change, or a filter change
        setLazyState: (state, {payload}) => {
            state.lazyState = payload;
        },
        setLazyState2: (state, {payload}) => {
            state.lazyState2 = payload;
        },
        setLoading: (state, {payload}) => {
            state.loading = payload
        },
        resetSelectedFilters: (state) => {
            state.category = null;
            state.group = null;
            state.subgroup = null;
            state.softoneFilter = null;
            state.marka = null;

        },
        setSearchTerm: (state, {payload}) => {
            state.searchTerm = payload;
           
        },
        setCodeSearch: (state, {payload}) => {
            state.codeSearch = payload;
      
        },
        setSort: (state) => {
            if(state.sort == 0) {
                state.sort = 1;
                return;
            };
            if(state.sort == 1) {
                state.sort = -1;
                return;
            };
            if(state.sort == -1) {
                state.sort = 0;
                return;
            };
        },
        setSortImpa: (state) => {
            if(state.sortImpa == 0) {
                state.sortImpa = 1;
                return;
            };
            if(state.sortImpa == 1) {
                state.sortImpa = -1;
                return;
            };
            if(state.sortImpa == -1) {
                state.sortImpa = 0;
                return;
            };
          
        },
        setSortPrice: (state) => {
            if(state.sortPrice == 0) {
                state.sortPrice = 1;
                return;
            };
            if(state.sortPrice == 1) {
                state.sortPrice = -1;
                return;
            };
            if(state.sortPrice == -1) {
                state.sortPrice = 0;
                return;
            };
        },
        setSortEan: (state) => {
            if(state.sortEan == 0) {
                state.sortEan = 1;
                return;
            };
            if(state.sortEan == 1) {
                state.sortEan = -1;
                return;
            };
            if(state.sortEan == -1) {
                state.sortEan = 0;
                return;
            };
        },
        setSortAvailability: (state) => {
            state.searchTerm = '';
          
            if(state.sortAvailability == 0) {
                state.sortAvailability = 1;
                return;
            };
            if(state.sortAvailability == 1) {
                state.sortAvailability = -1;
                return;
            };
            if(state.sortAvailability == -1) {
                state.sortAvailability = 0;
                return;
            };
              //reset all the others:
              state.category = null;
              state.group = null;
              state.subgroup = null;
              state.softoneFilter = null;
        },
        setProductsForSoftone: (state, {payload}) => {
            state.productsForSoftone = payload;
        },
        //There is a queue of products waiting to be inserted to softone, this is the single product that is being inserted
        setSingleProductForSoftone: (state, {payload}) => {
            state.singleProductForSoftone = payload;
        },
       removeProductForSoftone: (state, {payload}) => {
            let filter = state.productsForSoftone.filter(product => product._id !== payload)
            state.productsForSoftone = filter;
       },
       setSoftoneFilter: (state, {payload}) => {
            state.softoneFilter = payload;
       }    

	},

})


export const {	
	setFilters,
    setCategory,
    setGroup,
    setSubgroup,
    setMarka,
    setLazyState,
    setLazyState2,
    setLoading,
    resetSelectedFilters,
    setSearchTerm,
    setSort,
    setSelectedProducts,
    setMtrLines,
    deleteSelectedProduct,
    setProductsForSoftone,
    setSingleProductForSoftone,
    removeProductForSoftone,
    setSoftoneFilter,
    setSortAvailability,
    setSortPrice,
    setSubmitted,
    setSortImpa,
    setSortEan,
} = productsSlice.actions;

export default productsSlice.reducer;



