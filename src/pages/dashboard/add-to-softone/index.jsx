'use client'
import React, { useState, useEffect, useRef, use } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslateInput } from "@/components/Forms/TranslateInput";
import { setSubmitted } from "@/features/productsSlice";
import PrimeInputNumber from "@/components/Forms/PrimeInputNumber";
import DropdownCountries from "@/components/Forms/DropdownCountries";
import DropdownVat from "@/components/Forms/DropdownVat";
import DropdownCategories from "@/components/Forms/DropdownCategories";
import DropdownGroups from "@/components/Forms/DropdownGroups";
import DropdownSubroups from "@/components/Forms/DropdownSubgroups";
import DropdownManufacturers from "@/components/Forms/DrodownManufactures";
import DropdownBrands from "@/components/Forms/DropdownBrands";
import DropdownIntrastat from "@/components/Forms/DropdownIntrastat";
import Input from "@/components/Forms/PrimeInput";
import PrimeSelect from "@/components/Forms/PrimeSelect";
import { Button } from "primereact/button";
import { useToast } from "@/_context/ToastContext";
import { setSelectedProducts } from "@/features/productsSlice";
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from "next/router";


export default function Page() {
  const [visible, setVisible] = useState(false);
  const { selectedProducts } = useSelector((store) => store.products);
  const [rowData, setRowData] = useState({});
  const {showMessage} = useToast();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

 
  const handleAdd = async (rowData) => {
    setLoading(true)
    try {
      const { data } = await axios.post("/api/product/add-softone", {
        data: rowData,
      });
      if (!data.status) {
        showMessage("error", data.message, "Σφάλμα" );
      } else {
        showMessage("success", data.message, "Eπιτυχία" );
        let newProducts = selectedProducts.filter((product) => product._id !== rowData._id);
        dispatch(setSelectedProducts(newProducts));
      

      }
    } catch (e) {
      console.log(e.message);
      showMessage("error", e.message, "Σφάλμα!" );
    } finally {
      setLoading(false)
      setVisible(false);
    }
  };

  const handleEdit = (rowData) => {
    setVisible(true);
    setRowData(rowData);
  };

  return (
    <AdminLayout>
      <Table 
        data={selectedProducts} 
        setVisible={setVisible} 
        rowData={rowData} 
        handleEdit={handleEdit} 
        handleAdd={handleAdd}
        loading={loading}
      />
      <AddSoftoneForm
        loading={loading}
        rowData={rowData}
        visible={visible}
        handleAdd={handleAdd}
        setVisible={setVisible}
      />
    </AdminLayout>
  );
}

const Table = ({
  data, 
  setVisible,
  handleEdit,
  loading,
}) => {

     
      return (
        <DataTable
        header="Προϊόντα στην ουρά για προσθήκη στο SoftOne"
        value={data}
        showGridlines
        loading={loading}
      >
        <Column
          body={(rowData) => (
            <Actions
              setVisible={setVisible}
              handleEdit={() => handleEdit(rowData)}
            />
          )}
          style={{ width: "30px" }}
        ></Column>
        <Column field="NAME" header="Προϊόν"></Column>
        <Column field="CATEGORY_NAME" header="Εμπ. Κατηγορία"></Column>
        <Column field="GROUP_NAME" header="Ομάδα"></Column>
        <Column field="SUBGROUP_NAME" header="Yποομάδα"></Column>
        <Column field="MTRMARK_NAME" header="Μάρκα"></Column>
        <Column field="MMTRMANFCTR_NAME" header="Κατασκευαστής"></Column>
        <Column field="CODE" header="Κωδ. Εργοστασίου"></Column>
        <Column field="CODE1" header="Κωδικός EAN"></Column>
        <Column field="CODE2" header="Kωδ. Εργοστασίου"></Column>
      </DataTable>
      )
}


const Actions = ({  handleEdit }) => {
  return (
    <div className="flex align-items-center">
      <button  className="plus_button" onClick={handleEdit}>
        <i className="pi pi-pencil "></i>
      </button>
    </div>
  );
};

const addSchema = yup.object().shape({
    NAME: yup.string().required("Συμπληρώστε το όνομα"),
  
    MTRCATEGORY: yup.object().required("Συμπληρώστε την κατηγορία").typeError("Συμπληρώστε την Εμπορική Κατηγορία"),
    MTRGROUP: yup.object().required("Συμπληρώστε την Ομάδα").typeError("Συμπληρώστε την Ομάδα"),
 
    MTRMANFCTR:  yup.object().required("Συμπληρώστε τον Κατασκευαστή").typeError("Συμπληρώστε τον Κατασκευαστή"),
    // CCCSUBGROUP2: yup.object().required("Συμπληρώστε την υποομάδα").typeError("Συμπληρώστε την υποομάδα"),
});


const DEFAULT_VALUES = {
    NAME: "",
    MTRCATEGORY: null,
    MTRGROUP: null,
    CCCSUBGROUP2: null,
    MTRMANFCTR: null,
    MTRMARK: null,
    INTRASTAT: null,
    CODE: "",
    CODE1: "",
    CODE2: "",
    PRICER: 0,
    PRICEW: 0,
    PRICER02: 0,
    WIDTH: 0,
    LENGTH: 0,
    HEIGHT: 0,
    GWEIGHT: 0,
    VOLUME: 0,
    ISACTIVE: true,
    SKROUTZ: false,

}


const AddSoftoneForm = ({ visible, setVisible, rowData, handleAdd, loading }) => {
  
  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(addSchema),
  });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = methods;
  const values = methods.watch();

  useEffect(() => {
    reset({
        _id: rowData?._id,
        NAME: rowData?.NAME,
        MTRCATEGORY: rowData?.MTRCATEGORY,
        MTRGROUP: rowData?.MTRGROUP,
        CCCSUBGROUP2: rowData?.CCCSUBGROUP2,
        MTRMANFCTR: rowData?.MTRMANFCTR,
        MTRMARK: rowData?.MTRMARK,
        INTRASTAT: rowData?.INTRASTAT,
        CODE: rowData?.CODE,
        CODE1: rowData?.CODE1,
        CODE2: rowData?.CODE2,
        PRICER: rowData?.PRICER,
        PRICEW: rowData?.PRICEW,
        PRICER02: rowData?.PRICER02,
        WIDTH: rowData?.WIDTH,
        LENGTH: rowData?.LENGTH,
        HEIGHT: rowData?.HEIGHT,
        GWEIGHT: rowData?.GWEIGHT,
        VOLUME: rowData?.VOLUME,
        ISACTIVE: rowData?.ISACTIVE,
        SKROUTZ: rowData?.isSkroutz,
    });
  }, [reset, rowData]);
  const handleInputChange = (value, name) => {
    setValue(name, value);
  };

  const handleCategoryClear = () => {
    setValue("MTRCATEGORY", null);
    setValue("MTRGROUP", null);
    setValue("CCCSUBGROUP2");
  };
  const handleGroupClear = () => {
    setValue("MTRGROUP", null);
    setValue("CCCSUBGROUP2", null);
  };
  const handleSubgroupClear = () => {
    setValue("CCCSUBGROUP2", null);
  };


 

  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Ακύρωση"
        icon="pi pi-times"
        severity="info"
        outlined
        onClick={() => setVisible(false)}
      />
      <Button
        label="Αποθήκευση"
        icon="pi pi-check"
        severity="info"
        loading={loading}
        onClick={handleSubmit(handleAdd)}
      />
    </React.Fragment>
  );

  
  return (
    <div>
      <Dialog
        className="dialog_form"
        footer={productDialogFooter}
        breakpoints={{ "960px": "60vw", "640px": "90vw" }}
        header="Προσθήκη Προϊόντος στο SoftOne"
        visible={visible}
        maximizable
        modal
        // style={{width: "34rem", minHeight: "40vh"}}
        onHide={() => setVisible(false)}
      >
        <form
          className="form"
          onSubmit={handleSubmit(handleAdd)}
        >   
          <Input 
                label={"Όνομα Προϊόντος"} 
                name={"NAME"} 
                control={methods.control} 
                error={errors.NAME}

                />
          <div className="product_form_grid_row">
            <DropdownCategories
              isEdit={true}
              showClear={true}
              state={values.MTRCATEGORY}
              handleState={(e) => handleInputChange(e, "MTRCATEGORY")}
              error={errors?.MTRCATEGORY?.message}
              handleClear={handleCategoryClear}
            />
            <DropdownGroups
              isEdit={true}
              state={values.MTRGROUP}
              handleState={(e) => handleInputChange(e, "MTRGROUP")}
              error={errors?.MTRGROUP?.message}
              categoryId={values?.MTRCATEGORY?.softOne?.MTRCATEGORY}
              handleClear={handleGroupClear}
            />
          </div>
          <div className="product_form_grid_row">
            <DropdownSubroups
              isEdit={true}
              state={values.CCCSUBGROUP2}
              handleState={(e) => handleInputChange(e, "CCCSUBGROUP2")}
              error={errors?.CCCSUBGROUP2?.message}
              groupId={values?.MTRGROUP?.softOne?.MTRGROUP}
              categoryId={values?.MTRCATEGORY?.softOne?.MTRCATEGORY}
              handleClear={handleSubgroupClear}
            />
            <DropdownManufacturers
              isEdit={true}
              state={values?.MTRMANFCTR}
              handleState={(e) => handleInputChange(e, "MTRMANFCTR")}
              error={errors?.MTRMANFCTR?.message}
            />
          </div>
          <div className="product_form_grid_row">
            <DropdownBrands
              isEdit={true}
              state={values?.MTRMARK}
              handleState={(e) => handleInputChange(e, "MTRMARK")}
              error={errors?.MTRMARK?.message}
            />
            <DropdownIntrastat
              isEdit={true}
              state={values.INTRASTAT}
              handleState={(e) => handleInputChange(e, "INTRASTAT")}
              error={errors?.INTRASTAT}
            />
          </div>

          <div className="product_form_grid_row">
            <DropdownVat
              isEdit={true}
              state={values.VAT}
              handleState={(e) => handleInputChange(e, "VAT")}
              error={errors?.VAT?.NAME.message}
            />
            <DropdownCountries
              isEdit={true}
              state={values.COUNTRY}
              handleState={(e) => handleInputChange(e, "COUNTRY")}
              error={errors?.COUNTRY?.NAME.message}
            />
          </div>
          <p className="mt-2 font-bold text-lg">Κωδικοί</p>
          <div className="product_form_grid_row_three">
            <Input 
                label={"Κωδικός ERP"} 
                name={"CODE"} 
                control={control} 

                />
            <Input 
                label={"Κωδικός EAN"} 
                name={"CODE1"} 
                control={control} 

                />
            <Input 
                label={"Κωδικός Εργοστασίου"} 
                name={"CODE2"} 
                control={control} 

                />
          
          </div>
          <p className="mt-2 font-bold text-lg">Τιμές</p>
          <div className="product_form_grid_row_three">
            <PrimeInputNumber
              label={"Τιμή Λιανικής"}
              name={"PRICER"}
              prefix={"€"}
              maxFractionDigits={2}
              control={methods.control}
              required
              error={errors.PRICER}
            />

            <PrimeInputNumber
              label={"Τιμή Χονδρικής"}
              name={"PRICEW"}
              prefix={"€"}
              maxFractionDigits={2}
              control={control}
              required
              error={errors.PRICEW}
            />
            <PrimeInputNumber
              label={"Τιμή Skroutz"}
              name={"PRICER02"}
              prefix={"€"}
              maxFractionDigits={2}
              control={control}
              required
              error={errors?.PRICER02}
            />
          </div>
          <p className="mt-2 font-bold text-lg">Πληροφορίες</p>
          <div className="product_form_grid_row">
            <PrimeInputNumber
              label={"Πλάτος"}
              name={"WIDTH"}
              maxFractionDigits={2}
              control={methods.control}
              required
              error={errors.WIDTH}
            />

            <PrimeInputNumber
              label={"Μήκος"}
              name={"LENGTH"}
              maxFractionDigits={2}
              control={methods.control}
              required
              error={errors.LENGTH}
            />
          </div>
          <div className="product_form_grid_row_three">
            <PrimeInputNumber
              label={"Ύψος"}
              name={"HEIGHT"}
              control={methods.control}
              required
              error={errors.HEIGHT}
            />
            <PrimeInputNumber
              label={"Βάρος"}
              name={"GWEIGHT"}
              control={methods.control}
              required
              error={errors.GWEIGHT}
            />
            <PrimeInputNumber
              label={"Όγκος"}
              name={"VOLUME"}
              control={methods.control}
              required
              error={errors.VOLUME}
            />
          </div>
          <div className="product_form_grid_row">
            <PrimeSelect
              options={[
                { label: "Είναι στο Skroutz", value: true },
                { label: "Δεν είναι στο Skroutz", value: false },
              ]}
              label="Στο Skroutz"
              name="isSkroutz"
              optionLabel={"label"}
              optionValue={"value"}
              control={methods.control}
            />
            <PrimeSelect
              options={[
                { label: "Ενεργό Προϊόν", value: true },
                { label: "Ανενεργό Προϊόν", value: false },
              ]}
              label="Κατάσταση Προϊόντος"
              name="ISACTIVE"
              optionLabel={"label"}
              optionValue={"value"}
              control={methods.control}
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};
