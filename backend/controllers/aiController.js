const aiService = require('../services/aiService');

const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const response = await aiService.generateResponse(prompt, req.user);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { askAI };
