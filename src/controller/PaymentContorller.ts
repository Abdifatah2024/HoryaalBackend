import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

//   try {
//     const {
//       studentId,
//       amountPaid,
//       discount = 0,
//       discountReason = "",
//       description = "",
//       month,
//       year,
//     } = req.body;

//     if (!studentId || amountPaid === undefined || !month || !year) {
//       return res.status(400).json({
//         message: "studentId, amountPaid, month, and year are required",
//       });
//     }

//     if (Number(discount) < 0) {
//       return res.status(400).json({ message: "Discount cannot be negative" });
//     }

//     // @ts-ignore
//     const user = req.user as { useId: number; role?: string };

//     if (!["ADMIN", "USER"].includes(user?.role || "")) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     await prisma.$transaction(async (prisma) => {
//       const student = await prisma.student.findUnique({
//         where: { id: +studentId },
//         include: { parentUser: true },
//       });

//       if (!student) throw new Error("Student not found");

//       const baseFee = Number(student.fee);
//       const feeAmount = baseFee * 1.1;

//       let studentFee = await prisma.studentFee.findUnique({
//         where: {
//           studentId_month_year: {
//             studentId: +studentId,
//             month: Number(month),
//             year: Number(year),
//           },
//         },
//       });

//       if (!studentFee) {
//         studentFee = await prisma.studentFee.create({
//           data: {
//             studentId: +studentId,
//             month: Number(month),
//             year: Number(year),
//             student_fee: new Prisma.Decimal(feeAmount.toFixed(2)),
//             isPaid: false,
//           },
//         });
//       }

//       const allocationSums = await prisma.paymentAllocation.aggregate({
//         where: { studentFeeId: studentFee.id },
//         _sum: { amount: true },
//       });

//       const alreadyPaid = Number(allocationSums._sum.amount || 0);
//       const feeDue = Number(studentFee.student_fee || 0);
//       const due = feeDue - alreadyPaid;

//       if (due <= 0) {
//         return res.status(200).json({ message: "No fee due for this month." });
//       }

//       const previousAccount = await prisma.studentAccount.findUnique({
//         where: { studentId: +studentId },
//       });

//       let carryForward = Number(previousAccount?.carryForward || 0);
//       let availableAmount = Number(amountPaid) + carryForward;
//       let remainingDiscount = Number(discount);

//       const discountToApply = Math.min(remainingDiscount, due);
//       const paymentToApply = Math.min(due - discountToApply, availableAmount);
//       const totalApplied = discountToApply + paymentToApply;

//       if (totalApplied <= 0) {
//         return res
//           .status(200)
//           .json({ message: "Nothing to pay for this month" });
//       }

//       // ✅ Create Payment
//       const payment = await prisma.payment.create({
//         data: {
//           studentId: +studentId,
//           userId: user.useId,
//           amountPaid: paymentToApply,
//           discount: discountToApply,
//           Description: description,
//         },
//       });

//       // ✅ Create Allocation
//       await prisma.paymentAllocation.create({
//         data: {
//           studentId: +studentId,
//           studentFeeId: studentFee.id,
//           amount: totalApplied,
//           paymentId: payment.id,
//         },
//       });

//       // ✅ Log Discount if used
//       if (discountToApply > 0) {
//         await prisma.discountLog.create({
//           data: {
//             studentId: +studentId,
//             studentFeeId: studentFee.id,
//             amount: discountToApply,
//             reason: discountReason,
//             month: Number(month),
//             year: Number(year),
//             approvedBy: user.useId,
//           },
//         });
//       }

//       // ✅ Mark as paid if fully covered
//       if (alreadyPaid + totalApplied >= feeDue) {
//         await prisma.studentFee.update({
//           where: { id: studentFee.id },
//           data: { isPaid: true },
//         });
//       }

//       // ✅ Update carry forward
//       const newCarryForward = availableAmount - paymentToApply;
//       await prisma.studentAccount.upsert({
//         where: { studentId: +studentId },
//         update: { carryForward: newCarryForward },
//         create: {
//           studentId: +studentId,
//           carryForward: newCarryForward,
//         },
//       });

//       // ✅ Final response
//       res.status(201).json({
//         message: `Full payment processed for ${student.fullname} (${month}/${year}).`,
//         studentId: student.id,
//         studentName: student.fullname,
//         parentPhone: student.phone,
//         paidAmount: paymentToApply,
//         discountUsed: discountToApply,
//         month: Number(month),
//         year: Number(year),
//         paymentDescription: description,
//         paymentId: payment.id,
//       });
//     });
//   } catch (error) {
//     console.error("Payment error:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
export const createStudentPayment = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      amountPaid,
      discount = 0,
      discountReason = "",
      description = "",
      month,
      year,
    } = req.body;

    if (!studentId || amountPaid === undefined || !month || !year) {
      return res.status(400).json({
        message: "studentId, amountPaid, month, and year are required",
      });
    }

    if (Number(discount) < 0) {
      return res.status(400).json({ message: "Discount cannot be negative" });
    }

    // @ts-ignore
    const user = req.user as { useId: number; role?: string };

    if (!["ADMIN", "USER"].includes(user?.role || "")) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.$transaction(async (prisma) => {
      const student = await prisma.student.findUnique({
        where: { id: +studentId },
        include: { parentUser: true },
      });

      if (!student) throw new Error("Student not found");

      const baseFee = Number(student.fee);
      const feeAmount = baseFee * 1.1;

      let studentFee = await prisma.studentFee.findUnique({
        where: {
          studentId_month_year: {
            studentId: +studentId,
            month: Number(month),
            year: Number(year),
          },
        },
      });

      if (!studentFee) {
        studentFee = await prisma.studentFee.create({
          data: {
            studentId: +studentId,
            month: Number(month),
            year: Number(year),
            student_fee: new Prisma.Decimal(feeAmount.toFixed(2)),
            isPaid: false,
          },
        });
      }

      const allocationSums = await prisma.paymentAllocation.aggregate({
        where: { studentFeeId: studentFee.id },
        _sum: { amount: true },
      });

      const alreadyPaid = Number(allocationSums._sum.amount || 0);
      const feeDue = Number(studentFee.student_fee || 0);
      const due = feeDue - alreadyPaid;

      if (due <= 0) {
        return res.status(200).json({ message: "No fee due for this month." });
      }

      // ✅ Step 1: Check monthly school-wide discount cap
      const totalDiscountUsed = await prisma.discountLog.aggregate({
        where: { month: Number(month), year: Number(year) },
        _sum: { amount: true },
      });

      const usedDiscount = Number(totalDiscountUsed._sum.amount || 0);

      const discountLimit = await prisma.monthlyDiscountLimit.findUnique({
        where: {
          month_year: {
            month: Number(month),
            year: Number(year),
          },
        },
      });

      const maxAllowedDiscount = Number(discountLimit?.maxLimit || 0);

      if (discount > 0 && usedDiscount + discount > maxAllowedDiscount) {
        return res.status(400).json({
          message: `Monthly discount limit exceeded (${usedDiscount}/${maxAllowedDiscount}). Payment denied.`,
        });
      }

      // ✅ Step 2: Proceed with fee logic
      const previousAccount = await prisma.studentAccount.findUnique({
        where: { studentId: +studentId },
      });

      let carryForward = Number(previousAccount?.carryForward || 0);
      let availableAmount = Number(amountPaid) + carryForward;
      let remainingDiscount = Number(discount);

      const discountToApply = Math.min(remainingDiscount, due);
      const paymentToApply = Math.min(due - discountToApply, availableAmount);
      const totalApplied = discountToApply + paymentToApply;

      if (totalApplied <= 0) {
        return res
          .status(200)
          .json({ message: "Nothing to pay for this month" });
      }

      const payment = await prisma.payment.create({
        data: {
          studentId: +studentId,
          userId: user.useId,
          amountPaid: paymentToApply,
          discount: discountToApply,
          Description: description,
        },
      });

      await prisma.paymentAllocation.create({
        data: {
          studentId: +studentId,
          studentFeeId: studentFee.id,
          amount: totalApplied,
          paymentId: payment.id,
        },
      });

      if (discountToApply > 0) {
        await prisma.discountLog.create({
          data: {
            studentId: +studentId,
            studentFeeId: studentFee.id,
            amount: discountToApply,
            reason: discountReason,
            month: Number(month),
            year: Number(year),
            approvedBy: user.useId,
          },
        });
      }

      if (alreadyPaid + totalApplied >= feeDue) {
        await prisma.studentFee.update({
          where: { id: studentFee.id },
          data: { isPaid: true },
        });
      }

      const newCarryForward = availableAmount - paymentToApply;
      await prisma.studentAccount.upsert({
        where: { studentId: +studentId },
        update: { carryForward: newCarryForward },
        create: {
          studentId: +studentId,
          carryForward: newCarryForward,
        },
      });

      res.status(201).json({
        message: `Full payment processed for ${student.fullname} (${month}/${year}).`,
        studentId: student.id,
        studentName: student.fullname,
        parentPhone: student.phone,
        paidAmount: paymentToApply,
        discountUsed: discountToApply,
        month: Number(month),
        year: Number(year),
        paymentDescription: description,
        paymentId: payment.id,
      });
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const createMultiStudentPayment = async (
  req: Request,
  res: Response
) => {
  try {
    let studentsRaw = req.body.students;

    // ✅ Normalize and validate
    const students = Array.isArray(studentsRaw)
      ? studentsRaw
      : studentsRaw
      ? [studentsRaw]
      : [];

    if (
      !Array.isArray(students) ||
      students.length === 0 ||
      students.some((s) => !s || typeof s !== "object")
    ) {
      return res.status(400).json({
        message:
          "Valid 'students' array with studentId and amountPaid is required",
      });
    }

    // @ts-ignore
    const user = req.user;

    const results = await prisma.$transaction(async (prisma) => {
      const responses = [];

      for (const [index, entry] of students.entries()) {
        if (!entry || typeof entry !== "object") {
          throw new Error(`Invalid student entry at index ${index}`);
        }

        const {
          studentId,
          amountPaid,
          discount = 0,
          discountReason = "",
        } = entry;

        if (!studentId || amountPaid === undefined) {
          throw new Error(`Missing studentId or amountPaid at index ${index}`);
        }

        if (discount < 0) {
          throw new Error(`Discount cannot be negative at index ${index}`);
        }

        const student = await prisma.student.findUnique({
          where: { id: +studentId },
        });

        if (!student) throw new Error(`Student ID ${studentId} not found`);

        const feeAmount = Number(student.fee);
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const previousAccount = await prisma.studentAccount.findUnique({
          where: { studentId: +studentId },
        });

        const previousCarryForward = Number(previousAccount?.carryForward || 0);

        // Step 1: Get unpaid fees
        let unpaidFees = await prisma.studentFee.findMany({
          where: {
            studentId: +studentId,
            isPaid: false,
          },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        });

        const existingKeys = new Set(
          unpaidFees.map((f) => `${f.year}-${f.month}`)
        );

        let totalAvailable = Number(amountPaid) + previousCarryForward;
        const estimatedMonths =
          totalAvailable < feeAmount
            ? 1
            : Math.ceil(totalAvailable / feeAmount);

        let lastDate = new Date(currentYear, currentMonth - 1, 1);

        // Step 2: Create missing months
        for (let i = 0; i < estimatedMonths; i++) {
          const month = lastDate.getMonth() + 1;
          const year = lastDate.getFullYear();
          const key = `${year}-${month}`;

          if (!existingKeys.has(key)) {
            const newOrExisting = await prisma.studentFee.upsert({
              where: {
                studentId_month_year: {
                  studentId: +studentId,
                  month,
                  year,
                },
              },
              update: {},
              create: {
                studentId: +studentId,
                month,
                year,
                isPaid: false,
              },
            });

            unpaidFees.push(newOrExisting);
            existingKeys.add(key);
          }

          lastDate.setMonth(lastDate.getMonth() + 1);
        }

        unpaidFees.sort((a, b) =>
          a.year === b.year ? a.month - b.month : a.year - b.year
        );

        // Step 3: Get current allocations
        const allocationSums = await prisma.paymentAllocation.groupBy({
          by: ["studentFeeId"],
          where: {
            studentFeeId: { in: unpaidFees.map((f) => f.id) },
          },
          _sum: { amount: true },
        });

        const paidMap = new Map(
          allocationSums.map((a) => [
            a.studentFeeId,
            Number(a._sum.amount || 0),
          ])
        );

        let availableAmount = Number(amountPaid) + previousCarryForward;
        let remainingDiscount = Number(discount);

        const allocations: {
          studentFeeId: number;
          amount: number;
          studentId: number;
        }[] = [];

        const discountRecords: {
          studentFeeId: number;
          studentId: number;
          amount: number;
          reason: string;
          month: number;
          year: number;
          approvedBy: number;
        }[] = [];

        const detailedAllocations: {
          studentFeeId: number;
          total: number;
          paid: number;
          discount: number;
          month: number;
          year: number;
        }[] = [];

        // Step 4: Allocate (partial or full)
        for (const feeRecord of unpaidFees) {
          if (availableAmount <= 0 && remainingDiscount <= 0) break;

          const paidSoFar = paidMap.get(feeRecord.id) || 0;
          const due = feeAmount - paidSoFar;

          const discountToApply = Math.min(remainingDiscount, due);
          const paymentToApply = Math.min(
            due - discountToApply,
            availableAmount
          );
          const totalPayment = discountToApply + paymentToApply;

          if (paymentToApply > 0 || discountToApply > 0) {
            allocations.push({
              studentFeeId: feeRecord.id,
              amount: totalPayment,
              studentId: +studentId,
            });

            detailedAllocations.push({
              studentFeeId: feeRecord.id,
              total: totalPayment,
              paid: paymentToApply,
              discount: discountToApply,
              month: feeRecord.month,
              year: feeRecord.year,
            });

            if (discountToApply > 0) {
              discountRecords.push({
                studentFeeId: feeRecord.id,
                studentId: +studentId,
                amount: discountToApply,
                reason: discountReason,
                month: feeRecord.month,
                year: feeRecord.year,
                approvedBy: user.useId,
              });
              remainingDiscount -= discountToApply;
            }

            availableAmount -= paymentToApply;

            if (paidSoFar + totalPayment >= feeAmount) {
              await prisma.studentFee.update({
                where: { id: feeRecord.id },
                data: { isPaid: true },
              });
            }
          }
        }

        // Step 5: Save payment
        const newPayment = await prisma.payment.create({
          data: {
            studentId: +studentId,
            userId: user.useId,
            amountPaid: Number(amountPaid),
            discount: Number(discount),
            allocations: { create: allocations },
          },
        });

        if (discountRecords.length > 0) {
          await prisma.discountLog.createMany({ data: discountRecords });
        }

        // Step 6: Update carry forward
        await prisma.studentAccount.upsert({
          where: { studentId: +studentId },
          update: { carryForward: availableAmount },
          create: {
            studentId: +studentId,
            carryForward: availableAmount,
          },
        });

        responses.push({
          studentId,
          message: "Payment processed successfully",
          payment: newPayment,
          StudentName: student.fullname,
          carryForward: availableAmount,
          allocations: detailedAllocations,
          appliedDiscounts: discountRecords,
        });
      }

      return responses;
    });

    res.status(201).json({
      message: "All student payments processed successfully",
      results,
    });
  } catch (error) {
    console.error("Error processing multi-student payments:", error);
    res.status(500).json({
      message: "Internal server error while processing payments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// export const generateMonthlyFees = async (req: Request, res: Response) => {
//   try {
//     const today = new Date();
//     const month = today.getMonth() + 1;
//     const year = today.getFullYear();

//     // Fetch all active students
//     const students = await prisma.student.findMany({
//       where: { isdeleted: false, status: "ACTIVE" },
//       select: {
//         id: true,
//         fee: true,
//       },
//     });

//     const newFees = students
//       .filter((student) => Number(student.fee) > 0)
//       .map((student) => ({
//         studentId: student.id,
//         month,
//         year,
//         fee: Number(student.fee), // ensures it's a decimal with 2 places
//         isPaid: false,
//       }));

//     if (newFees.length === 0) {
//       return res.status(200).json({ message: "No new fee records needed." });
//     }

//     // ✅ Use skipDuplicates to avoid violating unique constraint
//     const result = await prisma.studentFee.createMany({
//       data: newFees,
//       skipDuplicates: true,
//     });

//     res.status(201).json({
//       message: `${result.count} monthly fee records created for ${month}/${year}`,
//     });
//   } catch (error) {
//     console.error("Error generating monthly fees:", error);
//     res.status(500).json({
//       message: "Server error while generating fees",
//     });
//   }
// };

// GET /api/students/:id/fees

export const generateMonthlyFees = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const students = await prisma.student.findMany({
      where: { isdeleted: false, status: "ACTIVE" },
      select: { id: true, fee: true },
    });

    const newFees = students
      .filter((student) => Number(student.fee) > 0)
      .map((student) => ({
        studentId: student.id,
        month,
        year,
        student_fee: new Prisma.Decimal(student.fee.toString()), // ✅ required field
        isPaid: false,
      }));

    if (newFees.length === 0) {
      return res.status(200).json({ message: "No new fee records needed." });
    }

    const result = await prisma.studentFee.createMany({
      data: newFees,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: `${result.count} monthly fee records created for ${month}/${year}`,
    });
  } catch (error) {
    console.error("Error generating monthly fees:", error);
    res.status(500).json({ message: "Server error while generating fees" });
  }
};

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required1" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        StudentFee: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
          include: {
            PaymentAllocation: {
              include: {
                payment: {
                  select: {
                    amountPaid: true,
                    discount: true,
                    date: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeAmount = Number(student.fee); // ✅ Convert Decimal to number

    const feeDetails = student.StudentFee.map((fee) => {
      const totalPaid = fee.PaymentAllocation.reduce(
        (sum, alloc) => sum + Number(alloc.amount),
        0
      );

      return {
        id: fee.id,
        month: fee.month,
        year: fee.year,
        required: feeAmount,
        isPaid: fee.isPaid,
        paid: totalPaid,
        due: Math.max(0, feeAmount - totalPaid), // ✅ Safe number math
        paymentHistory: fee.PaymentAllocation.map((alloc) => ({
          amount: Number(alloc.amount),
          date: alloc.payment.date,
          discount: Number(alloc.payment.discount),
        })),
      };
    });

    res.status(200).json({
      studentId: student.id,
      name: student.fullname,
      fee: feeAmount,
      records: feeDetails,
    });
  } catch (error) {
    console.error("Error fetching student fees:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching student fees" });
  }
};

export const getStudentBalanceSummary = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);

    const student = await prisma.student.findFirst({
      where: { id: studentId, isdeleted: false },
      include: {
        StudentFee: {
          include: {
            PaymentAllocation: {
              select: {
                amount: true,
              },
            },
          },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
        StudentAccount: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feeAmount = Number(student.fee);
    let totalRequired = 0;
    let totalPaid = 0;
    let unpaidMonths = 0;
    const unpaidDetails: {
      month: number;
      year: number;
      due: number;
      paid: number;
    }[] = [];

    for (const fee of student.StudentFee) {
      const paid = fee.PaymentAllocation.reduce(
        (sum, alloc) => sum + Number(alloc.amount),
        0
      );

      totalRequired += feeAmount;
      totalPaid += paid;

      const due = Math.max(0, feeAmount - paid);
      if (!fee.isPaid && due > 0) {
        unpaidMonths++;
        unpaidDetails.push({
          month: fee.month,
          year: fee.year,
          due,
          paid,
        });
      }
    }

    const carryForward = Number(student.StudentAccount?.carryForward || 0);
    const rawBalance = totalRequired - totalPaid;
    const balanceDue = Math.max(0, rawBalance - carryForward);

    res.status(200).json({
      studentId: student.id,
      name: student.fullname,
      monthlyFee: feeAmount,
      monthsGenerated: student.StudentFee.length,
      unpaidMonths,
      unpaidDetails, // 👈 This is your requested list
      totalRequired,
      totalPaid,
      carryForward,
      rawBalance,
      balanceDue,
      explanation: `Student owes ${totalRequired}. Paid ${totalPaid}, carry forward is ${carryForward}. Balance due = ${balanceDue}`,
    });
  } catch (error) {
    console.error("Error fetching student balance:", error);
    res.status(500).json({ message: "Error fetching student balance" });
  }
};

// GET /api/payment/:id/allocations
export const getAllocationsByPayment = async (req: Request, res: Response) => {
  try {
    const paymentId = Number(req.params.id);

    const allocations = await prisma.paymentAllocation.findMany({
      where: { paymentId },
      include: {
        studentFee: {
          select: {
            month: true,
            year: true,
            isPaid: true,
          },
        },
      },
    });

    res.status(200).json(allocations);
  } catch (error) {
    console.error("Error fetching allocations by payment:", error);
    res.status(500).json({ message: "Error retrieving payment allocations" });
  }
};

// GET /api/payment-allocations// controllers/paymentController.ts

// export const getAllPayments = async (_req: Request, res: Response) => {
//   try {
//     const rawPayments = await prisma.payment.findMany({
//       include: {
//         student: {
//           select: {
//             id: true,
//             fullname: true,
//           },
//         },
//         user: {
//           select: {
//             id: true,
//             fullName: true,
//             email: true,
//           },
//         },
//         allocations: true,
//       },
//       orderBy: {
//         date: "desc",
//       },
//     });

//     // Flatten the structure so frontend receives `fullname` directly
//     const payments = rawPayments.map((payment) => ({
//       ...payment,
//       fullname: payment.student.fullname, // Injected top-level fullname
//     }));

//     res.status(200).json({
//       message: "All payments retrieved successfully",
//       payments,
//     });
//   } catch (error) {
//     console.error("Error fetching payments:", error);
//     res.status(500).json({
//       message: "Failed to retrieve payments",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
// export const getAllPayments = async (_req: Request, res: Response) => {
//   try {
//     const payments = await prisma.payment.findMany({
//       include: {
//         student: { select: { id: true, fullname: true } },
//         user: { select: { id: true, fullName: true, email: true } },
//         allocations: true,
//       },
//       orderBy: {
//         date: "desc",
//       },
//     });

//     // Map payments to include top-level fullname and discount
//     const enhancedPayments = payments.map((p) => ({
//       ...p,
//       fullname: p.student.fullname,
//       discount: p.discount.toString(), // ensure string if Decimal
//     }));

//     res.status(200).json({
//       message: "All payments retrieved successfully",
//       payments: enhancedPayments,
//     });
//   } catch (error) {
//     console.error("Error fetching payments:", error);
//     res.status(500).json({ message: "Failed to retrieve payments" });
//   }
// };

// controllers/paymentController.ts

// GET /api/admin/fee-inconsistencies
export const getFeeInconsistencies = async (req: Request, res: Response) => {
  try {
    // Get all students with their fee records and payment allocations
    const students = await prisma.student.findMany({
      include: {
        StudentFee: {
          include: {
            PaymentAllocation: {
              select: {
                amount: true,
                payment: {
                  select: {
                    discount: true,
                  },
                },
              },
            },
          },
        },
        StudentAccount: {
          select: {
            carryForward: true,
          },
        },
      },
    });

    const inconsistencies = [];

    for (const student of students) {
      const expectedMonthlyFee = Number(student.fee);
      let totalPayments = 0;
      let totalAllocated = 0;

      // Check monthly fee payments
      for (const fee of student.StudentFee) {
        const paid = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.amount),
          0
        );

        totalAllocated += paid;

        if (fee.isPaid && paid < expectedMonthlyFee) {
          inconsistencies.push({
            type: "UNDERPAID_FEE",
            studentId: student.id,
            studentName: student.fullname,
            month: fee.month,
            year: fee.year,
            expected: expectedMonthlyFee,
            paid,
            shortage: expectedMonthlyFee - paid,
          });
        } else if (!fee.isPaid && paid >= expectedMonthlyFee) {
          inconsistencies.push({
            type: "UNMARKED_PAID_FEE",
            studentId: student.id,
            studentName: student.fullname,
            month: fee.month,
            year: fee.year,
            expected: expectedMonthlyFee,
            paid,
          });
        }
      }

      // Get total payments made (including discounts)
      const paymentSum = await prisma.payment.aggregate({
        where: { studentId: student.id },
        _sum: {
          amountPaid: true,
          discount: true,
        },
      });

      totalPayments =
        Number(paymentSum._sum.amountPaid || 0) -
        Number(paymentSum._sum.discount || 0);

      // Check account consistency
      const systemCarryForward = Number(
        student.StudentAccount?.carryForward || 0
      );
      const calculatedCarryForward = totalPayments - totalAllocated;

      if (Math.abs(systemCarryForward - calculatedCarryForward) > 0.01) {
        inconsistencies.push({
          type: "ACCOUNT_MISMATCH",
          studentId: student.id,
          studentName: student.fullname,
          systemCarryForward,
          calculatedCarryForward,
          difference: systemCarryForward - calculatedCarryForward,
          totalPayments,
          totalAllocated,
        });
      }
    }

    res.status(200).json({
      inconsistencies,
      count: inconsistencies.length,
      summary: {
        underpaid: inconsistencies.filter((i) => i.type === "UNDERPAID_FEE")
          .length,
        unmarkedPaid: inconsistencies.filter(
          (i) => i.type === "UNMARKED_PAID_FEE"
        ).length,
        accountMismatches: inconsistencies.filter(
          (i) => i.type === "ACCOUNT_MISMATCH"
        ).length,
      },
    });
  } catch (error) {
    console.error("Error fetching fee inconsistencies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

interface VerifyDiscountRequest {
  studentId: number;
  month: number;
  year: number;
  verifiedBy: string; // Email or ID of staff who verified
}

export const verifyDiscount = async (req: Request, res: Response) => {
  try {
    const { studentId, month, year, verifiedBy }: VerifyDiscountRequest =
      req.body;

    // Validate input
    if (!studentId || !month || !year || !verifiedBy) {
      return res.status(400).json({
        error: "studentId, month, year, and verifiedBy are required",
      });
    }

    // Verify the discount exists
    const existingDiscounts = await prisma.discountLog.findMany({
      where: {
        studentId,
        month,
        year,
        verified: false,
      },
    });

    if (existingDiscounts.length === 0) {
      return res.status(404).json({
        error:
          "No unverified discount records found for this student and period",
      });
    }

    // Update verification status
    await prisma.discountLog.updateMany({
      where: {
        studentId,
        month,
        year,
        verified: false,
      },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });

    res.status(200).json({
      message: "Discount(s) successfully verified",
      verifiedCount: existingDiscounts.length,
    });
  } catch (error) {
    console.error("Error verifying discount:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

//get Student Discount

export const listDiscounts = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        error: "studentId is required in the request body",
      });
    }

    const discounts = await prisma.discountLog.findMany({
      where: {
        studentId: Number(studentId),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { verified: "asc" }],
    });

    const verified = discounts.filter((d) => d.verified);
    const unverified = discounts.filter((d) => !d.verified);

    res.status(200).json({
      studentId: Number(studentId),
      verified,
      unverified,
    });
  } catch (error) {
    console.error("Error listing discounts:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         status: "ACTIVE",
//       },
//       include: {
//         StudentFee: {
//           include: {
//             PaymentAllocation: {
//               select: {
//                 amount: true,
//               },
//             },
//           },
//         },
//         StudentAccount: true,
//       },
//     });

//     const result = [];

//     for (const student of students) {
//       const feeAmount = Number(student.fee);
//       let totalRequired = 0;
//       let totalPaid = 0;
//       let unpaidMonths = 0;

//       for (const fee of student.StudentFee) {
//         const paidForThisMonth = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         totalPaid += paidForThisMonth;
//         totalRequired += feeAmount;

//         if (!fee.isPaid && paidForThisMonth < feeAmount) {
//           unpaidMonths++;
//         }
//       }

//       const carryForward = Number(student.StudentAccount?.carryForward || 0);
//       const balanceDue = Math.max(0, totalRequired - totalPaid - carryForward);

//       // ✅ Include only students with any fee activity
//       if (totalRequired > 0 || totalPaid > 0 || balanceDue > 0) {
//         result.push({
//           studentId: student.id,
//           name: student.fullname,
//           totalRequired,
//           totalPaid,
//           unpaidMonths,
//           carryForward,
//           balanceDue,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       students: result,
//     });
//   } catch (error) {
//     console.error("Error calculating balances:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getStudentsWithUnpaidFeesOrBalance = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         status: "ACTIVE",
//       },
//       include: {
//         StudentFee: {
//           include: {
//             PaymentAllocation: {
//               select: {
//                 amount: true,
//               },
//             },
//           },
//         },
//         StudentAccount: true,
//       },
//     });

//     const result = [];

//     for (const student of students) {
//       const feeAmount = Number(student.fee);
//       let totalRequired = 0;
//       let totalPaid = 0;
//       let unpaidMonths = 0;

//       for (const fee of student.StudentFee) {
//         const paidForThisMonth = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         const monthDue = Math.max(0, feeAmount - paidForThisMonth);

//         totalPaid += paidForThisMonth;
//         totalRequired += feeAmount;

//         if (!fee.isPaid && paidForThisMonth < feeAmount) {
//           unpaidMonths++;
//         }
//       }

//       let carryForward = Number(student.StudentAccount?.carryForward || 0);

//       // If carryForward is negative, it's a debt
//       // If positive, it's credit that reduces balance due
//       const balanceDue = Math.max(0, totalRequired - totalPaid - carryForward);

//       if (totalRequired > 0 || totalPaid > 0 || balanceDue > 0) {
//         result.push({
//           studentId: student.id,
//           name: student.fullname,
//           totalRequired,
//           totalPaid,
//           unpaidMonths,
//           carryForward,
//           balanceDue,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       students: result,
//     });
//   } catch (error) {
//     console.error("Error calculating balances:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// export const getStudentsWithUnpaidFeesOrBalance = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         status: "ACTIVE",
//       },
//       include: {
//         StudentFee: {
//           include: {
//             PaymentAllocation: {
//               select: {
//                 amount: true,
//               },
//             },
//           },
//         },
//         StudentAccount: true,
//       },
//     });

//     const result = [];

//     for (const student of students) {
//       const feeAmount = Number(student.fee);
//       let totalRequired = 0;
//       let totalPaid = 0;
//       let unpaidMonths = 0;

//       for (const fee of student.StudentFee) {
//         const paidForThisMonth = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         const monthDue = Math.max(0, feeAmount - paidForThisMonth);

//         totalPaid += paidForThisMonth;
//         totalRequired += feeAmount;

//         if (!fee.isPaid && paidForThisMonth < feeAmount) {
//           unpaidMonths++;
//         }
//       }

//       const carryForward = Number(student.StudentAccount?.carryForward || 0);

//       const balanceDue = Math.max(0, totalRequired - totalPaid - carryForward);

//       // ✅ Only include students who actually owe money
//       if (balanceDue > 0) {
//         result.push({
//           studentId: student.id,
//           name: student.fullname,
//           totalRequired,
//           totalPaid,
//           unpaidMonths,
//           carryForward,
//           balanceDue,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       students: result,
//     });
//   } catch (error) {
//     console.error("Error calculating balances:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const getStudentsWithUnpaidFeesOrBalance = async (
  _req: Request,
  res: Response
) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        isdeleted: false,
        status: "ACTIVE",
      },
      include: {
        classes: true, // ✅ include class
        StudentFee: {
          include: {
            PaymentAllocation: {
              select: {
                amount: true,
              },
            },
          },
        },
        StudentAccount: true,
      },
    });

    const result = [];

    for (const student of students) {
      const feeAmount = Number(student.fee);
      let totalRequired = 0;
      let totalPaid = 0;
      let unpaidMonths = 0;

      for (const fee of student.StudentFee) {
        const paidForThisMonth = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.amount),
          0
        );

        const monthDue = Math.max(0, feeAmount - paidForThisMonth);

        totalPaid += paidForThisMonth;
        totalRequired += feeAmount;

        if (!fee.isPaid && paidForThisMonth < feeAmount) {
          unpaidMonths++;
        }
      }

      const carryForward = Number(student.StudentAccount?.carryForward || 0);

      const balanceDue = Math.max(0, totalRequired - totalPaid - carryForward);

      if (balanceDue > 0) {
        result.push({
          studentId: student.id,
          name: student.fullname,
          className: student.classes?.name || "N/A", // ✅ add class name
          totalRequired,
          totalPaid,
          unpaidMonths,
          carryForward,
          balanceDue,
        });
      }
    }

    res.status(200).json({
      count: result.length,
      students: result,
    });
  } catch (error) {
    console.error("Error calculating balances:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/delete-student-fees?month=5&year=2025
export const getMonthlyIncomeOverview = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        message: "Both month and year query parameters are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Fetch current month's fee records
    const studentFeesCurrent = await prisma.studentFee.findMany({
      where: {
        month,
        year,
        student: {
          isdeleted: false,
          status: "ACTIVE",
        },
      },
      include: {
        student: {
          select: { fee: true },
        },
      },
    });

    // 🔄 Get payment allocations for current month’s studentFee IDs
    const feeIds = studentFeesCurrent.map((fee) => fee.id);
    const feeAllocations = await prisma.paymentAllocation.groupBy({
      by: ["studentFeeId"],
      where: {
        studentFeeId: { in: feeIds },
      },
      _sum: {
        amount: true,
      },
    });

    const feePaidMap = new Map<number, number>();
    feeAllocations.forEach((a) => {
      feePaidMap.set(a.studentFeeId, Number(a._sum.amount || 0));
    });

    const expectedFromCurrentMonth = studentFeesCurrent.reduce(
      (sum, record) => {
        const fee = Number(record.student.fee || 0);
        const paid = feePaidMap.get(record.id) || 0;
        const remaining = Math.max(0, fee - paid);
        return sum + remaining;
      },
      0
    );

    // 2. Previous unpaid months
    const unpaidPastFees = await prisma.studentFee.findMany({
      where: {
        isPaid: false,
        OR: [{ year: { lt: year } }, { year, month: { lt: month } }],
        student: {
          isdeleted: false,
          status: "ACTIVE",
        },
      },
      include: {
        student: {
          select: { id: true, fee: true },
        },
        PaymentAllocation: {
          select: { amount: true },
        },
      },
    });

    const expectedFromPreviousMonths = unpaidPastFees.reduce((sum, fee) => {
      const paid = fee.PaymentAllocation.reduce(
        (s, a) => s + Number(a.amount),
        0
      );
      return sum + Math.max(0, Number(fee.student.fee) - paid);
    }, 0);

    // 3. Total expected
    const requiredIncome =
      expectedFromCurrentMonth + expectedFromPreviousMonths;

    // 4. This month’s actual allocations
    const allocations = await prisma.paymentAllocation.findMany({
      where: {
        payment: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        studentFee: {
          select: {
            month: true,
            year: true,
            student: { select: { fee: true } },
          },
        },
      },
    });

    let lateIncome = 0;
    let currentIncome = 0;
    let advanceIncome = 0;

    for (const alloc of allocations) {
      const amount = Number(alloc.amount);
      const allocMonth = alloc.studentFee.month;
      const allocYear = alloc.studentFee.year;

      if (allocYear < year || (allocYear === year && allocMonth < month)) {
        lateIncome += amount;
      } else if (allocYear === year && allocMonth === month) {
        currentIncome += amount;
      } else {
        advanceIncome += amount;
      }
    }

    const totalIncome = lateIncome + currentIncome + advanceIncome;

    // 5. Payment records for this month (actual paid + discount)
    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amountPaid: true,
        discount: true,
      },
    });

    const actualPaid = payments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0
    );
    const totalDiscount = payments.reduce(
      (sum, p) => sum + Number(p.discount),
      0
    );

    const balance = Math.max(0, requiredIncome - totalIncome);

    // 6. 🔥 System-wide unpaid balance
    const allUnpaidFees = await prisma.studentFee.findMany({
      where: {
        isPaid: false,
        student: {
          isdeleted: false,
          status: "ACTIVE",
        },
      },
      include: {
        student: { select: { fee: true } },
        PaymentAllocation: { select: { amount: true } },
      },
    });

    const unpaidBalanceSystemWide = allUnpaidFees.reduce((sum, fee) => {
      const paid = fee.PaymentAllocation.reduce(
        (s, a) => s + Number(a.amount),
        0
      );
      return sum + Math.max(0, Number(fee.student.fee || 0) - paid);
    }, 0);

    res.status(200).json({
      month,
      year,
      totalStudents: studentFeesCurrent.length,
      requiredIncome: {
        total: requiredIncome,
        expectedFromPreviousMonths,
        expectedFromCurrentMonth,
      },
      actualPaid,
      totalDiscount,
      totalIncome,
      balance,
      unpaidBalanceSystemWide,
      breakdown: {
        lateIncome,
        currentIncome,
        advanceIncome,
      },
      message: `Your income is ${totalIncome}. Late: ${lateIncome}, Current: ${currentIncome}, Advance: ${advanceIncome}`,
    });
  } catch (error) {
    console.error("Error generating income overview:", error);
    res.status(500).json({
      message: "Internal server error while generating income overview",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteStudentFeesByMonth = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({
        message: "Both month and year query parameters are required",
      });
    }

    await prisma.$transaction(async (tx) => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // 1. Find StudentFee IDs for the month/year
      const fees = await tx.studentFee.findMany({
        where: { month, year },
        select: { id: true },
      });
      const feeIds = fees.map((f) => f.id);

      // 2. Find Payment IDs in the month
      const payments = await tx.payment.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { id: true },
      });
      const paymentIds = payments.map((p) => p.id);

      // 3. Delete PaymentAllocations by studentFeeId OR paymentId
      await tx.paymentAllocation.deleteMany({
        where: {
          OR: [
            { studentFeeId: { in: feeIds } },
            { paymentId: { in: paymentIds } },
          ],
        },
      });

      // 4. Delete DiscountLogs for the month/year
      await tx.discountLog.deleteMany({
        where: { month, year },
      });

      // 5. Delete Payments made within the month
      const deletedPayments = await tx.payment.deleteMany({
        where: {
          id: { in: paymentIds },
        },
      });

      // 6. Delete StudentFee records
      const deletedFees = await tx.studentFee.deleteMany({
        where: {
          id: { in: feeIds },
        },
      });

      res.status(200).json({
        message: `Deleted data for ${month}/${year}`,
        deleted: {
          fees: deletedFees.count,
          allocations: feeIds.length,
          discounts: "All discounts for the month",
          payments: deletedPayments.count,
        },
      });
    });
  } catch (error) {
    console.error("Error deleting monthly data:", error);
    res.status(500).json({
      message: "Internal server error while deleting monthly data",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// // GET /api/fees/months-generated
interface MonthData {
  month: number;
  year: number;
  label: string;
  academicYear: string;
}

interface ResponseData {
  totalUniqueMonths: number;
  months: MonthData[];
}

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getAcademicYear = (month: number, year: number): string => {
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const getAllGeneratedMonths = async (_req: Request, res: Response) => {
  try {
    const rawMonths = await prisma.studentFee.findMany({
      select: { month: true, year: true },
      distinct: ["month", "year"],
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const months: MonthData[] = rawMonths.map(({ month, year }) => {
      if (month < 1 || month > 12) {
        throw new Error(`Invalid month: ${month}`);
      }
      return {
        month,
        year,
        label: `${monthNames[month]} ${year}`,
        academicYear: getAcademicYear(month, year),
      };
    });

    res.status(200).json({
      totalUniqueMonths: months.length,
      months,
    } as ResponseData);
  } catch (error) {
    console.error("Error fetching unique months:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentDepositStatus = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.id);

    const student = await prisma.student.findFirst({
      where: { id: studentId, isdeleted: false },
      include: {
        StudentFee: {
          include: {
            PaymentAllocation: true,
          },
        },
        StudentAccount: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const monthlyFee = Number(student.fee);
    const totalRequired = student.StudentFee.length * monthlyFee;

    const totalPaid = student.StudentFee.reduce((sum, fee) => {
      const paid = fee.PaymentAllocation.reduce(
        (subSum, alloc) => subSum + Number(alloc.amount),
        0
      );
      return sum + paid;
    }, 0);

    const carryForward = Number(student.StudentAccount?.carryForward || 0);

    const overpaid = totalPaid + carryForward - totalRequired;

    const hasExtraDeposit = overpaid > 0;

    res.status(200).json({
      studentId,
      name: student.fullname,
      totalRequired,
      totalPaid,
      carryForward,
      overpaid,
      hasExtraDeposit,
      message: hasExtraDeposit
        ? `Student has deposited extra: $${overpaid}`
        : "No extra deposit found",
    });
  } catch (error) {
    console.error("Error checking deposit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Student Balance Summery

export const getAllStudentAccountSummaries = async (
  _req: Request,
  res: Response
) => {
  try {
    const students = await prisma.student.findMany({
      where: { isdeleted: false, status: "ACTIVE" },
      include: {
        StudentFee: {
          include: {
            PaymentAllocation: {
              include: {
                payment: {
                  select: { discount: true },
                },
              },
            },
          },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
        StudentAccount: true,
      },
    });

    const results = students.map((student) => {
      const monthlyFee = Number(student.fee);
      let totalRequired = 0;
      let totalPaid = 0;
      let totalDiscount = 0;

      const monthSummaries = student.StudentFee.map((fee) => {
        const paid = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.amount),
          0
        );
        const discount = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.payment?.discount || 0),
          0
        );
        const required = monthlyFee;
        const due = Math.max(0, required - paid);

        totalRequired += required;
        totalPaid += paid;
        totalDiscount += discount;

        return {
          month: fee.month,
          year: fee.year,
          required,
          paid,
          discount,
          due,
        };
      });

      const carryForward = Number(student.StudentAccount?.carryForward || 0);
      const overpaid = totalPaid + carryForward - totalRequired;
      const hasExtraDeposit = overpaid > 0;

      return {
        studentId: student.id,
        name: student.fullname,
        monthlyFee,
        monthsGenerated: student.StudentFee.length,
        totalRequired,
        totalPaid,
        totalDiscount,
        carryForward,
        overpaid,
        hasExtraDeposit,
        message: hasExtraDeposit
          ? `Student has deposited extra: $${overpaid}`
          : "No extra deposit found",
        paidMonths: monthSummaries,
      };
    });

    res.status(200).json({
      count: results.length,
      students: results,
    });
  } catch (error) {
    console.error("Error fetching student summaries:", error);
    res.status(500).json({ message: "Server error while processing balances" });
  }
};

export const getCombinedPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { date: "desc" },
      include: {
        student: {
          select: { id: true, fullname: true },
        },
        user: {
          select: { id: true, fullName: true }, // who accepted the payment
        },
        allocations: {
          include: {
            studentFee: {
              select: {
                month: true,
                year: true,
              },
            },
          },
        },
      },
    });

    const result = payments.map((payment) => ({
      paymentId: payment.id,
      studentId: payment.student.id,
      studentName: payment.student.fullname,
      amountPaid: Number(payment.amountPaid),
      discount: Number(payment.discount),
      paidTo: payment.user.fullName,
      date: payment.date,
      allocations: payment.allocations.map((alloc) => ({
        month: alloc.studentFee.month,
        year: alloc.studentFee.year,
        amount: Number(alloc.amount),
      })),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching combined payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// GET /api/income/today

export const getTodayIncome = async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const startDate = new Date(today.setHours(0, 0, 0, 0));
    const endDate = new Date(today.setHours(23, 59, 59, 999));

    // 1. Payments today: amountPaid + discount
    const paymentsToday = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amountPaid: true,
        discount: true,
      },
    });

    const amountPaidToday = paymentsToday.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0
    );

    const totalDiscountToday = paymentsToday.reduce(
      (sum, p) => sum + Number(p.discount),
      0
    );

    // 2. Unpaid balance (excluding discounts)
    const unpaidFees = await prisma.studentFee.findMany({
      where: {
        isPaid: false,
        student: {
          isdeleted: false,
          status: "ACTIVE",
        },
      },
      include: {
        student: {
          select: { fee: true },
        },
        PaymentAllocation: {
          select: { amount: true },
        },
      },
    });

    const unpaidBalance = unpaidFees.reduce((sum, fee) => {
      const expected = Number(fee.student.fee || 0);
      const paid = fee.PaymentAllocation.reduce(
        (s, a) => s + Number(a.amount),
        0
      );
      return sum + Math.max(0, expected - paid);
    }, 0);

    res.status(200).json({
      date: new Date().toISOString().split("T")[0],
      amountPaidToday,
      totalDiscountToday,
      unpaidBalance,
    });
  } catch (error) {
    console.error("Error fetching today's payment summary:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
// GET /api/classes/payment-status

export const getStudentsWithUnpaidFeeMonthly = async (
  req: Request,
  res: Response
) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Both month and year query parameters are required" });
    }

    // 🔹 Get all ACTIVE students
    const students = await prisma.student.findMany({
      where: {
        isdeleted: false,
        status: "ACTIVE",
      },
      include: {
        classes: {
          select: { name: true },
        },
        StudentFee: {
          include: {
            PaymentAllocation: {
              select: { amount: true },
            },
          },
        },
        StudentAccount: true,
      },
    });

    const result: {
      studentId: number;
      name: string;
      className: string;
      currentMonthDue: number;
      currentMonthPaid: number;
      pastUnpaidBalance: number;
      carryForward: number;
      balanceDue: number;
    }[] = [];

    for (const student of students) {
      const feeAmount = Number(student.fee);
      let currentMonthPaid = 0;
      let hasCurrentFee = false;
      let pastUnpaid = 0;

      for (const fee of student.StudentFee) {
        const paid = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.amount),
          0
        );

        // Current month
        if (fee.month === month && fee.year === year) {
          currentMonthPaid = paid;
          hasCurrentFee = true;
        }

        // Past unpaid months
        if (
          fee.isPaid === false &&
          (fee.year < year || (fee.year === year && fee.month < month))
        ) {
          pastUnpaid += Math.max(0, feeAmount - paid);
        }
      }

      const currentMonthDue = hasCurrentFee ? feeAmount : 0;
      const carryForward = Number(student.StudentAccount?.carryForward || 0);
      const balanceDue = Math.max(
        0,
        currentMonthDue + pastUnpaid - currentMonthPaid - carryForward
      );

      result.push({
        studentId: student.id,
        name: student.fullname,
        className: student.classes?.name || "Unknown",
        currentMonthDue,
        currentMonthPaid,
        pastUnpaidBalance: pastUnpaid,
        carryForward,
        balanceDue,
      });
    }

    // 🔹 Build class-level summary
    const classSummaryMap = new Map<
      string,
      {
        className: string;
        totalStudents: number;
        totalRequired: number;
        totalPaid: number;
        totalCarryForward: number;
        totalPastUnpaid: number;
        totalBalanceDue: number;
        percentagePaid: number;
      }
    >();

    for (const s of result) {
      if (!classSummaryMap.has(s.className)) {
        classSummaryMap.set(s.className, {
          className: s.className,
          totalStudents: 0,
          totalRequired: 0,
          totalPaid: 0,
          totalCarryForward: 0,
          totalPastUnpaid: 0,
          totalBalanceDue: 0,
          percentagePaid: 0,
        });
      }

      const summary = classSummaryMap.get(s.className)!;
      summary.totalStudents += 1;
      summary.totalRequired += s.currentMonthDue;
      summary.totalPaid += s.currentMonthPaid;
      summary.totalCarryForward += s.carryForward;
      summary.totalPastUnpaid += s.pastUnpaidBalance;
      summary.totalBalanceDue += s.balanceDue;
    }

    // 🔹 Calculate percentagePaid for each class
    for (const summary of classSummaryMap.values()) {
      const totalExpected = summary.totalRequired + summary.totalPastUnpaid;
      summary.percentagePaid =
        totalExpected > 0
          ? ((summary.totalPaid + summary.totalCarryForward) / totalExpected) *
            100
          : 0;
      summary.percentagePaid = Number(summary.percentagePaid.toFixed(1));
    }

    // 🔹 Convert to array and sort by unpaid balance
    const summary = Array.from(classSummaryMap.values()).sort(
      (a, b) => b.totalBalanceDue - a.totalBalanceDue
    );

    // ✅ Final response
    res.status(200).json({
      month,
      year,
      count: result.length,
      students: result,
      summary,
    });
  } catch (error) {
    console.error("Error calculating monthly unpaid fee summary:", error);
    res.status(500).json({
      message:
        "Internal server error while processing monthly unpaid fee summary",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAllDiscountLogs = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    // Build date filter if month and year are provided
    let whereClause = {};

    if (month && year) {
      const numericMonth = parseInt(month as string) - 1; // JavaScript Date month is 0-based
      const numericYear = parseInt(year as string);

      const startDate = new Date(numericYear, numericMonth, 1);
      const endDate = new Date(numericYear, numericMonth + 1, 1); // First day of next month

      whereClause = {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      };
    }

    const discounts = await prisma.discountLog.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            fullname: true,
          },
        },
        approvedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      message: "Filtered discount logs retrieved successfully",
      discounts,
    });
  } catch (error) {
    console.error("Error fetching filtered discount logs:", error);
    res.status(500).json({
      message: "Failed to retrieve discount logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

type SiblingPaymentSummary = {
  studentId: number;
  name: string;
  paid: number;
  allocations: { studentFeeId: number; amount: number; studentId: number }[];
  discounts: {
    studentFeeId: number;
    studentId: number;
    amount: number;
    reason: string;
    month: number;
    year: number;
    approvedBy: number;
  }[];
  paymentId: number;
};

// export const payFullForMonthByPhone = async (req: Request, res: Response) => {
//   try {
//     const {
//       parentPhone,
//       month,
//       year,
//       discount = 0,
//       discountReason = "",
//       description = "",
//     } = req.body;

//     if (!parentPhone || !month || !year) {
//       return res
//         .status(400)
//         .json({ message: "parentPhone, month, and year are required" });
//     }

//     if (Number(discount) < 0) {
//       return res.status(400).json({ message: "Discount cannot be negative" });
//     }

//     // @ts-ignore - from auth middleware
//     const user = req.user as { useId: number; role?: string };
//     if (!["ADMIN", "USER"].includes(user?.role || "")) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const parent = await prisma.user.findFirst({
//       where: { phoneNumber: parentPhone, role: "PARENT" },
//     });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     const students = await prisma.student.findMany({
//       where: { parentUserId: parent.id, isdeleted: false },
//     });

//     let totalDiscount = Number(discount);
//     const summary: SiblingPaymentSummary[] = [];

//     await prisma.$transaction(async (prisma) => {
//       for (const student of students) {
//         const feeAmount = Number(student.fee);

//         let studentFee = await prisma.studentFee.findUnique({
//           where: {
//             studentId_month_year: {
//               studentId: student.id,
//               month: Number(month),
//               year: Number(year),
//             },
//           },
//         });

//         if (!studentFee) {
//           studentFee = await prisma.studentFee.create({
//             data: {
//               studentId: student.id,
//               month: Number(month),
//               year: Number(year),
//               isPaid: false,
//             },
//           });
//         }

//         if (studentFee.isPaid) continue;

//         const previousAllocations = await prisma.paymentAllocation.aggregate({
//           where: { studentFeeId: studentFee.id },
//           _sum: { amount: true },
//         });

//         const alreadyPaid = Number(previousAllocations._sum.amount || 0);
//         const due = feeAmount - alreadyPaid;
//         if (due <= 0) continue;

//         const applyDiscount = Math.min(due, totalDiscount);
//         const applyPayment = due - applyDiscount;

//         const allocations = [
//           {
//             studentFeeId: studentFee.id,
//             amount: due,
//             studentId: student.id,
//           },
//         ];

//         const discounts =
//           applyDiscount > 0
//             ? [
//                 {
//                   studentFeeId: studentFee.id,
//                   studentId: student.id,
//                   amount: applyDiscount,
//                   reason: discountReason,
//                   month: Number(month),
//                   year: Number(year),
//                   approvedBy: user.useId,
//                 },
//               ]
//             : [];

//         await prisma.studentFee.update({
//           where: { id: studentFee.id },
//           data: { isPaid: true },
//         });

//         const payment = await prisma.payment.create({
//           data: {
//             studentId: student.id,
//             userId: user.useId,
//             amountPaid: applyPayment,
//             discount: applyDiscount,
//             Description: description,
//             allocations: { create: allocations },
//           },
//         });

//         if (discounts.length) {
//           await prisma.discountLog.createMany({ data: discounts });
//           totalDiscount -= applyDiscount;
//         }

//         await prisma.studentAccount.upsert({
//           where: { studentId: student.id },
//           update: { carryForward: 0 },
//           create: { studentId: student.id, carryForward: 0 },
//         });

//         summary.push({
//           studentId: student.id,
//           name: student.fullname,
//           paid: applyPayment,
//           allocations,
//           discounts,
//           paymentId: payment.id,
//         });
//       }
//     });

//     const totalPaid = summary.reduce((sum, s) => sum + s.paid, 0);
//     const totalUsedDiscount = summary.reduce(
//       (sum, s) => sum + s.discounts.reduce((d, i) => d + i.amount, 0),
//       0
//     );

//     // Format month and year for readable message
//     const selectedDate = new Date(Number(year), Number(month) - 1);
//     const formattedMonthYear = selectedDate.toLocaleString("en-US", {
//       month: "long",
//       year: "numeric",
//     });

//     const message =
//       summary.length === 0
//         ? `All fees for ${formattedMonthYear} are already paid — no payment necessary.`
//         : `Full monthly payment for ${formattedMonthYear} processed successfully.`;

//     res.status(200).json({
//       message,
//       parentPhone,
//       month: Number(month),
//       year: Number(year),
//       totalPaid,
//       totalDiscountUsed: totalUsedDiscount,
//       paymentDescription: description,
//       students: summary,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

export const payStudentMonth = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      month,
      year,
      amountPaid,
      discount = 0,
      discountReason = "",
      description = "",
    } = req.body;

    if (!studentId || !month || !year || amountPaid == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // @ts-ignore
    const user = req.user as { useId: number; role?: string };

    if (!user || (user.role !== "ADMIN" && user.role !== "USER")) {
      return res.status(403).json({ message: "Unauthorized user role" });
    }

    const student = await prisma.student.findUnique({
      where: { id: +studentId },
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const feeAmount = Number(student.fee);

    // Find or create the specific fee record
    let studentFee = await prisma.studentFee.findUnique({
      where: {
        studentId_month_year: {
          studentId: +studentId,
          month,
          year,
        },
      },
    });

    if (!studentFee) {
      studentFee = await prisma.studentFee.create({
        data: {
          studentId: +studentId,
          month,
          year,
          isPaid: false,
        },
      });
    }

    // Get amount already paid toward this fee
    const existingAllocations = await prisma.paymentAllocation.findMany({
      where: { studentFeeId: studentFee.id },
    });

    const totalPaid = existingAllocations.reduce(
      (sum, a) => sum + Number(a.amount),
      0
    );
    const due = feeAmount - totalPaid;

    const appliedDiscount = Math.min(discount, due);
    const appliedPayment = Math.min(amountPaid, due - appliedDiscount);

    if (appliedDiscount + appliedPayment <= 0) {
      return res.status(400).json({ message: "Nothing to pay or discount" });
    }

    // Save payment
    const payment = await prisma.payment.create({
      data: {
        studentId: +studentId,
        userId: user.useId,
        amountPaid: appliedPayment,
        discount: appliedDiscount,
        Description: description,
        allocations: {
          create: [
            {
              studentFeeId: studentFee.id,
              amount: appliedDiscount + appliedPayment,
              studentId: +studentId,
            },
          ],
        },
      },
    });

    // Save discount
    if (appliedDiscount > 0) {
      await prisma.discountLog.create({
        data: {
          studentFeeId: studentFee.id,
          studentId: +studentId,
          amount: appliedDiscount,
          reason: discountReason,
          month,
          year,
          approvedBy: user.useId,
        },
      });
    }

    // Update fee as paid if fully covered
    if (totalPaid + appliedPayment + appliedDiscount >= feeAmount) {
      await prisma.studentFee.update({
        where: { id: studentFee.id },
        data: { isPaid: true },
      });
    }

    res.status(201).json({
      message: "Payment successful",
      paymentId: payment.id,
      student: student.fullname,
      paid: appliedPayment,
      discount: appliedDiscount,
      month,
      year,
    });
  } catch (error) {
    console.error("Error in payStudentMonth:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const checkIfPaymentNumberAlreadyUsed = async (
  req: Request,
  res: Response
) => {
  try {
    const { number, method } = req.body;

    if (!number || !method) {
      return res.status(400).json({
        message: "number and method are required",
      });
    }

    const formattedDescription = `${method} - ${number.trim()}`;

    // ✅ Fetch all payments with same description
    const payments = await prisma.payment.findMany({
      where: {
        Description: formattedDescription,
      },
      include: {
        allocations: {
          include: {
            studentFee: true,
            Student: true,
          },
        },
      },
    });

    if (payments.length > 0) {
      const allAllocations = payments.flatMap((p) => p.allocations);

      return res.status(200).json({
        alreadyUsed: true,
        message: `${method} number ${number} was already used.`,
        paymentIds: payments.map((p) => p.id),
        description: formattedDescription,
        createdAt: payments[0].date, // or most recent
        paidFor: allAllocations.map((a) => ({
          student: a.Student?.fullname || "Unknown student",
          month: a.studentFee?.month,
          year: a.studentFee?.year,
          amount: a.amount,
        })),
      });
    }

    return res.status(200).json({
      alreadyUsed: false,
      message: `${method} number ${number} has not been used.`,
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const checkLastPaymentByNumber = async (req: Request, res: Response) => {
  try {
    const { number, method } = req.body;

    if (!number || !method) {
      return res.status(400).json({
        message: "number and method are required",
      });
    }

    const formattedDescription = `${method} - ${number.trim()}`;

    // ✅ Get the latest payment (by createdAt descending)
    const payment = await prisma.payment.findFirst({
      where: {
        Description: formattedDescription,
      },
      orderBy: {
        date: "desc", // or "createdAt" depending on your schema
      },
      include: {
        allocations: {
          include: {
            studentFee: true,
            Student: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(200).json({
        alreadyUsed: false,
        message: `${method} number ${number} has not been used yet.`,
      });
    }

    return res.status(200).json({
      alreadyUsed: true,
      message: `${method} number ${number} was already used.`,
      paymentId: payment.id,
      description: payment.Description,
      createdAt: payment.date, // or payment.createdAt
      paidFor: payment.allocations.map((a) => ({
        student: a.Student?.fullname || "Unknown",
        month: a.studentFee?.month,
        year: a.studentFee?.year,
        amount: a.amount.toString(),
      })),
    });
  } catch (error) {
    console.error("Error checking last payment by number:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);

    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      include: {
        allocations: {
          include: {
            studentFee: {
              select: { month: true, year: true },
            },
          },
        },
      },
    });

    const history = payments.map((payment) => ({
      id: payment.id,
      amountPaid: Number(payment.amountPaid),
      discount: Number(payment.discount),
      date: payment.date,
      allocations: payment.allocations.map((alloc) => ({
        month: alloc.studentFee.month,
        year: alloc.studentFee.year,
        amount: Number(alloc.amount),
      })),
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Error fetching payment history" });
  }
};

export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        studentId: true,
        userId: true,
        amountPaid: true,
        discount: true,
        Description: true,
        date: true,
        student: {
          select: {
            fullname: true,
          },
        },
        allocations: {
          select: {
            id: true,
            paymentId: true,
            studentFeeId: true,
            amount: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Map and format the response
    const cleanedPayments = payments.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      userId: p.userId,
      amountPaid: Number(p.amountPaid),
      discount: Number(p.discount),
      description: p.Description,
      date: p.date,
      fullname: p.student.fullname,
      allocations: p.allocations.map((a) => ({
        ...a,
        amount: Number(a.amount), // Ensure amount is numeric
      })),
    }));

    res.status(200).json({
      message: "Payments retrieved successfully",
      payments: cleanedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to retrieve payments" });
  }
};

// export const updatePayment = async (req: Request, res: Response) => {
//   const paymentId = parseInt(req.params.id);
//   const { amountPaid, discount, Description } = req.body;

//   if (isNaN(paymentId)) {
//     return res.status(400).json({ message: "Invalid payment ID" });
//   }

//   try {
//     const totalAmount = Number(amountPaid) + Number(discount);

//     // Get original payment with student
//     const payment = await prisma.payment.findUnique({
//       where: { id: paymentId },
//       include: {
//         student: true,
//         allocations: {
//           include: { studentFee: true },
//         },
//       },
//     });

//     if (!payment) {
//       return res.status(404).json({ message: "Payment not found" });
//     }

//     const updatedPayment = await prisma.payment.update({
//       where: { id: paymentId },
//       data: {
//         amountPaid: Number(amountPaid),
//         discount: Number(discount),
//         Description: Description ?? "",
//       },
//     });

//     // ✅ Update allocations if needed
//     const allocations = payment.allocations;
//     if (allocations.length > 0) {
//       const newAmount = totalAmount / allocations.length;

//       await Promise.all(
//         allocations.map((alloc) =>
//           prisma.paymentAllocation.update({
//             where: { id: alloc.id },
//             data: { amount: newAmount },
//           })
//         )
//       );
//     }

//     // ✅ Update related DiscountLog (only for current month/year)
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const currentYear = now.getFullYear();

//     await prisma.discountLog.updateMany({
//       where: {
//         studentId: payment.studentId,
//         month: currentMonth,
//         year: currentYear,
//       },
//       data: {
//         amount: Number(discount),
//         reason: Description ?? "Updated with payment",
//         verified: true,
//         verifiedAt: new Date(),
//         verifiedBy: "System",
//       },
//     });

//     return res.status(200).json({
//       message: "Payment, allocations, and discount log updated successfully",
//       updatedPayment,
//     });
//   } catch (error) {
//     console.error("Error updating payment:", error);
//     return res.status(500).json({ message: "Failed to update payment" });
//   }
// };
export const updatePayment = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  const { amountPaid, discount, Description } = req.body;

  if (isNaN(paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID" });
  }

  try {
    const totalAmount = Number(amountPaid) + Number(discount);

    // Step 1: Get original payment with student info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const studentId = payment.studentId;

    // Step 2: Update the payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amountPaid: Number(amountPaid),
        discount: Number(discount),
        Description: Description ?? "",
      },
    });

    // Step 3: Delete old allocations
    await prisma.paymentAllocation.deleteMany({
      where: { paymentId },
    });

    // Step 4: Reset all student fees (to make allocation accurate)
    await prisma.studentFee.updateMany({
      where: { studentId },
      data: { isPaid: false },
    });

    // Step 5: Allocate new payment to unpaid fees in order
    let remaining = totalAmount;

    const fees = await prisma.studentFee.findMany({
      where: { studentId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    for (const fee of fees) {
      if (remaining <= 0) break;

      const due = Number(fee.student_fee);
      const toAllocate = Math.min(remaining, due);

      await prisma.paymentAllocation.create({
        data: {
          paymentId,
          studentFeeId: fee.id,
          amount: toAllocate,
        },
      });

      await prisma.studentFee.update({
        where: { id: fee.id },
        data: {
          isPaid: toAllocate === due,
        },
      });

      remaining -= toAllocate;
    }

    // Step 6: Update discount log for current month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await prisma.discountLog.updateMany({
      where: {
        studentId,
        month: currentMonth,
        year: currentYear,
      },
      data: {
        amount: Number(discount),
        reason: Description ?? "Updated with payment",
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: "System",
      },
    });

    return res.status(200).json({
      message: "Payment updated and balance recalculated",
      updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return res.status(500).json({ message: "Failed to update payment" });
  }
};

export const getFamilyBalanceByPhone = async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string | undefined;
    const familyName = req.query.familyName as string | undefined;

    if (!phone && !familyName) {
      return res
        .status(400)
        .json({ message: "Phone or familyName is required" });
    }

    let parent;

    // 🔍 Try to get parent by phone number
    if (phone) {
      parent = await prisma.user.findFirst({
        where: {
          phoneNumber: phone,
          role: "PARENT",
        },
      });
    }

    // 🔍 If not found and familyName is provided, try getting via student
    if (!parent && familyName) {
      const student = await prisma.student.findFirst({
        where: {
          familyName: familyName,
          isdeleted: false,
        },
      });

      if (student && student.parentUserId !== null) {
        parent = await prisma.user.findUnique({
          where: {
            id: student.parentUserId,
          },
        });
      }
    }

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const students = await prisma.student.findMany({
      where: {
        parentUserId: parent.id,
        isdeleted: false,
      },
    });

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No students found for this parent" });
    }

    let familyBalance = 0;
    const studentBalances: {
      studentId: number;
      fullname: string;
      balance: number;
      months: { month: number; year: number; due: number }[];
    }[] = [];

    for (const student of students) {
      const unpaidFees = await prisma.studentFee.findMany({
        where: {
          studentId: student.id,
          isPaid: false,
        },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });

      const allocationSums = await prisma.paymentAllocation.groupBy({
        by: ["studentFeeId"],
        where: {
          studentFeeId: { in: unpaidFees.map((f) => f.id) },
        },
        _sum: { amount: true },
      });

      const paidMap = new Map(
        allocationSums.map((a) => [a.studentFeeId, Number(a._sum.amount || 0)])
      );

      const feeAmount = Number(student.fee);
      let studentTotal = 0;
      const months: { month: number; year: number; due: number }[] = [];

      for (const fee of unpaidFees) {
        const paid = paidMap.get(fee.id) || 0;
        const due = Math.max(feeAmount - paid, 0);

        if (due > 0) {
          months.push({
            month: fee.month,
            year: fee.year,
            due: due,
          });
          studentTotal += due;
        }
      }

      familyBalance += studentTotal;

      studentBalances.push({
        studentId: student.id,
        fullname: student.fullname,
        balance: studentTotal,
        months,
      });
    }

    return res.status(200).json({
      parentName: parent.fullName,
      phone: parent.phoneNumber,
      totalFamilyBalance: familyBalance,
      students: studentBalances,
    });
  } catch (error) {
    console.error("Error getting family balance:", error);
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const payFullForMonthByPhone = async (req: Request, res: Response) => {
  try {
    const {
      parentPhone,
      familyName,
      month,
      year,
      discount = 0,
      discountReason = "",
      description = "",
    } = req.body;

    if ((!parentPhone && !familyName) || !month || !year) {
      return res.status(400).json({
        message: "parentPhone or familyName, and month/year are required.",
      });
    }

    if (Number(discount) < 0) {
      return res.status(400).json({ message: "Discount cannot be negative" });
    }

    // @ts-ignore - from auth middleware
    const user = req.user as { useId: number; role?: string };
    if (!["ADMIN", "USER"].includes(user?.role || "")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Get parent by phone or student family name
    let parent;

    if (parentPhone) {
      parent = await prisma.user.findFirst({
        where: { phoneNumber: parentPhone, role: "PARENT" },
      });
    } else if (familyName) {
      const studentWithFamily = await prisma.student.findFirst({
        where: {
          familyName: { contains: familyName, mode: "insensitive" },
          isdeleted: false,
          parentUserId: { not: null },
        },
        include: {
          parentUser: true,
        },
      });

      if (studentWithFamily?.parentUser?.role === "PARENT") {
        parent = studentWithFamily.parentUser;
      }
    }

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const students = await prisma.student.findMany({
      where: { parentUserId: parent.id, isdeleted: false },
    });

    let totalDiscount = Number(discount);
    const summary: SiblingPaymentSummary[] = [];

    await prisma.$transaction(async (prisma) => {
      for (const student of students) {
        const feeAmount = Number(student.fee);

        let studentFee = await prisma.studentFee.findUnique({
          where: {
            studentId_month_year: {
              studentId: student.id,
              month: Number(month),
              year: Number(year),
            },
          },
        });

        if (!studentFee) {
          studentFee = await prisma.studentFee.create({
            data: {
              studentId: student.id,
              month: Number(month),
              year: Number(year),
              isPaid: false,
            },
          });
        }

        if (studentFee.isPaid) continue;

        const previousAllocations = await prisma.paymentAllocation.aggregate({
          where: { studentFeeId: studentFee.id },
          _sum: { amount: true },
        });

        const alreadyPaid = Number(previousAllocations._sum.amount || 0);
        const due = feeAmount - alreadyPaid;
        if (due <= 0) continue;

        const applyDiscount = Math.min(due, totalDiscount);
        const applyPayment = due - applyDiscount;

        const allocations = [
          {
            studentFeeId: studentFee.id,
            amount: due,
            studentId: student.id,
          },
        ];

        const discounts =
          applyDiscount > 0
            ? [
                {
                  studentFeeId: studentFee.id,
                  studentId: student.id,
                  amount: applyDiscount,
                  reason: discountReason,
                  month: Number(month),
                  year: Number(year),
                  approvedBy: user.useId,
                },
              ]
            : [];

        await prisma.studentFee.update({
          where: { id: studentFee.id },
          data: { isPaid: true },
        });

        const payment = await prisma.payment.create({
          data: {
            studentId: student.id,
            userId: user.useId,
            amountPaid: applyPayment,
            discount: applyDiscount,
            Description: description,
            allocations: { create: allocations },
          },
        });

        if (discounts.length) {
          await prisma.discountLog.createMany({ data: discounts });
          totalDiscount -= applyDiscount;
        }

        await prisma.studentAccount.upsert({
          where: { studentId: student.id },
          update: { carryForward: 0 },
          create: { studentId: student.id, carryForward: 0 },
        });

        summary.push({
          studentId: student.id,
          name: student.fullname,
          paid: applyPayment,
          allocations,
          discounts,
          paymentId: payment.id,
        });
      }
    });

    const totalPaid = summary.reduce((sum, s) => sum + s.paid, 0);
    const totalUsedDiscount = summary.reduce(
      (sum, s) => sum + s.discounts.reduce((d, i) => d + i.amount, 0),
      0
    );

    const selectedDate = new Date(Number(year), Number(month) - 1);
    const formattedMonthYear = selectedDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const message =
      summary.length === 0
        ? `All fees for ${formattedMonthYear} are already paid — no payment necessary.`
        : `Full monthly payment for ${formattedMonthYear} processed successfully.`;

    res.status(200).json({
      message,
      parentPhone: parent.phoneNumber,
      parentName: parent.fullName,
      month: Number(month),
      year: Number(year),
      totalPaid,
      totalDiscountUsed: totalUsedDiscount,
      paymentDescription: description,
      students: summary,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const payFullForMonthByStudent = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      month,
      year,
      discount = 0,
      discountReason = "",
      description = "",
    } = req.body;

    if (!studentId || !month || !year) {
      return res.status(400).json({
        message: "studentId, month and year are required.",
      });
    }

    if (Number(discount) < 0) {
      return res.status(400).json({ message: "Discount cannot be negative" });
    }

    // @ts-ignore - from auth middleware
    const user = req.user as { useId: number; role?: string };
    if (!["ADMIN", "USER"].includes(user?.role || "")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId, isdeleted: false },
      include: { parentUser: true },
    });

    if (
      !student ||
      !student.parentUser ||
      student.parentUser.role !== "PARENT"
    ) {
      return res.status(404).json({ message: "Student or parent not found" });
    }

    const feeAmount = Number(student.fee);

    let studentFee = await prisma.studentFee.findUnique({
      where: {
        studentId_month_year: {
          studentId: student.id,
          month: Number(month),
          year: Number(year),
        },
      },
    });

    if (!studentFee) {
      studentFee = await prisma.studentFee.create({
        data: {
          studentId: student.id,
          month: Number(month),
          year: Number(year),
          isPaid: false,
        },
      });
    }

    if (studentFee.isPaid) {
      return res
        .status(200)
        .json({ message: "Fee already paid for this month." });
    }

    const previousAllocations = await prisma.paymentAllocation.aggregate({
      where: { studentFeeId: studentFee.id },
      _sum: { amount: true },
    });

    const alreadyPaid = Number(previousAllocations._sum.amount || 0);
    const due = feeAmount - alreadyPaid;
    if (due <= 0) {
      return res.status(200).json({ message: "No fee due for this student." });
    }

    const applyDiscount = Math.min(due, discount);
    const applyPayment = due - applyDiscount;

    const allocation = {
      studentFeeId: studentFee.id,
      amount: due,
      studentId: student.id,
    };

    const discountEntry =
      applyDiscount > 0
        ? {
            studentFeeId: studentFee.id,
            studentId: student.id,
            amount: applyDiscount,
            reason: discountReason,
            month: Number(month),
            year: Number(year),
            approvedBy: user.useId,
          }
        : null;

    await prisma.$transaction(async (prisma) => {
      await prisma.studentFee.update({
        where: { id: studentFee.id },
        data: { isPaid: true },
      });

      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          userId: user.useId,
          amountPaid: applyPayment,
          discount: applyDiscount,
          Description: description,
          allocations: { create: [allocation] },
        },
      });

      if (discountEntry) {
        await prisma.discountLog.create({ data: discountEntry });
      }

      await prisma.studentAccount.upsert({
        where: { studentId: student.id },
        update: { carryForward: 0 },
        create: { studentId: student.id, carryForward: 0 },
      });

      res.status(200).json({
        message: `Full payment processed for ${student.fullname} (${month}/${year}).`,
        studentId: student.id,
        studentName: student.fullname,
        parentPhone: student.phone,
        paidAmount: applyPayment,
        discountUsed: applyDiscount,
        month: Number(month),
        year: Number(year),
        paymentDescription: description,
        paymentId: payment.id,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const searchStudentsByNameOrId = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res
        .status(400)
        .json({ message: "Query parameter 'query' is required" });
    }

    let studentRecords: any[] = [];
    let parentData = {
      parentName: "",
      phone: "",
    };

    if (/^\d+$/.test(query.trim())) {
      // Search by student ID
      const studentData = await prisma.student.findFirst({
        where: {
          id: Number(query.trim()),
          isdeleted: false,
        },
        include: {
          parentUser: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
          StudentFee: {
            where: { isPaid: false },
            include: { PaymentAllocation: true },
          },
        },
      });

      if (!studentData) {
        return res
          .status(404)
          .json({ message: "No student found with this ID" });
      }

      studentRecords = [studentData];

      parentData = {
        parentName: studentData.parentUser?.fullName || "",
        phone: studentData.parentUser?.phoneNumber || "",
      };
    } else {
      // Search by name - get all matches
      studentRecords = await prisma.student.findMany({
        where: {
          fullname: {
            contains: query.trim(),
            mode: "insensitive",
          },
          isdeleted: false,
        },
        include: {
          parentUser: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
          StudentFee: {
            where: { isPaid: false },
            include: { PaymentAllocation: true },
          },
        },
        orderBy: { fullname: "asc" },
      });

      if (!studentRecords.length) {
        return res
          .status(404)
          .json({ message: "No students found matching this name" });
      }

      // Pick parent info from the first student
      const firstStudent = studentRecords[0];
      parentData = {
        parentName: firstStudent.parentUser?.fullName || "",
        phone: firstStudent.parentUser?.phoneNumber || "",
      };
    }

    let totalBalance = 0;
    const studentsResponse = studentRecords.map((student) => {
      const feeAmount = Number(student.fee) || 0;
      let balance = 0;
      const months: { month: number; year: number; due: number }[] = [];

      student.StudentFee.forEach(
        (fee: {
          month: number;
          year: number;
          PaymentAllocation: { amount: number | string | null }[];
        }) => {
          const paid = fee.PaymentAllocation.reduce(
            (sum: number, alloc: { amount: number | string | null }) =>
              sum + (Number(alloc.amount) || 0),
            0
          );
          const due = Math.max(0, feeAmount - paid);
          if (due > 0) {
            balance += due;
            months.push({
              month: fee.month,
              year: fee.year,
              due: due,
            });
          }
        }
      );

      totalBalance += balance;

      return {
        studentId: student.id,
        fullname: student.fullname,
        balance,
        months,
      };
    });

    const response = {
      parentName: parentData.parentName,
      phone: parentData.phone,
      totalFamilyBalance: totalBalance,
      students: studentsResponse,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// controllers/payment.controller.ts

export const getUserPaymentCollections = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "PARENT", // ✅ Exclude PARENT role
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: { id: "asc" },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const payments = await prisma.payment.findMany({
          where: { userId: user.id },
          include: {
            student: { select: { fullname: true } },
            allocations: {
              include: {
                studentFee: {
                  select: { month: true, year: true },
                },
              },
            },
          },
          orderBy: { date: "desc" },
        });

        const totalPaid = payments.reduce(
          (sum, p) => sum + Number(p.amountPaid),
          0
        );
        const totalDiscount = payments.reduce(
          (sum, p) => sum + Number(p.discount),
          0
        );

        const studentPayments = payments.map((payment) => ({
          studentName: payment.student.fullname,
          amountPaid: Number(payment.amountPaid),
          discount: Number(payment.discount),
          description: payment.Description,
          date: payment.date,
          allocations: payment.allocations.map((a) => ({
            month: a.studentFee?.month,
            year: a.studentFee?.year,
          })),
        }));

        return {
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          totalPaid,
          totalDiscount,
          totalTransactions: payments.length,
          studentPayments,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching user payment collections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/payments/by-student

export const getAllPaymentsByStudentId = async (
  req: Request,
  res: Response
) => {
  const { studentId } = req.body;

  try {
    const payments = await prisma.payment.findMany({
      where: {
        studentId: Number(studentId),
      },
      include: {
        student: {
          select: {
            fullname: true,
            phone: true,
            classes: {
              // ✅ use correct relation name here
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching student payments:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// export const getStudentsWithBalancesAndDueMonths = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         status: "ACTIVE",
//       },
//       include: {
//         classes: { select: { name: true } },
//         StudentFee: {
//           where: { isPaid: false },
//           include: {
//             PaymentAllocation: { select: { amount: true } },
//           },
//           orderBy: [{ year: "asc" }, { month: "asc" }],
//         },
//         StudentAccount: true,
//       },
//     });

//     const result = [];

//     for (const student of students) {
//       const monthlyFee = Number(student.fee);
//       let totalBalance = 0;
//       const monthsDue: { month: number; year: number; due: number }[] = [];

//       for (const fee of student.StudentFee) {
//         const totalPaid = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         const due = Math.max(0, monthlyFee - totalPaid);
//         if (due > 0) {
//           monthsDue.push({
//             month: fee.month,
//             year: fee.year,
//             due,
//           });
//           totalBalance += due;
//         }
//       }

//       const carryForward = Number(student.StudentAccount?.carryForward || 0);
//       const finalBalance = Math.max(0, totalBalance - carryForward);

//       if (finalBalance > 0) {
//         result.push({
//           studentId: student.id,
//           fullname: student.fullname,
//           className: student.classes?.name || "N/A",
//           balance: finalBalance,
//           carryForward,
//           monthsDue,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       students: result,
//     });
//   } catch (error) {
//     console.error("Error fetching student balances with months:", error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// export const addTwoDollarToStudentFees = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     // Fetch all active students who are not deleted and have a fee > 0
//     const studentsToUpdate = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         fee: {
//           gt: 0, // Skip students with fee 0
//         },
//       },
//       select: {
//         id: true,
//         fee: true,
//       },
//     });

//     let updatedCount = 0;

//     for (const student of studentsToUpdate) {
//       await prisma.student.update({
//         where: { id: student.id },
//         data: {
//           fee: student.fee + 2, // Add $2 to the current fee
//         },
//       });
//       updatedCount++;
//     }

//     res.status(200).json({
//       message: `${updatedCount} students' fees were updated by $2.`,
//     });
//   } catch (error) {
//     console.error("Fee Update Error:", error);
//     res.status(500).json({
//       message: "Failed to update student fees.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
// export const getStudentsWithBalancesAndDueMonths = async (_req: Request, res: Response) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: { isdeleted: false, status: "ACTIVE" },
//       include: {
//         classes: { select: { name: true } },
//         StudentFee: {
//           where: { isPaid: false },
//           include: { PaymentAllocation: { select: { amount: true } } },
//           orderBy: [{ year: "asc" }, { month: "asc" }],
//         },
//         StudentAccount: true,
//       },
//     });

//     const result: Array<{
//       studentId: number;
//       fullname: string;
//       className: string;
//       phone: string;
//       balance: number;
//       monthsDue: { month: number; year: number; due: number }[];
//     }> = [];

//     for (const student of students) {
//       const monthlyFee = Number(student.fee);
//       let totalBalance = 0;
//       const monthsDue: { month: number; year: number; due: number }[] = [];

//       for (const fee of student.StudentFee) {
//         const totalPaid = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         const due = Math.max(0, monthlyFee - totalPaid);
//         if (due > 0) {
//           monthsDue.push({ month: fee.month, year: fee.year, due });
//           totalBalance += due;
//         }
//       }

//       const carryForward = Number(student.StudentAccount?.carryForward || 0);
//       const finalBalance = Math.max(0, totalBalance - carryForward);

//       if (finalBalance > 0) {
//         result.push({
//           studentId: student.id,
//           fullname: student.fullname,
//           className: student.classes?.name || "N/A",
//           phone: student.phone, // <-- swapped in
//           balance: finalBalance,
//           monthsDue,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       students: result,
//     });
//   } catch (error) {
//     console.error("Error fetching student balances with months:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const getStudentsWithBalancesAndDueMonths = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        isdeleted: false,
        status: "ACTIVE",
      },
      include: {
        classes: { select: { name: true } },
        StudentFee: {
          where: { isPaid: false },
          include: {
            PaymentAllocation: { select: { amount: true } },
          },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
        StudentAccount: true,
      },
    });

    const result: Array<{
      studentId: number;
      fullname: string;
      className: string;
      phone1: string;
      phone2: string | null;
      balance: number;
      monthsDue: { month: number; year: number; due: number }[];
    }> = [];

    for (const student of students) {
      const monthlyFee = Number(student.fee);
      let totalBalance = 0;
      const monthsDue: { month: number; year: number; due: number }[] = [];

      for (const fee of student.StudentFee) {
        const totalPaid = fee.PaymentAllocation.reduce(
          (sum, alloc) => sum + Number(alloc.amount),
          0
        );

        const due = Math.max(0, monthlyFee - totalPaid);
        if (due > 0) {
          monthsDue.push({
            month: fee.month,
            year: fee.year,
            due,
          });
          totalBalance += due;
        }
      }

      // Carry forward still used internally
      const carryForward = Number(student.StudentAccount?.carryForward || 0);
      const finalBalance = Math.max(0, totalBalance - carryForward);

      if (finalBalance > 0) {
        result.push({
          studentId: student.id,
          fullname: student.fullname,
          className: student.classes?.name || "N/A",
          phone1: student.phone,        // primary phone
          phone2: student.phone2 || "", // secondary phone (or empty string if null)
          balance: finalBalance,
          monthsDue,
        });
      }
    }

    res.status(200).json({
      count: result.length,
      students: result,
    });
  } catch (error) {
    console.error("Error fetching student balances with months:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const addTwoDollarToStudentFees = async (
  req: Request,
  res: Response
) => {
  try {
    // Fetch all active students who are not deleted and have a fee > 0
    const studentsToUpdate = await prisma.student.findMany({
      where: {
        isdeleted: false,
        fee: {
          gt: 0, // Skip students with fee 0
        },
      },
      select: {
        id: true,
        fee: true,
      },
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const student of studentsToUpdate) {
      if (student.fee < 27) {
        // Calculate new fee, capped at 27
        const newFee = Math.min(student.fee + 2, 27);

        await prisma.student.update({
          where: { id: student.id },
          data: { fee: newFee },
        });
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    res.status(200).json({
      message: `${updatedCount} students' fees were updated (up to $27). ${skippedCount} students were skipped because their fee is already $27.`,
    });
  } catch (error) {
    console.error("Fee Update Error:", error);
    res.status(500).json({
      message: "Failed to update student fees.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const addFiveDollarToNoBusStudents = async (
  req: Request,
  res: Response
) => {
  try {
    const studentsToUpdate = await prisma.student.findMany({
      where: {
        isdeleted: false,
        OR: [{ bus: null }, { bus: "" }],
      },
      select: {
        id: true,
        fee: true,
      },
    });

    let updatedCount = 0;

    for (const student of studentsToUpdate) {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          fee: student.fee + 5,
        },
      });
      updatedCount++;
    }

    res.status(200).json({
      message: `${updatedCount} students without a bus were charged an additional $5.`,
    });
  } catch (error) {
    console.error("Bus Fee Update Error:", error);
    res.status(500).json({
      message: "Failed to add $5 to students without bus.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// controller/familyController.ts

// controller/familyController.ts
// controller/familyController.ts

// export const getUnpaidFamiliesWithStudentBalances = async (
//   _req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         status: "ACTIVE",
//         StudentFee: {
//           some: { isPaid: false },
//         },
//       },
//       include: {
//         classes: { select: { name: true } },
//         StudentFee: {
//           where: { isPaid: false },
//           include: {
//             PaymentAllocation: { select: { amount: true } },
//           },
//           orderBy: [{ year: "asc" }, { month: "asc" }],
//         },
//         StudentAccount: true,
//       },
//     });

//     const familyMap = new Map<
//       string,
//       {
//         familyName: string;
//         phones: Set<string>;
//         totalBalance: number;
//         students: {
//           studentId: number;
//           fullname: string;
//           className: string;
//           balance: number;
//           monthsDue: { month: number; year: number; due: number }[];
//         }[];
//       }
//     >();

//     for (const student of students) {
//       const monthlyFee = Number(student.fee);
//       let totalBalance = 0;
//       const monthsDue: { month: number; year: number; due: number }[] = [];

//       for (const fee of student.StudentFee) {
//         const totalPaid = fee.PaymentAllocation.reduce(
//           (sum, alloc) => sum + Number(alloc.amount),
//           0
//         );

//         const due = Math.max(0, monthlyFee - totalPaid);
//         if (due > 0) {
//           monthsDue.push({ month: fee.month, year: fee.year, due });
//           totalBalance += due;
//         }
//       }

//       const carryForward = Number(student.StudentAccount?.carryForward || 0);
//       const finalBalance = Math.max(0, totalBalance - carryForward);
//       if (finalBalance === 0) continue;

//       const familyName = student.familyName || "Unknown Family";
//       const phones = [student.phone, student.phone2].filter(Boolean);

//       if (!familyMap.has(familyName)) {
//         familyMap.set(familyName, {
//           familyName,
//           phones: new Set<string>(),
//           totalBalance: 0,
//           students: [],
//         });
//       }

//       const family = familyMap.get(familyName)!;
//       phones.forEach((p) => family.phones.add(p!));
//       family.totalBalance += finalBalance;

//       family.students.push({
//         studentId: student.id,
//         fullname: student.fullname,
//         className: student.classes?.name || "N/A",
//         balance: finalBalance,
//         monthsDue,
//       });
//     }

//     const families = Array.from(familyMap.values()).map((f) => ({
//       familyName: f.familyName,
//       phones: Array.from(f.phones),
//       totalBalance: f.totalBalance,
//       students: f.students,
//     }));

//     res.status(200).json({
//       count: families.length,
//       families,
//     });
//   } catch (error) {
//     console.error("Error fetching unpaid families with balances:", error);
//     res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// controller/fee/getUnpaidFamiliesGroupedByParent.ts

// Example: src/controllers/unpaidFamily.controller.ts
// import { joinPhones, feeOrFallback } from "../prisma/utlis/prisma-utils";

// export const getUnpaidFamiliesGroupedByParent = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         StudentFee: { some: { isPaid: false } },
//       },
//       include: {
//         StudentFee: {
//           where: { isPaid: false },
//           select: { month: true, year: true, student_fee: true },
//         },
//         parentUser: { select: { id: true, fullName: true, phoneNumber: true } },
//         classes: { select: { name: true } },
//       },
//     });

//     const families = new Map<number, any>();

//     for (const s of students) {
//       if (!s.parentUserId) continue;

//       const balance = s.StudentFee.reduce(
//         (acc, f) => acc + feeOrFallback(f.student_fee, s.fee),
//         0
//       );

//       const studentData = {
//         id: s.id,
//         fullname: s.fullname,
//         className: s.classes?.name ?? "",
//         unpaidFees: s.StudentFee.map((f) => ({
//           month: f.month,
//           year: f.year,
//           student_fee: feeOrFallback(f.student_fee, s.fee).toString(),
//         })),
//         balance,
//       };

//       const fam = families.get(s.parentUserId);
//       if (fam) {
//         fam.totalBalance += balance;
//         fam.students.push(studentData);
//       } else {
//         const phones = joinPhones([
//           s.parentUser?.phoneNumber,
//           s.phone,
//           s.phone2,
//         ]);
//         families.set(s.parentUserId, {
//           familyName:
//             s.familyName ?? s.parentUser?.fullName ?? "Unknown Family",
//           phones: phones ? phones.split(", ") : [],
//           totalBalance: balance,
//           students: [studentData],
//         });
//       }
//     }

//     // only keep families with balance > 0
//     const result = Array.from(families.values()).filter(
//       (f) => f.totalBalance > 0
//     );
//     return res.json({ families: result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// import { joinPhones, feeOrFallback } from "../prisma/utlis/prisma-utils";

// export const getUnpaidFamiliesGroupedByParent = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         StudentFee: { some: { isPaid: false } },
//       },
//       include: {
//         StudentFee: {
//           where: { isPaid: false },
//           select: { month: true, year: true, student_fee: true },
//         },
//         parentUser: { select: { id: true, fullName: true, phoneNumber: true } },
//         classes: { select: { name: true } },
//       },
//     });

//     const families = new Map<number, any>();

//     for (const s of students) {
//       if (!s.parentUserId) continue;

//       const balance = s.StudentFee.reduce(
//         (acc, f) => acc + feeOrFallback(f.student_fee, s.fee),
//         0
//       );

//       const studentData = {
//         id: s.id,
//         fullname: s.fullname,
//         className: s.classes?.name ?? "",
//         unpaidFees: s.StudentFee.map((f) => ({
//           month: f.month,
//           year: f.year,
//           student_fee: feeOrFallback(f.student_fee, s.fee).toString(),
//         })),
//         balance,
//       };

//       const fam = families.get(s.parentUserId);
//       if (fam) {
//         fam.totalBalance += balance;
//         fam.students.push(studentData);
//       } else {
//         const phones = joinPhones([
//           s.parentUser?.phoneNumber,
//           s.phone,
//           s.phone2,
//         ]);
//         families.set(s.parentUserId, {
//           familyName:
//             s.familyName ?? s.parentUser?.fullName ?? "Unknown Family",
//           phones: phones ? phones.split(", ") : [],
//           totalBalance: balance,
//           students: [studentData],
//         });
//       }
//     }

//     // only keep families with balance > 0
//     const result = Array.from(families.values()).filter(
//       (f) => f.totalBalance > 0
//     );
//     return res.json({ families: result });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({ message: "Internal server error" });
//   }

// };

// src/controllers/familyController.ts

import {


  feeOrFallback, // still useful elsewhere, but we'll be explicit below
 
  sumNumbers,
} from "../prisma/utlis/prisma-utils";

/**
 * GET /api/families/unpaid
 *
 * Returns families with students who have unpaid StudentFee rows (isPaid=false),
 * subtracting per-month discounts (from DiscountLog.amount) **ONLY** when
 * the monthly fee is not explicitly set (i.e., StudentFee.student_fee is NULL).
 *
 * Response matches your frontend format:
 * {
 *   families: [{
 *     familyName, phones[], totalBalance,
 *     students: [{
 *       id, fullname, className, balance,
 *       unpaidFees: [{ month, year, student_fee }]
 *     }]
 *   }]
 * }
 */
// export const getUnpaidFamiliesGroupedByParent = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const students = await prisma.student.findMany({
//       where: {
//         isdeleted: false,
//         parentUserId: { not: null },
//         StudentFee: { some: { isPaid: false } },
//       },
//       select: {
//         id: true,
//         fullname: true,
//         fee: true,
//         phone: true,
//         phone2: true,
//         familyName: true,
//         parentUserId: true,

//         classes: { select: { name: true } },

//         parentUser: { select: { id: true, fullName: true, phoneNumber: true } },

//         // Unpaid monthly rows
//         StudentFee: {
//           where: { isPaid: false },
//           select: { month: true, year: true, student_fee: true },
//         },

//         // Discount rows (may include multiple entries per month)
//         DiscountLog: {
//           select: { month: true, year: true, amount: true },
//         },
//       },
//     });

//     type Family = {
//       familyName: string;
//       phones: string[];
//       totalBalance: number;
//       students: {
//         id: number;
//         fullname: string;
//         className: string;
//         balance: number;
//         unpaidFees: { month: number; year: number; student_fee: string }[];
//       }[];
//     };

//     const families = new Map<number, Family>();

//     for (const s of students) {
//       // Sum all discounts per (month,year) for this student
//       const discountMap = new Map<string, number>();
//       for (const d of s.DiscountLog) {
//         const key = `${d.month}-${d.year}`;
//         discountMap.set(key, (discountMap.get(key) || 0) + toNumber(d.amount));
//       }

//       // Build unpaid fee rows in the exact shape your frontend expects
//       const unpaidFees = s.StudentFee
//         .map((f) => {
//           const key = `${f.month}-${f.year}`;

//           const monthlyHasExplicitFee = f.student_fee !== null && f.student_fee !== undefined;

//           // If the monthly fee is explicitly set, treat it as the final monthly fee (already adjusted),
//           // so DO NOT subtract DiscountLog again (prevents double-discount).
//           const baseFee = monthlyHasExplicitFee ? toNumber(f.student_fee) : toNumber(s.fee);

//           // Only apply discount when monthly fee is NOT explicitly set.
//           const discountToApply = monthlyHasExplicitFee ? 0 : toNumber(discountMap.get(key));
//           const discountApplied = Math.min(baseFee, discountToApply);

//           const netDue = Math.max(0, baseFee - discountApplied);

//           return {
//             month: f.month,
//             year: f.year,
//             student_fee: netDue.toString(), // frontend expects string
//           };
//         })
//         // Hide fully covered months
//         .filter((row) => row.student_fee !== "0");

//       const balance = sumNumbers(unpaidFees.map((r) => r.student_fee));
//       if (balance <= 0) continue;

//       const studentData = {
//         id: s.id,
//         fullname: s.fullname,
//         className: s.classes?.name ?? "",
//         unpaidFees,
//         balance,
//       };

//       const parentId = s.parentUserId!;
//       if (families.has(parentId)) {
//         const fam = families.get(parentId)!;
//         fam.totalBalance += balance;
//         fam.students.push(studentData);
//       } else {
//         const phones = joinPhones([s.parentUser?.phoneNumber, s.phone, s.phone2]);
//         families.set(parentId, {
//           familyName: s.familyName ?? s.parentUser?.fullName ?? "Unknown Family",
//           phones: phones ? phones.split(", ") : [],
//           totalBalance: balance,
//           students: [studentData],
//         });
//       }
//     }

//     const result = Array.from(families.values())
//       .filter((f) => f.totalBalance > 0)
//       .sort((a, b) => b.totalBalance - a.totalBalance);

//     return res.json({ families: result });
//   } catch (e) {
//     console.error("Error fetching unpaid families:", e);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };




// controllers/paymentController.ts


/** ---------- helpers ---------- */
const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const sum = (vals: number[]) => vals.reduce((s, v) => s + v, 0);
const joinPhones = (vals: Array<string | null | undefined>) => {
  const uniq = Array.from(
    new Set(
      vals
        .map((v) => (v || "").trim())
        .filter((v) => v.length > 0)
    )
  );
  return uniq.join(", ");
};
/** ----------------------------- */

type UnpaidFeeRow = { month: number; year: number; student_fee: string };

type Family = {
  familyName: string;
  phones: string[];
  totalBalance: number;
  students: {
    id: number;
    fullname: string;
    className: string;
    balance: number;            // numeric for safe math
    unpaidFees: UnpaidFeeRow[]; // student_fee remains string for FE contract
  }[];
};

export const getUnpaidFamiliesGroupedByParent = async (
  req: Request,
  res: Response
) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        isdeleted: false,
        parentUserId: { not: null },
        StudentFee: { some: { isPaid: false } },
      },
      select: {
        id: true,
        fullname: true,
        fee: true,            // ✅ use this as the ONLY base monthly fee
        phone: true,
        phone2: true,
        familyName: true,
        parentUserId: true,

        classes: { select: { name: true } },

        parentUser: { select: { id: true, fullName: true, phoneNumber: true } },

        // Unpaid monthly rows + allocations (payments only)
        StudentFee: {
          where: { isPaid: false },
          select: {
            month: true,
            year: true,
            // ⚠️ Intentionally NOT using student_fee here (we ignore it)
            PaymentAllocation: {
              select: { amount: true },
            },
          },
        },

        // 🚫 No DiscountLog — discounts are ignored entirely
      },
    });

    const families = new Map<number, Family>();

    for (const s of students) {
      // Build per-month unpaid rows:
      // netDue = student.fee (ONLY) - allocations (NO DISCOUNTS, NO student_fee)
      const unpaidFeeRows = s.StudentFee.map((f) => {
        const baseFee = toNumber(s.fee); // ✅ always student's default fee

        const allocated = sum((f.PaymentAllocation || []).map((a) => toNumber(a.amount)));

        const netDue = Math.max(0, baseFee - allocated);

        return {
          row: {
            month: f.month,
            year: f.year,
            // keep FE contract: string value
            student_fee: String(netDue),
          },
          netDue,
        };
      });

      // exclude months fully covered
      const filtered = unpaidFeeRows.filter((x) => x.netDue > 0);

      const balance = sum(filtered.map((x) => x.netDue));
      if (balance <= 0) continue;

      const studentData = {
        id: s.id,
        fullname: s.fullname,
        className: s.classes?.name ?? "",
        unpaidFees: filtered.map((x) => x.row),
        balance, // number
      };

      const parentId = s.parentUserId!;
      if (families.has(parentId)) {
        const fam = families.get(parentId)!;
        fam.totalBalance += balance;
        fam.students.push(studentData);
      } else {
        const phones = joinPhones([s.parentUser?.phoneNumber, s.phone, s.phone2]);
        families.set(parentId, {
          familyName: s.familyName ?? s.parentUser?.fullName ?? "Unknown Family",
          phones: phones ? phones.split(", ") : [],
          totalBalance: balance,
          students: [studentData],
        });
      }
    }

    const result = Array.from(families.values())
      .filter((f) => f.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);

    return res.json({ families: result });
  } catch (e) {
    console.error("Error fetching unpaid families:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};




export const applyTwoDollarRelief = async (req: Request, res: Response) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    // @ts-ignore
    const user = req.user as { useId?: number; userId?: number; id?: number; role?: string };
    if (!["ADMIN", "USER"].includes(user?.role || "")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Resolve and verify auth user id to avoid FK violation
    const authUserId = Number(user.useId ?? user.userId ?? user.id);
    if (!Number.isFinite(authUserId)) {
      return res.status(401).json({ message: "Invalid auth user id in token." });
    }
    const authUserExists = await prisma.user.findUnique({
      where: { id: authUserId },
      select: { id: true },
    });
    if (!authUserExists) {
      return res.status(401).json({
        message: "Authenticated user not found. Please log in again.",
      });
    }

    const RELIEF_REASON = "RELIEF_$2";

    const results = await prisma.$transaction(async (tx) => {
      // Prefilter to likely-due fees (isPaid=false) for performance
      const fees = await tx.studentFee.findMany({
        where: {
          month,
          year,
          isPaid: false,
          student: { isdeleted: false, status: "ACTIVE" },
        },
        include: {
          student: { select: { id: true, fullname: true, fee: true } },
          PaymentAllocation: { select: { amount: true } },
        },
      });

      let processed = 0;
      const items: Array<{
        studentId: number;
        studentName: string;
        month: number;
        year: number;
        dueBefore: number;
        reliefApplied: number;
        feeId: number;
        paymentId?: number;
        alreadyApplied?: boolean;
        nowPaid?: boolean;
      }> = [];

      for (const fee of fees) {
        const monthlyFee = Number(fee.student.fee || 0);
        const alreadyAllocated = fee.PaymentAllocation.reduce(
          (s, a) => s + Number(a.amount),
          0
        );
        const due = Math.max(0, monthlyFee - alreadyAllocated);

        // Only apply to students WITH outstanding balance
        if (due <= 0) {
          // (Optional: you can skip logging these entirely)
          continue;
        }

        // Idempotency: skip if already applied for this fee/month/year
        const priorRelief = await tx.discountLog.findFirst({
          where: {
            studentId: fee.student.id,
            studentFeeId: fee.id,
            month,
            year,
            reason: RELIEF_REASON,
          },
          select: { id: true },
        });
        if (priorRelief) {
          items.push({
            studentId: fee.student.id,
            studentName: fee.student.fullname,
            month,
            year,
            dueBefore: due,
            reliefApplied: 0,
            feeId: fee.id,
            alreadyApplied: true,
          });
          continue;
        }

        const relief = Math.min(2, due);
        const reliefRounded = Number(relief.toFixed(2));

        // Create a $0 payment with discount == relief
        const payment = await tx.payment.create({
          data: {
            studentId: fee.student.id,
            userId: authUserId,
            amountPaid: 0,
            discount: reliefRounded,
            Description: "Automatic $2 relief",
          },
        });

        // Allocate the discount to this StudentFee
        await tx.paymentAllocation.create({
          data: {
            studentId: fee.student.id,
            studentFeeId: fee.id,
            paymentId: payment.id,
            amount: reliefRounded,
          },
        });

        // Log the discount (idempotency anchor)
        await tx.discountLog.create({
          data: {
            studentId: fee.student.id,
            studentFeeId: fee.id,
            amount: reliefRounded,
            reason: RELIEF_REASON,
            month,
            year,
            approvedBy: authUserId,
            verified: true,
            verifiedAt: new Date(),
            verifiedBy: "system-relief",
          },
        });

        // Mark paid if fully covered now
        const newDue = due - reliefRounded;
        let nowPaid = false;
        if (newDue <= 0) {
          await tx.studentFee.update({
            where: { id: fee.id },
            data: { isPaid: true },
          });
          nowPaid = true;
        }

        processed++;
        items.push({
          studentId: fee.student.id,
          studentName: fee.student.fullname,
          month,
          year,
          dueBefore: due,
          reliefApplied: reliefRounded,
          feeId: fee.id,
          paymentId: payment.id,
          nowPaid,
        });
      }

      return { processed, items, totalFeesChecked: fees.length };
    });

    res.status(200).json({
      message: `Applied $2 relief (only to fees with outstanding balance) for ${month}/${year}.`,
      summary: {
        totalFeesChecked: results.totalFeesChecked,
        processed: results.processed,
        skippedAlreadyApplied: results.items.filter(i => i.alreadyApplied).length,
        totalReliefApplied: results.items.reduce((s, i) => s + (i.reliefApplied || 0), 0),
        newlyPaidCount: results.items.filter(i => i.nowPaid).length,
      },
      details: results.items,
    });
  } catch (error) {
    console.error("Error applying $2 relief:", error);
    res.status(500).json({
      message: "Internal server error while applying relief",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};


/**
 * POST /api/payments/check-number-history
 * Body options:
 * {
 *   "number": "63xxxxxxx",
 *   "methods": ["ZAAD","E-DAHAB"],   // optional, defaults to both
 *   "month": 8,                      // optional
 *   "year": 2025,                    // optional
 *   "dateStart": "2025-08-01",       // optional (YYYY-MM-DD)
 *   "dateEnd": "2025-08-31"          // optional (YYYY-MM-DD)
 * }
 */
export const checkPaymentHistoryByNumber = async (req: Request, res: Response) => {
  try {
    const { number, methods, month, year, dateStart, dateEnd } = req.body as {
      number?: string;
      methods?: string[];
      month?: number | string;
      year?: number | string;
      dateStart?: string;
      dateEnd?: string;
    };

    if (!number || !String(number).trim()) {
      return res.status(400).json({ message: "number is required" });
    }

    // Default methods
    const methodList = Array.isArray(methods) && methods.length > 0
      ? methods
      : ["ZAAD", "E-DAHAB"];

    const normalizedNumber = String(number).trim();
    const formattedDescriptions = methodList.map((m) => `${m} - ${normalizedNumber}`);

    // Build date filter
    let dateFilter: { gte: Date; lte: Date } | undefined;

    if (dateStart && dateEnd) {
      // explicit date range
      dateFilter = {
        gte: new Date(dateStart),
        lte: new Date(new Date(dateEnd).setHours(23, 59, 59, 999)),
      };
    } else if (month && year) {
      const m = Number(month);
      const y = Number(year);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      dateFilter = { gte: start, lte: end };
    } else if (year) {
      const y = Number(year);
      const start = new Date(y, 0, 1);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      dateFilter = { gte: start, lte: end };
    }

    // Query DB
    const payments = await prisma.payment.findMany({
      where: {
        Description: { in: formattedDescriptions },
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        user: { select: { fullName: true } },
        allocations: {
          include: {
            studentFee: true,
            Student: {
              include: {
                classes: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // Build flat rows
    const rows = payments.flatMap((p) => {
      const [method = "", num = ""] = String(p.Description).split(" - ");
      return p.allocations.map((alloc) => ({
        student: alloc.Student?.fullname ?? "Unknown",
        class: alloc.Student?.classes?.name ?? "N/A",
        amount: Number(alloc.amount),
        month: alloc.studentFee?.month ?? null,
        year: alloc.studentFee?.year ?? null,
        date: p.date,
        user: p.user?.fullName ?? "Unknown",
        method,
        number: num,
        paymentId: p.id,
      }));
    });

    // Totals
    const totalAmountThisMonth = rows.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Effective dateStart/dateEnd in response
    const effectiveDateStart = dateFilter
      ? dateFilter.gte
      : (payments.length ? new Date(Math.min(...payments.map(p => p.date.getTime()))) : null);

    const effectiveDateEnd = dateFilter
      ? dateFilter.lte
      : (payments.length ? new Date(Math.max(...payments.map(p => p.date.getTime()))) : null);

    // Grouped payments
    const grouped = payments.map((p) => {
      const [method = "", num = ""] = String(p.Description).split(" - ");
      return {
        paymentId: p.id,
        description: p.Description,
        method,
        number: num,
        createdAt: p.date,
        user: p.user?.fullName ?? "Unknown",
        paidFor: p.allocations.map((alloc) => ({
          student: alloc.Student?.fullname ?? "Unknown",
          class: alloc.Student?.classes?.name ?? "N/A",
          month: alloc.studentFee?.month ?? null,
          year: alloc.studentFee?.year ?? null,
          amount: Number(alloc.amount),
        })),
      };
    });

    // Empty state
    if (payments.length === 0) {
      return res.status(200).json({
        usedCount: 0,
        totalAllocations: 0,
        totalAmountThisMonth: 0,
        dateStart: effectiveDateStart,
        dateEnd: effectiveDateEnd,
        message: `Number ${normalizedNumber} has not been used in this period.`,
        rows: [],
        payments: [],
      });
    }

    // Success
    return res.status(200).json({
      usedCount: payments.length,
      totalAllocations: rows.length,
      totalAmountThisMonth,
      dateStart: effectiveDateStart,
      dateEnd: effectiveDateEnd,
      message: `Number ${normalizedNumber} was used ${payments.length} time(s).`,
      rows,
      payments: grouped,
    });
  } catch (error) {
    console.error("checkPaymentHistoryByNumber error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};



/**
 * GET /student-fees/sep-2025/19-29
 * Lists StudentFee rows in Sep-2025 whose student_fee is 19 or 29.
 */
export const getSep2025Fees19or29 = async (req: Request, res: Response) => {
  try {
    const month = 9;
    const year = 2025;

    const rows = await prisma.studentFee.findMany({
      where: {
        month,
        year,
        student_fee: {
          in: [new Prisma.Decimal(19), new Prisma.Decimal(29)],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            fullname: true,
            classId: true,
            phone: true,
            bus: true,
          },
        },
        User: { select: { id: true, fullName: true } },
      },
      orderBy: [{ studentId: 'asc' }],
    });

    const fee19 = rows.filter(r => r.student_fee?.equals(new Prisma.Decimal(19)));
    const fee29 = rows.filter(r => r.student_fee?.equals(new Prisma.Decimal(29)));

    return res.status(200).json({
      message: 'Student fees (Sep-2025) with amounts 19 or 29',
      month,
      year,
      counts: { fee19: fee19.length, fee29: fee29.length, total: rows.length },
      items: rows,
    });
  } catch (error: any) {
    console.error('getSep2025Fees19or29 error:', error);
    return res.status(500).json({ message: 'Server error', error: String(error?.message || error) });
  }
};

/**
 * POST /student-fees/sep-2025/adjust
 * Body: { dryRun?: boolean }
 * Adjusts 29 -> 27 and 19 -> 17 ONLY for Sep-2025.
 * Returns a preview if dryRun=true, otherwise applies changes in a transaction.
 */
export const adjustSep2025Fees_29to27_19to17 = async (req: Request, res: Response) => {
  const { dryRun } = req.body as { dryRun?: boolean };

  try {
    const month = 9;
    const year = 2025;

    // Fetch candidates
    const candidates = await prisma.studentFee.findMany({
      where: {
        month,
        year,
        student_fee: {
          in: [new Prisma.Decimal(19), new Prisma.Decimal(29)],
        },
      },
      select: {
        id: true,
        studentId: true,
        month: true,
        year: true,
        student_fee: true,
      },
      orderBy: [{ studentId: 'asc' }],
    });

    // Build the plan (what will change)
    const plan = candidates.map(c => {
      const before = c.student_fee!;
      let after: Prisma.Decimal | null = null;

      if (before.equals(new Prisma.Decimal(29))) after = new Prisma.Decimal(27);
      if (before.equals(new Prisma.Decimal(19))) after = new Prisma.Decimal(17);

      return {
        id: c.id,
        studentId: c.studentId,
        month: c.month,
        year: c.year,
        before: before.toString(),
        after: after ? after.toString() : null,
      };
    }).filter(x => x.after !== null);

    if (dryRun) {
      return res.status(200).json({
        message: 'DRY RUN: Would adjust fees for Sep-2025',
        month,
        year,
        plannedUpdates: plan.length,
        items: plan.slice(0, 200), // preview first 200
      });
    }

    // Apply updates in a transaction (idempotent if run multiple times)
    const updates = plan.map(p =>
      prisma.studentFee.update({
        where: { id: p.id },
        data: { student_fee: new Prisma.Decimal(p.after!) },
      })
    );

    await prisma.$transaction(updates);

    return res.status(200).json({
      message: 'Adjusted fees for Sep-2025 (29->27 and 19->17)',
      month,
      year,
      updatedCount: plan.length,
      sample: plan.slice(0, 50),
    });
  } catch (error: any) {
    console.error('adjustSep2025Fees error:', error);
    return res.status(500).json({ message: 'Server error', error: String(error?.message || error) });
  }
};



