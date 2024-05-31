import React, { useState, useEffect, useRef, use } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
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
import { TextAreaInput } from "@/components/Forms/PrimeInput";

export default function Page() {
  const toast = useRef(null);
  const [visible, setVisible] = useState(false);
  const { selectedProducts } = useSelector((store) => store.products);
  const [rowData, setRowData] = useState({});
  const showError = (message, summary = "Error") => {
    toast.current.show({
      severity: "error",
      summary: summary,
      detail: message,
      life: 4000,
    });
  };

  const handleAdd = async (rowData) => {
    try {
      const { data } = await axios.post("/api/product/add-softone", {
        data: rowData,
      });
      console.log({ data });
      // if(!data.success) {
      //     showError(data.message)
      // }
      if (!data.status) {
        showError(data.message);
      }
    } catch (e) {
      console.log(e.message);
      showError(e.message);
    }
  };

  const handleEdit = (rowData) => {
    setVisible(true);
    setRowData(rowData);
  };

  return (
    <AdminLayout>
      <Toast ref={toast} />
      <DataTable
        header="Προϊόντα στην ουρά για προσθήκη στο SoftOne"
        value={selectedProducts}
        showGridlines
      >
        <Column
          body={(rowData) => (
            <Actions
              setVisible={setVisible}
              rowData={rowData}
              handleEdit={() => handleEdit(rowData)}
              handleSubmit={handleAdd}
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
      <AddSoftoneForm
        rowData={rowData}
        visible={visible}
        setVisible={setVisible}
      />
    </AdminLayout>
  );
}

const Actions = ({ rowData, handleSubmit, handleEdit }) => {
  return (
    <div className="flex align-items-center">
      <button
        className="plus_button mr-2"
        onClick={() => handleSubmit(rowData)}
      >
        <i className="pi pi-plus "></i>
      </button>
      <button className="plus_button" onClick={handleEdit}>
        <i className="pi pi-pencil "></i>
      </button>
    </div>
  );
};

const addSchema = yup.object().shape({
  NAME: yup.string().required("Συμπληρώστε το όνομα"),
  PRICER: yup
    .number()
    .typeError("Πρέπει να είναι αριθμός")
    .required("Συμπληρώστε την τιμή λιανικής"),
  // MTRCATEGORY: yup.object().required("Συμπληρώστε την κατηγορία"),
  // MTRGROUP: yup.object().required("Συμπληρώστε την ομάδα"),
  // CCCSUBGROUP2: yup.object().required("Συμπληρώστε την υποομάδα"),
});

const defaultValues = {
  NAME: "",
  //DROPDOWNS:
  MTRCATEGORY: null,
  MTRGROUP: null,
  CCCSUBGROUP2: null,
  MTRMANFCTR: null,
  MTRMARK: null,
  INTRASTAT: null,
  //CODES:
  CODE: "",
  CODE1: "",
  CODE2: "",
  //PRICES:
  PRICER: null,
  PRICEW: null,
  PRICER02: null,
  //DIMENSIONS:
  WIDTH: null,
  LENGTH: null,
  HEIGHT: null,
  GWEIGHT: null,
  VOLUME: null,
  //AVAILABILITY:
  isSkroutz: null,
};

const AddSoftoneForm = ({ visible, setVisible, rowData }) => {
  console.log({ rowData });
  const methods = useForm({
    resolver: yupResolver(addSchema),
  });
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
    setValue,
  } = methods;
  const values = methods.watch();

  useEffect(() => {
    reset({
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
    });
  }, []);
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
  return (
    <div>
      <Dialog
        breakpoints={{ "960px": "60vw", "640px": "90vw" }}
        header="Προσθήκη Προϊόντος στο SoftOne"
        visible={visible}
        hideDialog={() => setVisible(false)}
        style={{width: "34rem", minHeight: "40vh"}}
        onHide={() => setVisible(false)}
      >
        <form
          className="form"
          onSubmit={handleSubmit((data) => console.log(data))}
        >
          <div className="product_form_grid_row">
            <DropdownCategories
              isEdit={true}
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
              state={values.MTRMANFCTR}
              handleState={(e) => handleInputChange(e, "MTRMANFCTR")}
              error={errors?.MTRMANFCTR}
            />
          </div>
          <div className="product_form_grid_row">
            <DropdownBrands
              isEdit={true}
              state={values.MTRMARK}
              handleState={(e) => handleInputChange(e, "MTRMARK")}
              error={errors?.MTRMARK}
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
                            control={methods.control}
                            required
                            error={errors.PRICEW}
                        />
                        <PrimeInputNumber
                            label={"Τιμή Skroutz"}
                            name={"PRICER02"}
                            prefix={"€"}
                            maxFractionDigits={2}
                            control={methods.control}
                            required
                            error={errors?.PRICER02}
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
                control={methods.control}
                required
                error={errors.PRICEW}
              />
              <PrimeInputNumber
                label={"Τιμή Χονδρικής"}
                name={"PRICEW"}
                prefix={"€"}
                maxFractionDigits={2}
                control={methods.control}
                required
                error={errors.PRICEW}
              />
            
          </div>
          {/* <div className="product_form_grid_row">
           
           
            <p className="mt-2 font-bold text-lg">Τιμές</p>
            
          </div>
          <div className="product_form_grid_row"></div>
          <div className="product_form_grid_row"></div> */}
        </form>
      </Dialog>
    </div>
  );
};
