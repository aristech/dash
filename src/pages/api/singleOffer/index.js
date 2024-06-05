import translateData from "@/utils/translateDataIconv";
import connectMongo from "../../../../server/config";
import Clients from "../../../../server/models/modelClients";
import SingleOffer from "../../../../server/models/singleOfferModel";
import { sendEmail } from "@/utils/offersEmailConfig";
import createCSVfile from "@/utils/createCSVfile";
import Offer from "@/components/grid/Product/Offer";
import { mn } from "date-fns/locale";
import Holders from "../../../../server/models/holderModel";

export default async function handler(req, res) {
  const action = req.body.action;
  if (action === "createOrder") {
    const { data, email, name, TRDR, createdFrom } = req.body;
    const mtrlArr = data.map((item) => {
      const MTRL = parseInt(item.MTRL);
      const QTY1 = parseInt(item.QTY1);
      return { MTRL, QTY1 };
    });

    let total = data.reduce((a, b) => a + b["PRICE"], 0);

    try {
      let create = await SingleOffer.create({
        products: data,
        status: "created",
        TRDR: TRDR,
        clientName: name,
        clientEmail: email,
        createdFrom: createdFrom,
        totalPrice: total,
        discountedTotal: total,
        discount: 0,
      });

      await Clients.updateOne(
        { TRDR: TRDR },
        {
          $set: {
            OFFERSTATUS: true,
          },
        }
      );
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  if (action === "findOffers") {
    const { clientName } = req.body;
    try {
      await connectMongo();
      let find;
      if (
        clientName !== "" ||
        clientName !== null ||
        clientName !== undefined
      ) {
        find = await SingleOffer.find({ clientName: clientName });
      }
      if (
        clientName === undefined ||
        clientName === null ||
        clientName === ""
      ) {
        find = await SingleOffer.find().sort({ createdAt: -1 });
      }
      return res.status(200).json({ success: true, result: find });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  if (action === "findOfferProducts") {
    const { id } = req.body;
    try {
      await connectMongo();
      // let newsum =  await calculateTotal(id)
      let find = await SingleOffer.findOne(
        { _id: id },
        { products: 1, _id: 1, totalPrice: 1, discountedTotal: 1, discount: 1 }
      );
      return res.status(200).json({ success: true, result: find });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  if (action === "sendEmail") {
    const { formData, products, id } = req.body;
    const { email, subject, cc, message, fileName } = formData;

    try {
      const csv = await createCSVfile(products);
      //SEND EMAIL PARAMS email ,cc, subject, message, fileName, file
      let send = await sendEmail(email, cc, subject, message, fileName, csv);
      if (send.status) {
        await SingleOffer.updateOne(
          { _id: id },
          {
            $set: {
              status: "sent",
            },
          }
        );
      }
      return res.status(200).json({ success: true, message: send.message });
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }

  if (action === "deleteOffer") {
    const { id, TRDR } = req.body;
    //client shcema has a boolean field OFFERSTATUS, if there are no offers or holders, OFFERSTATUS is set to false
    try {
      let del = await SingleOffer.deleteOne({ _id: id });
      let offers = await SingleOffer.find({ TRDR: TRDR });
      let holders = await Holders.find({ TRDR: TRDR });

      if (offers.length === 0 && holders.length === 0) {
        await Clients.updateOne(
          { TRDR: TRDR },
          {
            $set: {
              OFFERSTATUS: false,
            },
          }
        );
      }
      return res.status(200).json({ success: true, result: del });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  if (action === "removeProduct") {
    const { id, mtrl } = req.body;
    console.log(id, mtrl);
    try {
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id },
        {
          $pull: {
            products: { MTRL: mtrl.toString() },
          },
        },
        { new: true }
      );
      console.log("remove product");
      console.log(update);
      return res.status(200).json({ success: true, result: update });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  //Alter the quantity of the products and the totalPrices
  if (action === "updateQuantity") {
    const { id, MTRL, QTY1 } = req.body;

    await connectMongo();
    try {
      let find = await SingleOffer.findOne({ _id: id, "products.MTRL": MTRL });
      console.log("find");

      let product = find.products.find((item) => item.MTRL === MTRL);
      let PRICE = product.DISCOUNTED_PRICE
        ? product.DISCOUNTED_PRICE
        : product.PRICE;
      console.log("PRICE");
      console.log(PRICE);
      let TOTAL_PRICE = PRICE * QTY1;
      console.log(TOTAL_PRICE);

      let update = await SingleOffer.findOneAndUpdate(
        { _id: id, "products.MTRL": MTRL },
        {
          $set: {
            "products.$.QTY1": QTY1,
            "products.$.TOTAL_PRICE": TOTAL_PRICE.toFixed(2),
          },
        },
        { new: true }
      );
      console.log("update qantity");
      console.log(update);

      return res.status(200).json({ success: true, result: update });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }
  //update the price of a single mtrl item in the offer
  if (action === "updateDiscount") {
    const { id, discount, TRDR, MTRL, PRICE, QTY1 } = req.body;
    const mtrLines = [
      {
        MTRL: MTRL,
        QTY1: QTY1,
        PRICE: PRICE,
      },
    ];

    await connectMongo();
    try {
      // let discountSoftone = await getNewSalesDoc(TRDR, mtrLines, discount)
      // console.log('discountSoftone')
      // console.log(discountSoftone)
      // if(!discountSoftone.success) {
      //     return res.status(200).json({ success: false, error: "softone saldocnum error" })
      // }

      let _discount = discount / 100;
      let _discounted_price = PRICE - PRICE * _discount;
      let _newTotal = _discounted_price * QTY1;
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id, "products.MTRL": MTRL },
        {
          $set: {
            "products.$.DISCOUNT": discount,
            "products.$.TOTAL_PRICE": _newTotal.toFixed(2),
            "products.$.DISCOUNTED_PRICE": _discounted_price.toFixed(2),
          },
        },
        { new: true }
      );

      return res.status(200).json({ success: true, result: true });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
    // return res.status(200).json({ success: true })
  }

  //update the price of all mtrl lines
  if (action === "updateDiscountTotal") {
    const { id, discount, TRDR } = req.body;
    await connectMongo();

    try {
      let offer = await SingleOffer.findOne({ _id: id });
      console.log(offer);
      const mtrLines = offer.products.map((item) => {
        const MTRL = parseInt(item.MTRL);
        const QTY1 = parseInt(item.QTY1);
        const PRICE = item.DISCOUNTED_PRICE
          ? item.DISCOUNTED_PRICE
          : item.PRICE;
        return { MTRL, QTY1, PRICE };
      });
      // let discountSoftone = await getNewSalesDoc(TRDR, mtrLines, discount)
      // console.log('discountSoftone')
      // console.log(discountSoftone)
      // if(!discountSoftone.success) {
      //     return res.status(200).json({ success: false, error: "softone saldocnum error" })
      // }

      let discountedTotal =
        offer.totalPrice - offer.totalPrice * (discount / 100);
      console.log("discountedTotal");
      console.log(discountedTotal);
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            discount: discount,
            discountedTotal: discountedTotal.toFixed(2),
          },
        },
        { new: true }
      );

      return res.status(200).json({ success: true, result: true });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
    // return res.status(200).json({ success: true })
  }

  if (action === "calculateTotal") {
    const { id } = req.body;
    await connectMongo();
    let find = await SingleOffer.findOne({ _id: id });
    let totalPrice = 0;
    for (let item of find.products) {
      let _price = item.DISCOUNTED_PRICE ? item.DISCOUNTED_PRICE : item.PRICE;
      totalPrice += _price * item.QTY1;
    }
    let discountedPrice = totalPrice;
    if (find.discount) {
      discountedPrice = totalPrice - totalPrice * (find.discount / 100);
    }

    try {
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            totalPrice: totalPrice.toFixed(2),
            discountedTotal: discountedPrice.toFixed(2),
          },
        },
        { new: true }
      );
      return res.status(200).json({ success: true, result: update });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }

  if (action === "createFinDoc") {
    const { id, TRDR } = req.body;
    await connectMongo();
    try {
      let offer = await SingleOffer.findOne({ _id: id });
      const mtrLines = offer.products.map((item) => {
        const MTRL = parseInt(item.MTRL);
        const QTY1 = parseInt(item.QTY1);
        const PRICE = item.DISCOUNTED_PRICE
          ? item.DISCOUNTED_PRICE
          : item.PRICE;
        const DISC1PRC = item.DISCOUNT ? item.DISCOUNT : 0;
        return { MTRL, QTY1, PRICE, DISC1PRC };
      });

      let saldoc = await getNewSalesDoc(TRDR, mtrLines, offer.discount);
      let finDoc = await getFinDoc(saldoc.SALDOCNUM);

      if (!finDoc.success) {
        return res
          .status(200)
          .json({ success: false, error: "softone findoc error" });
      }
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            SALDOCNUM: saldoc.SALDOCNUM,
            FINCODE: finDoc.result[0].FINCODE,
          },
        },
        { new: true }
      );

      return res.status(200).json({ success: true, result: true });
    } catch (e) {
      return res.status(400).json({ success: false });
    }
  }
  if (action === "addMore") {
    const { id, mtrLines } = req.body;
    try {
      await connectMongo();

      const _products = [];
      const _existing = [];
      await connectMongo();
      let find = await SingleOffer.findOne(
        { _id: id },
        { products: 1, _id: 0 }
      );
      let existingProducts = find.products;
  
      mtrLines.filter((product) => {
        let found = existingProducts.find((item) => item.MTRL === product.MTRL);
        if (!found) {
          _products.push(product);
        } else {
          _existing.push(product.NAME);
        }
      });
    
      let update = await SingleOffer.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            products: _products,
          },
        },
        { new: true }
      );
   
      return res.status(200).json({ success: true, result: update });
    } catch (e) {}
    // console.log(id, mtrLines)
    return res.status(200).json({ success: true });
  }
}

async function getNewSalesDoc(TRDR, MTRLINES, totalDiscount) {
  let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.parastatika/newSalesDoc`;
  const response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      username: "Service",
      password: "Service",
      COMPANY: 1001,
      SERIES: 7021,
      PAYMENT: 1012,
      TRDR: TRDR,
      SOCARRIER: 238,
      DISC1PRC: totalDiscount,
      MTRLINES: MTRLINES,
    }),
  });

  let responseJSON = await response.json();
  console.log(responseJSON);
  return responseJSON;
}

export async function getFinDoc(saldoc) {
  let URL = `${process.env.NEXT_PUBLIC_SOFTONE_URL}/JS/mbmv.utilities/getFinDocInfo`;
  const response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify({
      username: "Service",
      password: "Service",
      SALDOC: saldoc,
      SODTYPE: 13,
    }),
  });

  let data = await translateData(response);
  return data;
}
