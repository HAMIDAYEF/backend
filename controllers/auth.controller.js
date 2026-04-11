import { loginUser, getConnectedUserProfile } from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Connexion réussie",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "mafihach") {
      return res.status(401).json({ message: "mafihach" });
    }
    return res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const profile = await getConnectedUserProfile(req.user.id, req.user.role);

    if (!profile) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};