import React, {  useState } from "react";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import SelectedProducts from "@/components/grid/SelectedProducts";
import ProductSearchGrid from "@/components/grid/ProductSearchGrid";
import StepHeader from "@/components/StepHeader";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useToast } from "@/_context/ToastContext";

const Page = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { selectedProducts, mtrLines } = useSelector((state) => state.products);
  const { offerEmail } = useSelector((state) => state.impaoffer);
  const { selectedClient } = useSelector((state) => state.impaoffer);
  const user = session?.user?.user;
  const { showMessage } = useToast();


 
  const onClick = async () => {
    setLoading(true);
    try {
       await axios.post("/api/singleOffer", {
        action: "createOrder",
        data: mtrLines,
        email: offerEmail,
        name: selectedClient?.NAME,
        TRDR: selectedClient?.TRDR,
        createdFrom: user?.lastName,
      });
      router.push("/dashboard/offer");
    } catch (e) {
      showMessage({
        severity: "error",
        summary: "Error",
        message: e.message
      })
    } finally {
      setLoading(false);
    }
  };
  return (
    <AdminLayout>
      <div>
        <StepHeader text="Επιλογή Προϊόντων" />
        <ProductSearchGrid />
        {selectedProducts.length ? (
          <div className="mt-4">
            <StepHeader text="Επιλεγμένα Προϊόντα" />
            <SelectedProducts />
            <Button
              loading={loading}
              className="mt-2"
              label="Προσθήκη"
              onClick={onClick}
              icon="pi pi-plus"
            />
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Page;
