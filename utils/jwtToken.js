const sendToken = (user, statusCode, res) => {
  // const refreshToken = user.getRefreshToken();
  const accessToken = user.getAccessToken();

  //Option for cookie
  // const options = {
  //   expires: new Date(
  //     Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  // };
  res
    .json({
      success: true,
      user,
      accessToken,
    });
};
module.exports = sendToken;
