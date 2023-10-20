import mongoose from 'mongoose';
import { model, models, Schema } from 'mongoose';

const supplierSchema = new mongoose.Schema({
    TRDR: {
      type: String,
      required: true,
    },
    CODE: {
      type: String,
    },
    NAME: {
      type: String,
    },
    ISACTIVE: {
        type: Number,
    },
    COUNTRY: {
      type: Number,
    },
    BRANCH: {
        type: Number,
        },
    ADDRESS: {
      type: String,
    },
    ZIP: {
      type: String,
    },
    CITY: {
      type: String,
    },
    AREAS:{
        type: String,
    },
    PHONE01: {
      type: String,
    },
    PHONE02: {
      type: String,
      
    },
    WEBPAGE:{
        type: String,
    },
    EMAIL:{
        type: String,
    },
    AFM: String,
    EMAILACC:{
        type: String,
    },
    IRSDATA:{
        type: String,
    },
    PAYMENT:{
        type: String,
    },   
    
    JOBTYPE:{
        type: String,
    },
    JOBTYPETRD:{
        type: String,
    }
  });
  
const Supplier = models.Supplier || model('Supplier', supplierSchema);
export default Supplier;