const express = require("express");
const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/category/:categoryId/service", createService);
router.get("/category/:categoryId/services", getServices);
router.put("/category/:categoryId/service/:serviceId", updateService);
router.delete("/category/:categoryId/service/:serviceId", deleteService);

module.exports = router;
