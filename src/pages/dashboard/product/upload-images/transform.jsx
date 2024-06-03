import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import XLSXDownloadButton from "@/components/exportCSV/Download";
import { Toast } from "primereact/toast";
import {
  setSelectedMongoKeys,
  removeSelectedKey,
  setClearKeys,
  setNewData,
} from "@/features/uploadImagesSlice";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { useForm } from "react-hook-form";
import DropdownCustom from "@/components/Forms/DropdownCustom";
import { MultiSelect } from 'primereact/multiselect';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
const MAPPING_KEYS = [
  {
    label: "Κωδικός Εργοστασίου",
    key: "CODE2",
  },
  {
    label: "Κωδικός ERP",
    key: "CODE",
  },
];
export const Page = () => {
  const [loading, setLoading] = useState(false);
  const [returnedData, setReturendData] = useState([]);
  const router = useRouter();
  const { gridData, mongoKeys} = useSelector((state) => state.uploadImages);
  const toast = useRef(null);
  const [visible, setIsVisible] = useState(false);

  
  useEffect(() => {
    console.log({mongoKeys})
  }, [mongoKeys])

  const columns = () => {
    if (!gridData || !gridData.length) {
      router.push("/dashboard/product");
      return;
    }
    //CREATE COLUMNS:
    let row = Object?.keys(gridData[0]);
    return row.map((col) => (
      <Column
        key={col}
        field={col}
        header={col}
      />
    ));
  };


  
  return (
    <AdminLayout>
      <Toast ref={toast} />
      <DataTable
        header={() => (
          <div className="flex justify-content-between">
            <Button
              size="small"
              label="Συσχετισμός"
              icon="pi pi-file"
              onClick={() => setIsVisible(true)}
            />
            <XLSXDownloadButton
              data={returnedData}
              filename="images"
              size="small"
            />
          </div>
        )}
        editMode="cell"
        paginator
        rows={10}
        showGridlines
        rowsPerPageOptions={[20, 50, 100, 200, 500]}
        selectionMode="radiobutton"
        value={gridData}
        tableStyle={{ minWidth: "50rem" }}
        filterDisplay="row"
      >
        {columns()}
      </DataTable>
        <FieldMappingDialog 
        isVisible={visible}
        data={gridData}
        setIsVisible={setIsVisible}

        />
    </AdminLayout>
  );
};



const schema = yup.object().shape({
    keyField:  yup.string().required("Υποχρεωτικό πεδίο").typeError("Υποχρεωτικό πεδίο"),
    mappingKey: yup.object().required("Υποχρεωτικό πεδίο").typeError("Υποχρεωτικό πεδίο"),
    imageFields: yup.array().min(1, "Επιλέξτε τουλάχιστον μία στήλη").typeError("Επιλέξτε τουλάχιστον μία στήλη")

 
});



const FieldMappingDialog = ({ isVisible, setIsVisible, data }) => {


  const router = useRouter();
  const dispatch = useDispatch()
  const keysOptions = Object?.keys(data[0]).map((key) => ({
    label: key,
    value: key,
  }));

  const formMethods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      keyField: null,
      mappingKey: null,
      imageFields: [],
    },
  });

 
 
  const { handleSubmit, watch, setValue, control, formState: { errors } } = formMethods;
  const formValues = watch();


  const handleFormat = async (formData) => {
    const res = await axios.post("/api/butchImages/format", {
      data: data,
      mongoKeys: formData,
    });


    
    if(res.data.success) {
      dispatch(setSelectedMongoKeys(formData))
      dispatch(setNewData(res.data.result));
      router.push('/dashboard/product/upload-images/altered')
    }
  
  }


  
  const dialogFooter = (
    <React.Fragment>
      <Button
        size="small"
        label="Ακύρωση"
        icon="pi pi-times"
        severity="info"
        outlined
        onClick={() => setIsVisible(false)}
      />
      <Button
        size="small"
        label="Αποθήκευση"
        icon="pi pi-check"
        severity="info"
        onClick={handleSubmit(handleFormat)}
      />
    </React.Fragment>
  );

  
  return (
    <Dialog
      footer={dialogFooter}
      visible={isVisible}
      style={{ width: "40vw" }}
      header="Συσχέτιση"
      modal
      onHide={() => setIsVisible(false)}
    >
      <form className="form" onSubmit={handleSubmit(handleFormat)}>
        <DropdownCustom 
          options={keysOptions}
          label="Στήλη Κλειδίου Αντιστοίχησης"
          state={formValues?.keyField}
          handleState={(e) => setValue("keyField", e)}
          error={errors?.keyField?.message}
        />
        <DropdownCustom 
          filter={false}
          disabled={!formValues?.keyField}
          options={MAPPING_KEYS}
          label="Επιλέξτε Διαθέσιμο Κλειδί"
          state={formValues?.mappingKey}
          handleState={(e) => setValue("mappingKey", e)}
          error={errors?.mappingKey?.message}
        />
       
        <CustomMultiSelect 
            label="Επιλέξτε Στήλες Φωτογραφιών"
            handleState={(e) => setValue("imageFields", e.value)}
            state={formValues?.imageFields}
            options={keysOptions}
            placeholder="Επιλέξτε τις στήλες με σειρά"
            removeKey={formValues?.keyField}
            error={errors?.imageFields?.message}

        />
      </form>
    </Dialog>
  );
}


const CustomMultiSelect = ({
  state, 
  handleState,
  error, 
  options, 
  label, 
  placeholder, 
  optionLabel="label", 
  removeKey
}) => {

  let newOptions = options.filter(item => item.value !== removeKey)
  return (
    <div>
    <label className={`custom_label ${error ? "text-red-600" : null }`}>{label}</label>
    <MultiSelect 
      showClear
      value={state} 
      onChange={handleState} 
      options={newOptions} 
      optionLabel={optionLabel} 
      placeholder={placeholder} 
      maxSelectedLabels={3} 
      className={`w-full custom_dropdown ${error ? "p-invalid" : null}`}

    />
     {error ? (<span className="text-red-600 mt-1">{error}</span>) : null}
  </div>
  )
}


export default Page;
