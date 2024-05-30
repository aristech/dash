import React, { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { setGridData, setNewData } from "@/features/catalogSlice";


export default function Page() {
  const toast = useRef(null);
  const router = useRouter();
  const { gridData, mongoKeys, newData } = useSelector(
    (state) => state.uploadImages
  );

  
  const [submitedData, setSubmitedData] = useState([]);

  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: message,
      detail: message,
      life: 4000,
    });
  };

  const showWarn = (message) => {
    toast.current.show({
      severity: "warn",
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
        if (!newData || !newData.length) {
            router.push("/dashboard/product");
            return;
        }
    }, [])


  const handleSubmit = async () => {
        try {
            const { data } = await axios.put("/api/butchImages/update", {
                data: newData,
              });
              console.log({data})
              if (data.success) {
                showSuccess(data.message);
                setSubmitedData(data.result);
              } else {
                showError(data.error);
              }
        } catch (e) {
            console.log(e.message);
            showError(e.message);
            return;
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
        paginator
        editMode="cell"
        rows={10}
        rowsPerPageOptions={[20, 50, 100, 200, 500]}
        selectionMode="radiobutton"
        value={submitedData.length ? submitedData : newData}
        tableStyle={{ minWidth: "50rem" }}
      >
        {mongoKeys.map((key) => {
          return (
            <Column 
                // editor={textEditor}
                // onCellEditComplete={onCellEditComplete} 
                key={key.value} 
                field={key.value} 
                header={key.label} 
            />
          );
        })}
        
      </DataTable>
    </AdminLayout>
  );
}
