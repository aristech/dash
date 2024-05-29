import React from "react";
import { Controller } from "react-hook-form";
import { classNames } from "primereact/utils";
import { InputNumber } from "primereact/inputnumber";

const PrimeInputNumber = ({
  label,
  name,
  control,
  required,
  error,
  type,
  disabled,
  mode = "decimal",
  prefix,
  maxFractionDigits = 0,
  minFractionDigits = 0,

}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="w-full">
          <label
            htmlFor={name}
            className={`custom_label ${error && "text-red-600"}`}
          >
            {label} {required && <span className="required">*</span>}
          </label>
          <span>
            <InputNumber
              name={name}
              maxFractionDigits={maxFractionDigits}
              minFractionDigits={minFractionDigits}
                mode={mode}
                prefix={prefix}
                type={type}
              
              id={field.name}
              value={field.value}
              disabled={disabled}
              className={`custom_input ${classNames({ "p-invalid": fieldState.error })}`}
              onValueChange={(e) => field.onChange(e)}
            />
          </span>
          <div className="error-div">
            {error && <span className="text-red-600">{error.message}</span>}
          </div>
        </div>
      )}
    />
  );
};

export default PrimeInputNumber;
