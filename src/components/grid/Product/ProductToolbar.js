import React, { useEffect, useState, useContext } from "react";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TreeSelectComp from "./TreeSelectComp";
import { Badge } from "primereact/badge";
import SelectImpas from "./SelectImpas";
import Offer from "./Offer";
import WhareHouseActions from "./WhareHouseActions";
import { ProductQuantityContext } from "@/_context/ProductGridContext";
import { useDispatch, useSelector } from "react-redux";
import { setMtrLines } from "@/features/productsSlice";
import PickingNew from "./PickingNew";
import { InputNumber } from "primereact/inputnumber";
import SmallOrders from "./SmallOrders";

//TOOLBAR STUFF THAT DISPLAYS ON THE GRID:
const ProductToolbar = () => {
  return (
    <div>
      <Toolbar className="product_toolbar" start={LeftSide} end={RightSide} />
    </div>
  );
};

//TOOLBAR RIGHT SIDE:
const RightSide = () => {
  // const {selectedProducts} = useContext(ProductQuantityContext)
  const { selectedProducts } = useSelector((state) => state.products);

  const CalculateBasket = () => {
    let total = 0;
    selectedProducts &&
      selectedProducts.forEach((item) => {
        total += parseInt(item.PRICER);
      });
    return (
      <p className="mr-3">
        Σύνολο:<span className="font-bold ml-1">{`${total},00$`}</span>{" "}
      </p>
    );
  };
  return (
    <div>
      <div className="basket-icon">
        <CalculateBasket />
        <i
          className="pi pi-shopping-cart p-overlay-badge"
          style={{ fontSize: "18px", marginRight: "10px" }}
        >
          <Badge
            value={selectedProducts == null ? "0" : selectedProducts?.length}
          ></Badge>
        </i>
      </div>
    </div>
  );
};

//TOOLBAR LEFT SIDE:
const LeftSide = () => {
  const { activeIndex, setActiveIndex, visible, setVisible } = useContext(
    ProductQuantityContext
  );

  const { selectedProducts } = useSelector((state) => state.products);
  const [showMenu, setShowMenu] = useState(false);
  const onMultipleActions = () => {
    setActiveIndex(0);
    setVisible(true);
  };

  useEffect(() => {
    setActiveIndex(0);
  }, []);

  const customIcons = (
    <React.Fragment>
      {activeIndex !== 0 ? (
        <button
          onClick={() => setActiveIndex(0)}
          className="p-sidebar-icon p-link mr-2"
        >
          <span className="pi pi-arrow-left" />
        </button>
      ) : null}
    </React.Fragment>
  );

  return (
    <>
      <Button
        icon="pi pi-shopping-cart"
        label="Καλάθι Λειτουργειών"
        className="mr-2"
        onClick={onMultipleActions}
        aria-controls="popup_menu_right"
        aria-haspopup
        severity="warning"
        disabled={
          selectedProducts == null || selectedProducts.length < 1 ? true : false
        }
      />
      <Sidebar
        visible={visible}
        position="right"
        onHide={() => setVisible(false)}
        className="md:w-6	 lg:w-5"
        icons={customIcons}
      >
        {activeIndex === 0 ? (
          <>
            <FirstScreen />
            <Button
              label="Μenu"
              icon="pi pi-bars"
              className="surface-ground text-primary w-full  mt-3"
              onClick={() => setShowMenu((prev) => !prev)}
            />
            {showMenu ? (
              <div className="mt-1 grid">
                <div className="col-12">
                  <MenuBtn
                    label="Αλλαγή κατηγοριοποίησης"
                    onClick={() => setActiveIndex(1)}
                  />
                  <MenuBtn
                    label="Αλλαγή Impa"
                    onClick={() => setActiveIndex(2)}
                  />
                  <MenuBtn label="Προσφορά" onClick={() => setActiveIndex(3)} />
                  <MenuBtn
                    label="Ποσοτική τροποποίηση αποθήκης"
                    onClick={() => setActiveIndex(4)}
                  />
                  <MenuBtn
                    label="Picking new"
                    onClick={() => setActiveIndex(5)}
                  />
                  <MenuBtn
                    label="Παραγγελία Μικρή"
                    onClick={() => setActiveIndex(6)}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}
        {activeIndex !== 0 ? (
          <SecondScreen>
            {activeIndex === 1 ? <TreeSelectComp /> : null}
            {activeIndex === 2 ? <SelectImpas /> : null}
            {activeIndex === 3 ? <Offer /> : null}
            {activeIndex === 4 ? <WhareHouseActions /> : null}
            {activeIndex === 5 ? <PickingNew /> : null}
            {activeIndex === 6 ? <SmallOrders /> : null}
          </SecondScreen>
        ) : null}
      </Sidebar>
    </>
  );
};

//FIRST SCREEN OF THE
const FirstScreen = () => {
  // const {selectedProducts} = useContext(ProductQuantityContext)
  const { selectedProducts } = useSelector((state) => state.products);
  const CalculateBasket = () => {
    let total = 0;
    selectedProducts &&
      selectedProducts.forEach((item) => {
        total += parseInt(item.PRICER);
      });
    return (
      <p className="mr-3 ml-1">
        <span className="font-normal">Σύνολο:</span> {`${total},00$`}
      </p>
    );
  };

  const footer = () => {
    return (
      <div className="flex justify-between p-2">
        <p className="mr-3 ">
          <span className="font-normal">Προϊόντα:</span>{" "}
          {`${selectedProducts !== null ? selectedProducts.length : 0}`}
        </p>
        <CalculateBasket />
      </div>
    );
  };

  const Basket = ({ NAME, CATEGORY_NAME, PRICER, MTRL }) => {
    return (
      <ProductBaksetTemplate
        name={NAME}
        categoryName={CATEGORY_NAME}
        PRICER={PRICER}
        MTRL={MTRL}
      />
    );
  };

  return (
    <>
      <div className="flex align-items-center mb-2 mt-2">
        <h2>Επεξεργασία:</h2>
      </div>
      <div className="box">
        <DataTable
          className="border-1 border-round-sm	border-50 w-full"
          size="small"
          scrollHeight="350px"
          scrollable
          value={selectedProducts}
          footer={footer}
        >
          <Column field="Προϊόν" header="Προϊόν" body={Basket}></Column>
        </DataTable>
      </div>
    </>
  );
};

const SecondScreen = ({ children }) => {
  return <div>{children}</div>;
};

const MenuBtn = ({ label, onClick }) => {
  return (
    <Button
      onClick={onClick}
      style={{ textAlign: "left" }}
      icon="pi pi-arrow-right"
      className="surface-ground text-primary w-full mb-1"
      label={label}
      severity="warning"
    />
  );
};

const ProductBaksetTemplate = ({ name, categoryName, PRICER, MTRL }) => {
  const [total, setTotal] = useState(PRICER);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMtrLines({ MTRL: MTRL, QTY1: quantity }));
  }, [quantity]);

  useEffect(() => {
    setTotal(parseInt(PRICER) * quantity);
  }, [quantity, PRICER]);
  return (
    <div className="flex align-items-center justify-content-between">
      <div>
        <div>
          <p className="text-md text-900 font-semibold">{name}</p>
        </div>
        <div className="flex align-items-center">
          <i
            className="pi pi-tag"
            style={{ fontSize: "12px", marginRight: "3px", marginTop: "2px" }}
          ></i>
          <p className="text-xs">{categoryName}</p>
        </div>
        <span className="text-xs ml-1">TIMH:</span>
        <span className="text-xs ml-2">{total},00$</span>
      </div>
      <div className="flex">
        <div className="w-10rem">
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
        </div>
      </div>
    </div>
  );
};



export default ProductToolbar;
