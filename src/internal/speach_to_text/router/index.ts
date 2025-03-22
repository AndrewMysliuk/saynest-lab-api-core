import { Router } from "express";

import multer from "multer";

import { whisperSpeechToTextHandler } from "../handlers";
import { ISpeachToText } from "../index";

const upload = multer();

export const createSpeachToTextRouter = (
  speachToTextService: ISpeachToText,
): Router => {
  const router = Router();

  router.post(
    "/",
    upload.single("audio"),
    whisperSpeechToTextHandler(speachToTextService),
  );

  return router;
};
