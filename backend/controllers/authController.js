exports.signUp = async (req, res) => {
  res.json({ message: "sign up route" });
};

exports.signIn = async (req, res) => {
  res.json({ message: "sign in route" });
};

exports.signOut = async (req, res) => {
  res.json({ message: "sign out route" });
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: null });
};
