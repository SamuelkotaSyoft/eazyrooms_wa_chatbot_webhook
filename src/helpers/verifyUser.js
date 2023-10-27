
async function verifyUser(req, _, next) {
  req.user = {
    id: "NJ89C0DN898UC",
    org: "DKJNI9C0EI9",
  };

  next();
}

export default verifyUser;
