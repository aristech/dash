import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import axios from "axios";


export default function Page() {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const router = useRouter();
  const {  mongoKeys, newData } = useSelector((state) => state.deactivateProducts
  );

  console.log({mongoKeys})
  const [submitedData, setSubmitedData] = useState([]);

  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: message,
      detail: message,
      life: 4000,
    });
  };

  
  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: message,
      detail: message,
      life: 4000,
    });
  };



  useEffect(() => {
    if (!newData || !newData.length || !mongoKeys) {
      router.push("/dashboard/product");
      return;
    }
  }, []);



  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put("/api/deactivateUploadedProducts/update", {
        data: newData,
        mongoKeys,
      });
      console.log(data)
      if (data.success) {
        showSuccess(data.message);
        setSubmitedData(data);
      } else {
        showError(data.error);
      }
    } catch (e) {
      console.log(e.message);
      showError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toast ref={toast} />
      <DataTable
      header={() => (
        <div>
          <Button
            size="small"
            label="Αποστολή"
            icon="pi pi-save"
            className="p-button-success"
            onClick={handleSubmit}
          />
        </div>
      )}
      showGridlines
      paginator
      rows={20}
      rowsPerPageOptions={[20, 50, 100, 200, 500]}
      selectionMode="radiobutton"
      value={newData}
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column field={mongoKeys?.mappingKey?.key} header={mongoKeys?.mappingKey?.label} />
    </DataTable>
    </AdminLayout>
  );
}



