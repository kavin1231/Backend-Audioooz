import express from "express";

import Inquiry from "../models/inquiry.js";
import { isItCustomer } from "./userController.js";

export async function addInquiry(req, res) {
  try {
    if (isItCustomer(req)) {
      const data = req.body;
      data.email = req.user.email;
      data.phone = req.user.phone;

      let id = 0;

      const inquiries = await Inquiry.find().sort({ id: -1 }).limit(1);

      if (inquiries.length == 0) {
        id = 1;
      } else {
        id = inquiries[0].id + 1;
      }
      data.id = id;
      const newInquiry = new Inquiry(data);
      const response = await newInquiry.save();

      res.json({
        message: "Inquiry added successfully",
        inquiry: response,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to add inquiry" });
  }
}
