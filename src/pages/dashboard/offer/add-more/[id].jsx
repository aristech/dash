import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import SelectedProducts from "@/components/grid/SelectedProducts";
import ProductSearchGrid from "@/components/grid/ProductSearchGrid";
import StepHeader from "@/components/StepHeader";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useRouter } from "next/router";
import { useToast } from "@/_context/ToastContext";

const Page = ({}) => {
  const router = useRouter();
  const { selectedProducts, mtrLines } = useSelector((state) => state.products);
  const {showMessage} = useToast();


 
  const onClick = async () => {
    try {
     await axios.post("/api/singleOffer", {
        action: "addMore",
        id: id,
        mtrLines: mtrLines,
      });
      router.push("/dashboard/offer");
    } catch(e) {
      showMessage({
        severity: "error",
        summary: "Error",
        message: e.message
      })
    }
   
  };
  return (
    <AdminLayout>
      <StepHeader text="Προσθήκη Περισσότερων" />
      <ProductSearchGrid />
      {selectedProducts.length ? (
        <>
          <div className="mt-4">
            <StepHeader text="Επιλεγμένα Προϊόντα" />
          </div>
          <SelectedProducts />
          <Button 
            className="mt-2"
            label="Ολοκλήρωση" 
            onClick={onClick} 
            icon="pi pi-check" 
            />
        </>
      ) : null}
    </AdminLayout>
  );
};

export default Page;
