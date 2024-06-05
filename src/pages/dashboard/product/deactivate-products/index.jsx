import React, { useState, useRef, useEffect } from "react";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { useForm } from "react-hook-form";
import DropdownCustom from "@/components/Forms/DropdownCustom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { setGridData, setSelectedMongoKeys, setNewData } from "@/features/deactivateProductsSlice";

const MAPPING_KEYS = [
  {
    label: "Κωδικός Εργοστασίου",
    key: "CODE2",
  },
  {
    label: "Κωδικός EAN",
    key: "CODE1",
  },
  {
    label: "Κωδικός ERP",
    key: "CODE",
  },
];

export default function PageWrapper() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { gridData } = useSelector((state) => state.deactivateProducts);

  useEffect(() => {
      dispatch(setGridData([]));
  }, [])
 
  const onUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
   
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        dispatch(setGridData(parsedData));
      };
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <AdminLayout>
      <div>
        <input
          hidden
          className="hide"
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileUpload(e)}
        />
        <Button
          size="small"
          className="mb-4"
          loading={loading}
          onClick={onUploadClick}
          severity="secondary"
          label="Ανέβασμα Προϊόντων για Απενεργοποίηση"
          icon="pi pi-upload"
        ></Button>
      </div>
      {gridData.length ? (<Table gridData={gridData} />) : null}
    </AdminLayout>
  );
}

function Table({ gridData }) {
  const [visible, setIsVisible] = useState(false);


  const columns = () => {
    //CREATE COLUMNS:
    let row = Object?.keys(gridData[0]);
    return row.map((col) => <Column key={col} field={col} header={col} />);
  };

  return (
    <>
      <DataTable
        header={() => (
          <div className="flex justify-content-between">
            <Button
              size="small"
              label="Συσχετισμός"
              icon="pi pi-file"
              onClick={() => setIsVisible(true)}
            />
          </div>
        )}
        paginator
        rows={10}
        showGridlines
        rowsPerPageOptions={[20, 50, 100, 200, 500]}
        selectionMode="radiobutton"
        value={gridData}
        tableStyle={{ minWidth: "50rem" }}
      >
        {columns()}
      </DataTable>
      <FieldMappingDialog
        isVisible={visible}
        data={gridData}
        setIsVisible={setIsVisible}
      />
    </>
  );
}

const schema = yup.object().shape({
  keyField: yup
    .string()
    .required("Υποχρεωτικό πεδίο")
    .typeError("Υποχρεωτικό πεδίο"),
  mappingKey: yup
    .object()
    .required("Υποχρεωτικό πεδίο")
    .typeError("Υποχρεωτικό πεδίο"),
});

const FieldMappingDialog = ({ 
    isVisible, 
    setIsVisible, 
    data 
}) => {
 
  const router = useRouter();
  const dispatch = useDispatch();
  const keysOptions = Object?.keys(data[0]).map((key) => ({
    label: key,
    value: key,
  }));

  const formMethods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      keyField: null,
      mappingKey: null,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formMethods;
  const formValues = watch();

  const handleFormat = async (formData) => {
    const res = await axios.post("/api/deactivateUploadedProducts/format", {
      data: data,
      mongoKeys: formData,
    });

    if (res.data.success) {
      dispatch(setSelectedMongoKeys(formData));
      dispatch(setNewData(res.data.result));
      router.push("/dashboard/product/deactivate-products/altered");
    }
  };

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
      style={{ width: "30vw" }}
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
      </form>
    </Dialog>
  );
};
