const Business = require("../models/Business.model");

exports.getPlanUsage = async (req, res) => {
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

    await business.reload();

    const usage = business.planUsage || {};

    res.json({
      members: usage.members || 0,
      storageUsed: usage.storageUsed || 0,
      storageLimit: 2048,
      aiMessagesToday: usage.aiMessagesToday || 0,
      aiRemaining: 5 - (usage.aiMessagesToday || 0),
      aiLimit: 5
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch plan usage" });
  }
};