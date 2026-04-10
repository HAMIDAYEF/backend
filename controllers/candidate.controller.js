import {
  getAllCandidates,
  getCandidatesByInstructor,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../services/candidate.service.js";

export const getCandidates = async (req, res) => {
  try {
    let candidates;

    if (req.user.role === "admin") {
      candidates = await getAllCandidates();
    } else if (req.user.role === "instructor") {
      candidates = await getCandidatesByInstructor(req.user.id);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(candidates);
  } catch (error) {
    console.error("GET CANDIDATES ERROR =>", error);
    return res.status(500).json({
      message: "Error fetching candidates",
      error: error.message,
    });
  }
};

export const getCandidate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const candidate = await getCandidateById(id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (
      req.user.role === "instructor" &&
      candidate.instructorId !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(candidate);
  } catch (error) {
    console.error("GET CANDIDATE ERROR =>", error);
    return res.status(500).json({
      message: "Error fetching candidate",
      error: error.message,
    });
  }
};

export const createCandidateController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      licenseType,
      bloodType,
      instructorId,
      drivingSchoolId,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !licenseType ||
      !bloodType ||
      !instructorId ||
      !drivingSchoolId
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const candidate = await createCandidate(req.body);

    return res.status(201).json({
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    console.error("CREATE CANDIDATE ERROR =>", error);
    return res.status(500).json({
      message: "Error creating candidate",
      error: error.message,
    });
  }
};

export const updateCandidateController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCandidate = await getCandidateById(id);

    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidate = await updateCandidate(id, req.body);

    return res.status(200).json({
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (error) {
    console.error("UPDATE CANDIDATE ERROR =>", error);
    return res.status(500).json({
      message: "Error updating candidate",
      error: error.message,
    });
  }
};

export const deleteCandidateController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingCandidate = await getCandidateById(id);

    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await deleteCandidate(id);

    return res.status(200).json({
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CANDIDATE ERROR =>", error);
    return res.status(500).json({
      message: "Error deleting candidate",
      error: error.message,
    });
  }
};