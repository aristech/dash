import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    gridData: [],
    mongoKeys: {},
    newData: [],
}

const uploadImagesSlice = createSlice({
    name: 'uploadImages',
    initialState,
    reducers: {
        setGridData: (state, {payload}) => {
            state.gridData = payload;
        },
        setSelectedMongoKeys: (state, {payload}) => {
            // one of the values CODE, CODE1, CODE2. must exist 
            // and a value for the IMAGES URL:
            // const existingKey = state.mongoKeys.find(item => item.value === payload.value);
            // if (existingKey) {
            //     existingKey.related = payload.related;
            //     return;
            // }

            // state.mongoKeys.push(payload);
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
} = uploadImagesSlice.actions;

export default uploadImagesSlice.reducer;



