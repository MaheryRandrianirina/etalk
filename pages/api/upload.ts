import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";

export const config = {
    api: {
      bodyParser: false, // Disable default body parser
    },
  };

export default async function Upload(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir =  path.join(process.cwd(), 'public', 'images', 'user', 'profile_photo');
  const form = new formidable.IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing files:", err);
        return res.status(500).json({ error: "Error parsing files" });
      }
      
      const profile_photo = files["profile_photo"] as formidable.File
      res.status(200).send({ success: true, file: profile_photo.newFilename, message: "File uploaded successfully" });
  });
}