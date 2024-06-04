import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useSelector } from "react-redux";
import axios from "axios";
import StepHeader from "@/components/StepHeader";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useRouter } from "next/router";
import Link from "next/link";
import { Dialog } from "primereact/dialog";
import { useToast } from "@/_context/ToastContext";

const CatalogResults = () => {
  const [returnedProducts, setReturnedProducts] = useState(null);
  const { attributes, mongoKeys, newData } = useSelector(
    (state) => state.catalog
  );

  console.log({ returnedProducts });
  const [visible, setVisible] = useState(false);

  const footerContent = (
    <div>
      <Button
        label="Ακύρωση"
        icon="pi pi-times"
        onClick={() => setVisible(false)}
        className="p-button-text"
      />
    </div>
  );
  return (
    <AdminLayout>
      <StepHeader text="Τελική μορφή Αρχείου" />
      <Link
        href="#"
        className="text-blue-500 cursor-pointer my-2 underline inline-block"
        onClick={(e) => {
          setVisible(true);
        }}
      >
        Δείτε την αντιστοίχιση των κλειδιών
      </Link>
      <Dialog
        visible={visible}
        modal
        header={"Κλειδιά"}
        footer={footerContent}
        style={{ width: "25rem", height: "25rem", overflow: "auto" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div className="mb-6">
          <h3 className="text-lg">Custom Attributes:</h3>
          {attributes.map((attribute, index) => {
            return (
              <div className="my-3" key={index}>
                <p className="text-sm">
                  Αρχικό Κλειδί: <strong>{attribute.oldKey}</strong>
                </p>
                <p className="text-sm mt-1">
                  Τελικό Κλειδί: <strong>{attribute.name}</strong>
                </p>
                {index !== attributes.length - 1 && (
                  <div className="seperator"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="my-2">
          <h3 className="text-lg">Συσχετισμένα Κλειδία:</h3>
          {mongoKeys.map((key, index) => {
            return (
              <div className="my-2" key={index}>
                <p className="text-sm">
                  Αρχικό Κλειδί: <strong>{key.header}</strong>
                </p>
                <p className="text-sm mt-1">
                  Τελικό Κλειδί: <strong>{key.related}</strong>
                </p>
                {index !== key.length - 1 && <div className="seperator"></div>}
              </div>
            );
          })}
        </div>
      </Dialog>
      {!returnedProducts ? (
        <Table
          setReturnedProducts={setReturnedProducts}
          returnedProducts={returnedProducts}
          mongoKeys={mongoKeys}
          attributes={attributes}
          data={newData}
        />
      ) : (
        <ResultTable data={returnedProducts} />
      )}
    </AdminLayout>
  );
};

const Table = ({ data, mongoKeys, attributes, setReturnedProducts }) => {
  const [loading, setLoading] = useState(false);
  const { selectedSupplier } = useSelector((state) => state.supplierOrder);
  const name = selectedSupplier?.NAME;
  const trdr = selectedSupplier?.TRDR;
  const { showMessage } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/catalogs/submit-data", {
        data: data,
        SUPPLIER_NAME: name,
        SUPPLIER_TRDR: trdr,
      });
      setReturnedProducts(res.data);
      showMessage("success", "Τα δεδομένα αποστάλθηκαν επιτυχώς", "Επιτυχία");
      console.log(res.data);
    } catch (e) {
      showMessage("error", e.message, "Σφάλμα");
    } finally {
      setLoading(false);
    }
  };

  const attributeColumns = () => {
    const attributeKeys = attributes.map((attr) => attr.name);
    return attributeKeys.map((key) => (
      <Column
        key={key}
        field={key}
        header={key}
        body={(rowData) => {
          const attribute = rowData.ATTRIBUTES.find(
            (attr) => attr.label === key
          );
          return attribute ? attribute.value : "";
        }}
      />
    ));
  };
  return (
    <>
      <DataTable
        loading={loading}
        key={Math.random()}
        showGridlines
        paginator
        rows={20}
        rowsPerPageOptions={[20, 50, 100, 200]}
        value={data}
        tableStyle={{ minWidth: "50rem" }}
      >
        {mongoKeys.map((key) => {
          if (key.related === 0) return;
          return (
            <Column key={key.related} field={key.related} header={key.header} />
          );
        })}
        {attributeColumns()}
      </DataTable>

      <div className="mt-3">
        <Button
          loading={loading}
          label="Αποστολή"
          className="ml-2"
          onClick={handleSubmit}
        />
      </div>
    </>
  );
};

const ResultTable = ({ data }) => {
  if (!data) return;
  return (
    <>
      <div>
        <div className="upload_product_result">
          <span>Σύνολο Προϊόντων: </span>
          <span className="font-bold">{`${data.system_data.length}`}</span>
        </div>
        <div className="upload_product_result">
          <span>Δημιουργήθηκαν στο σύστημα: </span>
          <span className="font-bold">{`${data.create_system} / ${data.should_create}`}</span>
        </div>
        <div className="upload_product_result">
          <span>Τροποποιήθηκαν στο σύστημα: </span>
          <span className="font-bold">{`${data.update_system} / ${data.should_update_system}`}</span>
        </div>
        <div className="upload_product_result mb-4">
          <span>Τροποποιήθηκαν στο SOFTONE: </span>
          <span className="font-bold">{`${data.should_update_softone} / ${data.should_update_softone}`}</span>
        </div>
      </div>
      <DataTable
        value={data?.system_data}
        paginator
        rows={20}
        rowsPerPageOptions={[20, 50, 100, 200]}
        tableStyle={{ minWidth: "50rem" }}
        showGridlines
      >
        <Column field="MTRL" header="MTRL" />
        <Column field="code" header="Κωδικός" />
        <Column field="name" header="Όνομα" />
        <Column field="status" header="Αποστολή Για:" />
        <Column field="success" header="Κατάσταση Συστήματος" body={StatusBody} />
        <Column field="softone" header="Τροποποίηση Softone" body={SoftoneStatusBody} />
        <Column field="message" header="Μήνυμα" />
      </DataTable>
    </>
  );
};

const StatusBody = ({ success }) => {
  return (
    <>
      <div
        className={`uploaded_status ${
          success ? "uploaded_success" : "uploaded_error"
        }`}
      >
        <i className={success ? "pi pi-check" : "pi pi-times"} />
      </div>
    </>
  );
};

const SoftoneStatusBody = ({ softone }) => {
  return (
    <>
      {softone ==="updated" ? (
        <div className={`uploaded_status uploaded_success`}>
          <i className={"pi pi-check"} />
        </div>
      ) : null}
    </>
  );
};
export default CatalogResults;
