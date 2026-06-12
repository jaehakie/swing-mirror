let uploadedFile = null;

export function setUploadedSwing(file) {
  uploadedFile = file;
}

export function getUploadedSwing() {
  return uploadedFile;
}

export function clearUploadedSwing() {
  uploadedFile = null;
}
