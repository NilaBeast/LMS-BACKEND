const Business = require("../models/Business.model");

/**
 * GET EMAIL PREFERENCES
 */
exports.getEmailPreferences = async (req, res) => {
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

    // DEFAULT PREFERENCES IF NULL
    if (!business.emailPreferences) {
      const defaultPrefs = {
        newMember: true,
        memberLeave: true,
        dailySummary: true,
        newChallenge: true,
        newAffiliate: true,
        inventoryLow: true,
        outOfStock: true
      };

      await business.update({ emailPreferences: defaultPrefs });
      return res.json(defaultPrefs);
    }

    res.json(business.emailPreferences);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
};


/**
 * UPDATE EMAIL PREFERENCES
 */
exports.updateEmailPreferences = async (req, res) => {
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
      emailPreferences: req.body
    });

    res.json({ message: "Preferences updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};