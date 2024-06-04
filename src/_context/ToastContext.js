import { useContext, createContext, useRef } from "react";
import { Toast } from "primereact/toast";
//CREATE TOAST CONTAINER:
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const toast = useRef(null);

  const showMessage = ({severity, summary, message} ) => {
    toast.current.show({
      severity: severity,
      summary: summary,
      detail: message,
      life: 4000,
    });
  };

  return (
    <ToastContext.Provider value={{ showMessage }}>
      <Toast ref={toast} />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};
