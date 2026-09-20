import { NextRequest, NextResponse } from "next/server";
import { recordAttendancePunch } from "@/actions/absensi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qr_code_id, customTime } = body;

    if (!qr_code_id || typeof qr_code_id !== "string" || !qr_code_id.trim()) {
      return NextResponse.json(
        {
          success: false,
          type: "INVALID_QR",
          message: "qr_code_id is required and cannot be empty.",
        },
        { status: 400 }
      );
    }

    const result = await recordAttendancePunch(qr_code_id, { customTime });

    if (!result.success) {
      const statusCode = result.type === "INVALID_QR" ? 404 : 409;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Error in /api/attendance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error processing attendance punch.",
      },
      { status: 500 }
    );
  }
}
