"use client";
import React, { useState, useEffect, use } from "react";
import { Column } from "primereact/column";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { setMtrLines, deleteSelectedProduct } from "@/features/productsSlice";
import { InputNumber } from "primereact/inputnumber";

const SelectedProducts = () => {
  const { selectedProducts, mtrLines } = useSelector((state) => state.products);
  const [length, setLength] = useState(selectedProducts.length);
  useEffect(() => {
    setLength(selectedProducts.length);
  }, [selectedProducts]);

  return (
    <>
      <DataTable
        paginator
        rows={5}
        totalRecords={length}
        rowsPerPageOptions={[5, 10, 20, 50, 100, 200]}
        value={selectedProducts}
        className="p-datatable-sm border-1 border-round-sm	border-50"
        showGridlines
      >
        <Column header="Προσφορά" body={itemTemplate}></Column>
        <Column style={{ width: "70px" }} body={CalculateTemplate}></Column>
        <Column style={{ width: "30px" }} body={RemoveTemplate}></Column>
      </DataTable>
    </>
  );
};

const CalculateTemplate = (item) => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const { mtrLines, selectedProducts } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(setMtrLines({ MTRL: item.MTRL, QTY1: quantity }));
  }, [quantity]);

  return (
    <InputNumber
      value={quantity}
      size="small"
      min={1}
      onValueChange={(e) => setQuantity(e.value)}
      showButtons
      buttonLayout="horizontal"
      decrementButtonClassName="p-button-secondary"
      incrementButtonClassName="p-button-secondary"
      incrementButtonIcon="pi pi-plus"
      decrementButtonIcon="pi pi-minus"
      inputStyle={{ width: "70px", textAlign: "center" }}
    />
  );
};

const RemoveTemplate = (item) => {
  const dispatch = useDispatch();
  return (
    <div className="flex flex-wrap p-2 align-items-center gap-3">
      <i
        className="pi pi-trash text-red-400"
        onClick={() =>
          dispatch(
            deleteSelectedProduct({
              id: item._id,
              name: item.NAME,
            })
          )
        }
      ></i>
    </div>
  );
};

const itemTemplate = (item) => {
  return (
    <div className="flex flex-wrap p-2 align-items-center gap-3">
      <div className="flex-1 flex flex-column gap-2">
        <span className="font-bold">{item.NAME}</span>
        <div className="flex align-items-center gap-2">
          <i className="pi pi-tag text-sm"></i>
          <span>{item.CODE}</span>
          <div>
            <span>Τιμή:</span>
            <span className="font-bold text-primary ml-1">{item.PRICER}€</span>
          </div>
          <div>
            <span>Κόστος:</span>
            <span className="font-bold text-primary ml-1">{item.COST}€</span>
          </div>
        </div>
      </div>
      {/* <span className="font-bold text-900">${item.PRICER}</span> */}
    </div>
  );
};

export default SelectedProducts;
