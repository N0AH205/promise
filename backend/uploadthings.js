const { UploadThing } = require("uploadthing");

const uploadthing = new UploadThing({
  appId: "3wm2v8d5rm",
  secret: "sk_live_8de5f60829f82e2067b32f43b99b0e645267e178768fcae2751f5f40420d0c42",
});

module.exports = uploadthing;
