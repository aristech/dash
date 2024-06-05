import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useToast } from "@/_context/ToastContext";


export default function Page() {
  const [loading, setLoading] = useState(false);
  const [submitedData, setSubmitedData] = useState(null);

  const toast = useRef(null);
  const {showMessage} = useToast()
  const router = useRouter();
  const {  mongoKeys, newData } = useSelector((state) => state.deactivateProducts
  );

  console.log({newData})

 
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
      console.log({data})
      if (data.success) {
        showMessage({
          severity: "success",
          summary: "Επιτυχία",
          message: "Η αποστολή ολοκληρώθηκε",
        })
        setSubmitedData(data.result);
      } else {
        showMessage({
          severity: "error",
          summary: "Aποτυχία",
          message: "Η αποστολή ολοκληρώθηκε με σφάλματα",
        })
      }
    } catch (e) {
      showMessage({
        severity: "error",
        summary: "Aποτυχία",
        message: e.message,
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toast ref={toast} />
      {!submitedData ? (
        <DeactivateTable 
          data={newData} 
          mongoKeys={mongoKeys}
          handleSubmit={handleSubmit} 
        />
      ) : (
        <SubmitedTable  data={submitedData} loading={loading}/>
      )}
    </AdminLayout>
  );
}


const DeactivateTable = ({data, mongoKeys, handleSubmit, loading}) => {

    return (
      <DataTable
      header={() => (
        <div>
          <Button
            size="small"
            label="Απενεργοποίηση Προϊόντων"
            icon="pi pi-save"
            className="p-button-danger"
            onClick={handleSubmit}
          />
        </div>
      )}
      showGridlines
      loding={loading}
      paginator
      rows={20}
      rowsPerPageOptions={[20, 50, 100, 200, 500]}
      value={data}
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column field={mongoKeys?.mappingKey?.key} header={mongoKeys?.mappingKey?.label} />
    </DataTable>
    )
}

const SubmitedTable = ({data}) => {
  const router = useRouter();
  return (
    <DataTable
      header={() => (
        <Button
        size="small"
        label="Επιστροφή στα Προϊόντα"
        icon="pi pi-arrow-left"
        onClick={() => router.push('/dashboard/product')}
      />
      
      )}
      showGridlines
      paginator
      rows={20}
      rowsPerPageOptions={[20, 50, 100, 200, 500]}
      value={data}
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column field="MTRL" header="MTRL" />
      <Column field="name" header="Όνομα" />
      <Column field="success" header="Επιτυχία" />
      <Column field="deleted" header="Kατάσταση Διαγραφής" />
      <Column field="error" header="Σφάλμα" />
      <Column field="message" header="Μήνυμα" />
      <Column field="imagesDeleted" header="Διαγραφή Φωτογραφιών" />
    </DataTable>
  );
}


