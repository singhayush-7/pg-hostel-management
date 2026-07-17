const authService = require("../services/auth.service");
const {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} = require("../constants/cookieOptions");

 
 
const attachTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

 
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const { user, accessToken, refreshToken } = await authService.register({
      name,
      email,
      password,
      role,
      phone,
    });

    attachTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({
      email,
      password,
    });

    attachTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

 
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);

    res.clearCookie("accessToken", clearCookieOptions);
    res.clearCookie("refreshToken", { ...clearCookieOptions, path: "/api/auth/refresh-token" });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

 
const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    const { user, accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(incomingRefreshToken);

    attachTokenCookies(res, accessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};
 
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetUrlBase =
      process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

    await authService.forgotPassword(email, resetUrlBase);

     
    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};


const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};


const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

 
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
};
