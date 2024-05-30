import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    gridData: [],
    data: [],
    attributes: [],
    mongoKeys: [],
    newData: [],
    returnProducts: [],
}


const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        setGridData: (state, {payload}) => {
            state.gridData = payload;
        },
        setData: (state, {payload}) => {
            state.data = payload;
        },
        setNewData: (state, {payload}) => {
            state.newData = payload;
        },

        setSelectedMongoKey: (state, {payload}) => {
            const existingKey = state.mongoKeys.find(item => item.oldKey === payload.oldKey);
            if (existingKey) {
                existingKey.related = payload.related;
                return;
            }
            state.mongoKeys.push(payload);
        },
        //When we clear the option, find the selected key based on the FIELD form the dropdown and
        //remove it:
        removeSelectedKey: (state, {payload}) => {
            state.mongoKeys = state.mongoKeys.filter(item => item.oldKey !== payload);
            state.attributes = state.attributes.filter(item => item.oldKey !== payload);
        },

        setClearKeys: (state) => {
            state.mongoKeys = [];
            state.attributes = [];
        },
        setAttribute: (state, {payload}) => {

            const existingAttribute = state.attributes.find(item => item.name === payload.name);
            if (existingAttribute) {
                existingAttribute.oldKey = payload.oldkey;
            } else {
                state.attributes.push(payload);
            }
            // const existingAttribute = state.attributes.find(item => item.name === payload.name);
            // if(existingAttribute) {
            // 	existingAttribute.value = payload.value;
            // 	return;
            // } else {
            // 	state.attributes.push(payload);
            // }
            // state.mongoKeys = state.mongoKeys.filter(item => item.newkey !== payload.name);
        },


        setReturnedProducts: (state, {payload}) => {
            state.returnProducts.push(payload);
        }

    },

})


export const {
    setGridData,
    setSelectedMongoKey,
    removeSelectedKey,
    setAttribute,
    setClearKeys,
    setNewData,
    setReturnedProducts,
} = catalogSlice.actions;

export default catalogSlice.reducer;



