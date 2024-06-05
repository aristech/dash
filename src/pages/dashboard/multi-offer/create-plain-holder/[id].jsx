"use client";
import React, { useEffect } from "react";
import StepHeader from "@/components/StepHeader";
import ProductSearchGrid from "@/components/grid/ProductSearchGrid";
import AdminLayout from "@/layouts/Admin/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useRouter } from "next/router";
import SelectedProducts from "@/components/grid/SelectedProducts";
import { setPlainHolderName } from "@/features/impaofferSlice";
import axios from "axios";
import { useToast } from "@/_context/ToastContext";

const PlainHolder = () => {
  const dispatch = useDispatch();
  const {showMessage} = useToast()
  const { plainHolderName } = useSelector((state) => state.impaoffer);
  const router = useRouter();
  const { id } = router.query;

  const onChange = (e) => {
    dispatch(setPlainHolderName(e.target.value));
  };

  useEffect(() => {
    dispatch(setPlainHolderName(""));
  }, []);

  return (
    <AdminLayout>
      <Button
        label="Πίσω"
        icon="pi pi-angle-left"
        className="mb-5"
        onClick={() => router.back()}
      />
      <StepHeader text={"Ονομα Holder"} />
      <div className="w-20rem mb-3 mt-2 flex">
        <InputText
          className="w-full"
          value={plainHolderName}
          onChange={onChange}
          placeholder="Δώστε ένα όνομα στον Holder"
        />
        <Button
          className="ml-2"
          icon={plainHolderName !== "" ? "pi pi-check" : "pi pi-times"}
          severity={plainHolderName !== "" ? "success" : "danger"}
        />
      </div>
      {plainHolderName ? (
        <Continue name={plainHolderName} holderId={id} />
      ) : null}
    </AdminLayout>
  );
};

const Continue = ({ name, holderId }) => {
    const [loading, setLoading] = useState(false)
  const { selectedProducts, mtrLines } = useSelector((state) => state.products);
  const router = useRouter();

  const onHolderCompletions = async () => {
    try {
        setLoading(true)
        await axios.post("/api/createOffer", {
            action: "createHolder",
            name: name,
            products: mtrLines,
            holderId: holderId,
          });
          router.push("/dashboard/multi-offer");
    } catch(e) {
        showMessage({
            severity: "error",
            summary: "Error",
            message: e.message
          })
    } finally {
        setLoading(false)
    }
   
  };
  return (
    <>
      <StepHeader text={"Eπιλογή Προϊότων"} />
      <ProductSearchGrid />
      <div className="col-12 mt-6">
        {selectedProducts.length ? (
          <div>
            <StepHeader text={`Συνολο Προϊόντων`} />
            <SelectedProducts />
            <Button
                loading={loading}
              className="mt-2"
              label="Προσθήκη"
              onClick={onHolderCompletions}
              icon="pi pi-plus"
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
export default PlainHolder;
