const Business = require("../models/Business.model");

/**
 * GET PIXEL SETTINGS
 */
exports.getPixelSettings = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: {
        id: req.params.businessId,
        userId: req.user.id
      }
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (!business.pixelSettings) {
      const defaults = {
        metaPixelId: "",
        metaAccessToken: "",
        googleMeasurementId: "",
        googleAccessToken: ""
      };

      await business.update({ pixelSettings: defaults });
      return res.json(defaults);
    }

    res.json(business.pixelSettings);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pixel settings" });
  }
};


/**
 * UPDATE PIXEL SETTINGS
 */
exports.updatePixelSettings = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: {
        id: req.params.businessId,
        userId: req.user.id
      }
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await business.update({
      pixelSettings: req.body
    });

    res.json({ message: "Pixel settings updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update pixel settings" });
  }
};