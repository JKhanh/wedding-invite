import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Simple security check - only allow in development
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Not allowed in production" });
  }

  try {
    // Delete existing test users first (optional)
    await prisma.user.deleteMany({
      where: {
        firstName: {
          in: ["Test"]
        }
      }
    });

    // Create a regular guest
    await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Regular",
        bridalParty: false,
        nzInvite: true,
        myInvite: false,
        dinner: false, // Regular guest - no dinner access
      },
    });

    // Create a dinner guest
    await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Dinner",
        bridalParty: false,
        nzInvite: true,
        myInvite: false,
        dinner: true, // Dinner guest - has reception access
      },
    });

    // Create a bridal party member (bonus)
    await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Bridal",
        bridalParty: true, // Bridal party member
        nzInvite: true,
        myInvite: false,
        dinner: true, // Usually bridal party also attends dinner
      },
    });

    const response = {
      message: "Test users created successfully!",
      password: process.env.PASSWORD || "123456",
      users: [
        {
          name: "Test Regular",
          firstName: "Test",
          lastName: "Regular",
          access: "Basic dashboard only",
          dinner: false,
          bridalParty: false
        },
        {
          name: "Test Dinner",
          firstName: "Test",
          lastName: "Dinner",
          access: "Dashboard + Reception info",
          dinner: true,
          bridalParty: false
        },
        {
          name: "Test Bridal",
          firstName: "Test",
          lastName: "Bridal",
          access: "Dashboard + Reception + Bridal party status",
          dinner: true,
          bridalParty: true
        }
      ]
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error creating users:", error);
    return res.status(500).json({ 
      message: "Error creating users", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}