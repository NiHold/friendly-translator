class LanguageController {
  async createLanguage(req, res) {
    try {
      res
        .status(201)
        .json({ message: "Language created successfully", date: {} });
    } catch (err) {
      next(err);
    }
  }
  async getLanguage(req, res) {
    try {
      res
        .status(201)
        .json({ message: "Language created successfully", date: {} });
    } catch (err) {
      next(err);
    }
  }
  async getLanguages(req, res) {
    try {
      res
        .status(201)
        .json({ message: "Language created successfully", date: {} });
    } catch (err) {
      next(err);
    }
  }
  async updateLanguage(req, res) {
    try {
      res
        .status(201)
        .json({ message: "Language created successfully", date: {} });
    } catch (err) {
      next(err);
    }
  }
  async deleteLanguage(req, res) {
    try {
      res
        .status(201)
        .json({ message: "Language created successfully", date: {} });
    } catch (err) {
      next(err);
    }
  }
}

export default new LanguageController();
