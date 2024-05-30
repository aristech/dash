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
import { sub } from "date-fns";

export default function Page() {
  const [loading, setLoading] = useState(false);
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

  console.log({ mongoKeys });
  console.log({newData})
  console.log({submitedData})

  useEffect(() => {
    if (!newData || !newData.length) {
      router.push("/dashboard/product");
      return;
    }
  }, []);

  useEffect(() => {
    console.log(submitedData);
  }, [submitedData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.put("/api/butchImages/update", {
        data: newData,
      });
      if (data.success) {
        showSuccess(data.message);
        setSubmitedData(data.result);
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
      {submitedData.length === 0 ? (
        <ViewTable
          handleSubmit={handleSubmit}
          mongoKeys={mongoKeys}
          data={newData}
        />
      ) : (
        <SubmitTable data={submitedData} />
      )}
    </AdminLayout>
  );
}

const ViewTable = ({ handleSubmit, mongoKeys, data }) => {
  return (
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
      value={data}
      tableStyle={{ minWidth: "50rem" }}
    >
      {mongoKeys.map((key) => {
        return <Column key={key.value} field={key.value} header={key.label} />;
      })}
    </DataTable>
  );
};

const SubmitTable = ({ data }) => {
  const router = useRouter();
  return (
    <DataTable
      paginator
      header={() => (
        <div className="flex justify-content-between">
          <Button
            size="small"
            label="Eπιστροφή"
            icon="pi pi-arrow-left"
            className="p-button-secondary"
            onClick={() => router.push("/dashboard/product")}
          />
          <div>

          </div>
        </div>
      )}
      value={data}
      rows={20}
      showGridlines
      rowsPerPageOptions={[20, 50, 100, 200, 500]}
      selectionMode="radiobutton"
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column field={"NAME"} header={"Όνομα"} />
      <Column field={"code"} header={"Κωδικός"} />
      <Column field={"imageName"} header={"Όνομα Φωτογραφίας"} />
      <Column
        style={{ width: "100px" }}
        field={"success"}
        header={"Kατάσταση"}
        body={StatusTemplate}
      />
    </DataTable>
  );
};

const StatusTemplate = ({ success }) => {
  return (
    <div className="">
      <span
        className={`p-badge ${success ? " p-badge-success" : "p-badge-error"}`}
      >
        {success ? "Επιτυχία" : "Αποτυχία"}
      </span>
    </div>
  );
};
