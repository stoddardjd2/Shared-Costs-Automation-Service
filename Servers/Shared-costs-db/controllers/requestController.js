// controllers/requestController.js
const Request = require("../models/Request");
const User = require("../models/User");

// const createRequest = () => {};

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user._id });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
};
