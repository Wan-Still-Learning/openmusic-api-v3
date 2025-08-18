// src/validator/exports/schema.js
import Joi from 'joi';

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

export default ExportPlaylistPayloadSchema;