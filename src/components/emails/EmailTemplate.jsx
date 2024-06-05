"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Input from "../Forms/PrimeInput";
import { useToast } from "@/_context/ToastContext";
import { Chips } from "primereact/chips";
import { TextAreaInput } from "@/components/Forms/PrimeInput";
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Εισάγετε ένα έγκυρο email")
    .required("Το email είναι υποχρεωτικό"),
});

const EmailTemplate = ({
  email,
  disabled = false,
  subject,
  fileName,
  message,
  handleSend,
}) => {
  const [visible, setVisible] = useState(false);
  const { showMessage } = useToast();
  const [loading, setLoading] = useState(false);
  const DEFAULT_VALUES = {
    cc: ["administrators@kolleris.com"],
    email: email,
    subject: subject,
    fileName: fileName,
    message: message,
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue,
  } = methods;
  const values = methods.watch();

  useEffect(() => {
    reset(DEFAULT_VALUES);
  }, []);

  const handleFinalSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await handleSend(data);
      console.log({res});
      if(res.status) {
        showMessage({
          severity: "success",
          summary: "Επιτυχία",
          message: res.message,
        });
      } else {
        showMessage({
          severity: "error",
          summary: "Σφάλμα",
          message: res.message,
        });
      }
     
    } catch (error) {
      showMessage({
        severity: "error",
        summary: "Σφάλμα",
        message: error.message,
      });
    } finally {
      setVisible(false);
      setLoading(false);
    }
  };

  const productDialogFooter = (
    <React.Fragment>
      <Button
        size="small"
        label="Ακύρωση"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setVisible(false)}
      />
      <Button

        size="small"
        loading={loading}
        label="Αποστολή"
        icon="pi pi-envelope"
        severity="info"
        onClick={handleSubmit(handleFinalSubmit)}
      />
    </React.Fragment>
  );

  const handleChips = (e) => {
    setValue("cc", e.value);
  };
  return (
    <div>
      <Button
        disabled={disabled}
        className={`w-full`}
        label="Δημιουργία Εmail"
        icon="pi pi-envelope"
        onClick={() => setVisible(true)}
      />
      <Dialog
        header="Εmail Template"
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: "30vw", minWidth: "30rem" }}
        footer={productDialogFooter}
      >
        <form
          onSubmit={handleSubmit(handleFinalSubmit)}
          noValidate
          className="form"
        >
          <Input
            label={"Προς:"}
            name={"email"}
            control={control}
            required
            error={errors.email}
          />
          <div className="card p-fluid">
            <label htmlFor={"cc"} className={`custom_label`}>
              Κοινοποίηση σε:
            </label>
            <Chips value={values.cc} onChange={handleChips} />
          </div>
          <TextAreaInput
            label={"Προσθήκη Θέματος:"}
            name={"subject"}
            rows={5}
            control={methods.control}
            required
          />
          <TextAreaInput
            label={"Kείμενο:"}
            name={"message"}
            rows={5}
            control={methods.control}
            required
          />
          <Input
            label={"Όνομα Αρχείου:"}
            name={"fileName"}
            control={control}
            required
          />
        </form>
      </Dialog>
    </div>
  );
};

export default EmailTemplate;
