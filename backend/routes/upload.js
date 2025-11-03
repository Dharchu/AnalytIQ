import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  try {
    const file = XLSX.readFile(req.file.path);
    const sheet = file.Sheets[file.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    fs.unlinkSync(req.file.path);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: "Error processing file" });
  }
});

export default router;
