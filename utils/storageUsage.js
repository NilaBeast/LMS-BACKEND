const Business = require("../models/Business.model");

exports.addStorageUsage = async (businessId, fileSizeBytes) => {
  try {
    const business = await Business.findByPk(businessId);
    if (!business) return;

    const usage = business.planUsage || {
      members: 0,
      storageUsed: 0,
      aiMessagesToday: 0,
      aiLastReset: null
    };

    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    const newUsage = {
      ...usage,
      storageUsed: (usage.storageUsed || 0) + fileSizeMB
    };

    await business.update({
      planUsage: newUsage
    });

    console.log(
      "📦 Storage updated:",
      newUsage.storageUsed.toFixed(2),
      "MB"
    );

  } catch (err) {
    console.error("Storage usage update error:", err);
  }
};