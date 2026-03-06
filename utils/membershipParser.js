exports.parseMembership = (body) => {

  let membershipRequired = false;
  let membershipPlanIds = [];

  if (body.membershipRequired !== undefined) {

    membershipRequired =
      body.membershipRequired === "true" ||
      body.membershipRequired === true ||
      body.membershipRequired === "1";

  }

  if (membershipRequired && body.membershipPlanIds) {

    try {

      membershipPlanIds =
        typeof body.membershipPlanIds === "string"
          ? JSON.parse(body.membershipPlanIds)
          : body.membershipPlanIds;

    } catch (err) {

      console.error("MEMBERSHIP PARSE ERROR:", err);

      membershipPlanIds = [];

    }

  }

  return {
    membershipRequired,
    membershipPlanIds,
  };

};