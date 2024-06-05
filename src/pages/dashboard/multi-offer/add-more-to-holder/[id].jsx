"use client";
import React from "react";
import StepHeader from "@/components/StepHeader";
import ProductSearchGrid from "@/components/grid/ProductSearchGrid";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { useRouter } from "next/router";
import SelectedProducts from "@/components/grid/SelectedProducts";
import axios from "axios";
import { useToast } from "@/_context/ToastContext";

const Page = () => {
  const router = useRouter();
  const { selectedProducts, mtrLines } = useSelector((state) => state.products);
  const { id } = router.query;
  const { showMessage } = useToast();


  const onComplete = async (e) => {
    try {
      const { data } = await axios.post("/api/createOffer", {
        action: "addMoreToHolder",
        products: mtrLines,
        holderId: id,
      });
      if (data.existing.length > 0) {
        for (let item of data.existing) {
          showMessage({
            severity: "info",
            summary: "Info",
            message: `Το προϊόν  ---- ${item} ---- υπάρχει ήδη στον holder`,
          })
        }
      } else {
        router.push("/dashboard/multi-offer");
      }
    } catch (e) {
        showMessage({
            severity: "error",
            summary: "Error",
            message: e.message,
        })
    }
  };

  return (
    <AdminLayout>
      <Button
        label="Πίσω"
        icon="pi pi-angle-left"
        className="mb-5"
        onClick={() => router.back()}
      />
      <StepHeader text={"Επιλογή Προϊότων "} />
      <ProductSearchGrid />
      <div className="col-12 mt-6">
        {selectedProducts.length ? (
          <div>
            <StepHeader text={`Συνολο Προϊόντων`} />
            <SelectedProducts />
            <Button label="Προσθήκη" onClick={onComplete} icon="pi pi-plus" />
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Page;
