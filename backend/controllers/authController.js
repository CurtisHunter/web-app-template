exports.signUp = async (req, res) => {
  res.json({ message: "sign up route", recieved: req.body });
};

exports.signIn = async (req, res) => {
  res.json({ message: "sign in route", recieved: req.body });
};

exports.signOut = async (req, res) => {
  res.json({ message: "sign out route" });
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: null });
};
