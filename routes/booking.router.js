const express = require("express");
const router = express.Router();
const reservation = require("../controllers/booking.controller.js");

router.get("/", reservation.findAllBooking);
router.get("/admin", reservation.findAllBookingByAdmin);
router.get("/:id", reservation.findOneBooking);
router.post("/create", reservation.createBooking);
router.delete("/:id/delete", reservation.deleteBooking);
// router.put("/update", reservation.updateBooking);


module.exports = router;
