const validSubscriptions = ["starter", "pro", "business"];

const validateSubscription = (req, res, next) => {
  const { subscription } = req.body;

  if (!validSubscriptions.includes(subscription)) {
    return res.status(400).json({ message: "Invalid subscription value" });
  }

  next();
};

export default validateSubscription;
//subscriptionValidationMiddleware.js
