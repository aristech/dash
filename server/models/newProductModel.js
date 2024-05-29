import mongoose from 'mongoose';
import { model, models, Schema } from 'mongoose';
import { ImpaCodes } from './impaSchema';

const softoneProduct = new mongoose.Schema({
   
    MTRL: { type: String },
    NAME_ENG: String,
    DESCRIPTION: String,
    DESCRIPTION_ENG: String,
    ISACTIVE: Boolean,
    NAME: {
        type: String,
        index: true,
    },
    CODE: {
        type: String,
        index: true,
    }, // κωδικός ERP
    CODE1: {
        type: String,
        index: true,
    
    }, // κωδικός EAN
    CODE2: {
        type: String,
        index: true,
    }, 
    MTRCATEGORY: {
        type: Number,
        default: 0
    },
    CATEGORY_NAME: String,
    MTRGROUP: {
        type: Number,
        default: 0
    },
    GROUP_NAME: String,
    CCCSUBGROUP2: {
        type: Number,
        default: 0
    },
    CCCSUBGROUP: {
        type: Number,
        default: 0
    },
    SUBGROUP_NAME: String,
    MTRMANFCTR: String,
    MTRMARK: {
        type: Number,
        default: 0
    },
    VAT: String,
    COUNTRY: String,
    INTRASTAT: String,
    WIDTH: String,
    HEIGHT: String,
    LENGTH: String,
    GWEIGHT: String,
    VOLUME: String,
    STOCK: String,
    PRICER: Number,
    COST: Number,
    PRICEW: Number,
    PRICER01: Number, //SKROUTZ
    PRICER02: Number,
    PRICER05: Number,
    UPDDATE: String,
    availability: {
        DIATHESIMA: String,
        SEPARAGELIA: String,
        DESVMEVMENA: String,
        date: String,
    },
    SOFTONESTATUS: {
        type: Boolean,
        default: false
    },
    UPDATEDFROM: String,
    impas: {
        type: Schema.Types.ObjectId,
        ref: 'ImpaCodes'
    },
    images: [{
        name: String,
    }],
    hasImage: {
        type: Boolean,
        default: false,
    },
    MTRMARK_NAME: String,
    MMTRMANFCTR_NAME: String,
    DIM1: String,
    DIM2: String,
    DIM3: String,
    MTRUNIT3: String,
    MTRUNIT4: String,
    MU31: String,
    MU41: String,
    isSkroutz: {
        type: Boolean,
        default: false
    },
},

{
    timestamps: true,
});




const productSchema = new mongoose.Schema({
    name: { type: String},
    localized: [{
        fieldName: String,
        translations: [
            {
                locale: String,
                code: String,
                translation: String,
            }
        ]
}],
   
    images: [{
        type: Schema.Types.ObjectId,
        ref: 'Media'
    }],
   
    videos: [{
        type: Schema.Types.ObjectId,
        ref: 'Media'
    }],
    ventorUrl: { type: String, required: false },

},
{
    timestamps: true,
});









const SoftoneProduct = models.SoftoneProduct || model('SoftoneProduct', softoneProduct)
SoftoneProduct.createIndexes();

const Product = models.Product || model('Product', productSchema);

export {
    Product,
}
export default SoftoneProduct;