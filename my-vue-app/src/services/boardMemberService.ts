import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // เปลี่ยนเป็น URL ของ backend ของคุณ

const boardMemberService = {
  async inviteUserToBoard(board_id: number, email: string) {
    try {
      const token = localStorage.getItem("token");
      const owner_id = localStorage.getItem("user_id"); // ✅ ดึง owner_id

      if (!token) {
        console.error("❌ No authentication token found.");
        throw new Error("Unauthorized: Please log in again.");
      }

      if (!owner_id) {
        console.error("❌ No owner_id found in localStorage.");
        throw new Error("Cannot verify board ownership.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/boards/${board_id}/invite`,
        { email, owner_id }, // ✅ ส่ง owner_id ไปพร้อมกับ request
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ User invited successfully: ${email}`);
      return response.data;

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        const status = axiosError.response?.status || 500;
        const data = axiosError.response?.data;
        const message =
          data && typeof data === "object" && "message" in data
            ? (data as { message: string }).message
            : "Unknown error occurred.";

        if (status === 401) {
          console.warn("⚠️ Unauthorized: Token might be expired.");
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }

        if (status === 403) {
          console.warn(`⚠️ Forbidden: ${message}`);
          throw new Error("You do not have permission to invite users.");
        }

        if (status === 404) {
          console.warn(`⚠️ Not Found: ${message}`);
          throw new Error("Board or user not found.");
        }

        if (status === 409) {
          console.warn(`⚠️ Conflict: ${message}`);
          throw new Error("User is already a member of this board.");
        }

        console.error(`❌ Server Error (${status}): ${message}`);
        throw new Error(message);
      }

      if (error instanceof Error) {
        console.error("❌ Unexpected Error:", error.message);
        throw new Error(error.message);
      }

      console.error("❌ Unknown error occurred:", error);
      throw new Error("An unknown error occurred.");
    }
  },
};

export default boardMemberService;
