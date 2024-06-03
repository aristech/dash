import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    gridData: [],
    mongoKeys: {},
    newData: [],
}

const deactivateProductsSlice = createSlice({
    name: 'deactivateProducts',
    initialState,
    reducers: {
        setGridData: (state, {payload}) => {
            state.gridData = payload;
        },
        setSelectedMongoKeys: (state, {payload}) => {
            state.mongoKeys = payload;
        },
        removeSelectedKey: (state, {payload}) => {
            state.mongoKeys = state.mongoKeys.filter(item => item.oldKey !== payload);
        },
        setClearKeys: (state) => {
            state.mongoKeys = [];
            state.attributes = [];
        },
        setNewData: (state, {payload}) => {
            state.newData = payload;
        }
    },

})


export const {
    removeSelectedKey,
    setGridData,
    setSelectedMongoKeys,
    setClearKeys,
    setNewData,
} = deactivateProductsSlice.actions;

export default deactivateProductsSlice.reducer;



