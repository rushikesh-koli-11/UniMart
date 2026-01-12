const axios = require("axios");
const OTP = require("../models/OTP");
const User = require("../models/User");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber, purpose = "signup" } = req.body;

    if (!phoneNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number",
      });
    }

    if (purpose === "signup") {
      const existingUser = await User.findOne({ phone: phoneNumber });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "Mobile number already registered. Please log in or use another number.",
        });
      }
    }

    if (purpose === "forgot") {
      const existingUser = await User.findOne({ phone: phoneNumber });
      if (!existingUser) {
        return res.status(400).json({
          success: false,
          message: "Mobile number not found. Please register first.",
        });
      }
    }

    await OTP.deleteOne({ phoneNumber });

    const otp = generateOTP();
    const message = `Your OTP is ${otp}. Please do not share it with anyone.`;

    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ success: false, message: "SMS service not configured" });
    }

    const response = await axios({
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      headers: { authorization: apiKey },
      data: {
        route: "v3",
        sender_id: "TXTIND",
        message: message,
        language: "english",
        flash: 0,
        numbers: phoneNumber,
      },
    });

    if (response.data.return) {
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      await OTP.create({ phoneNumber, otp, expiresAt: otpExpiry });

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the OTP",
      error: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const storedOtp = await OTP.findOne({ phoneNumber });

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    // Expiry check
    if (Date.now() > storedOtp.expiresAt) {
      await OTP.deleteOne({ phoneNumber });
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (storedOtp.otp === otp) {
      // ✅ Verified: delete OTP
      await OTP.deleteOne({ phoneNumber });

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying the OTP",
      error: error.message,
    });
  }
};
