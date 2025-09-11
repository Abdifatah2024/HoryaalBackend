import express from "express";
import {
  generateMonthlyFees,
  createStudentPayment,
  getStudentFees,
  getPaymentHistory,
  getStudentBalanceSummary,
  getAllocationsByPayment,
  getFeeInconsistencies,
  verifyDiscount,
  listDiscounts,
  getStudentsWithUnpaidFeesOrBalance,
  getMonthlyIncomeOverview,
  deleteStudentFeesByMonth,
  getAllGeneratedMonths,
  getStudentDepositStatus,
  getAllStudentAccountSummaries,
  getCombinedPayments,
  getTodayIncome,
  getStudentsWithUnpaidFeeMonthly,
  createMultiStudentPayment,
  getAllDiscountLogs,
  getAllPayments,
  updatePayment,
  getFamilyBalanceByPhone,
  payStudentMonth,
  payFullForMonthByPhone,
  checkIfPaymentNumberAlreadyUsed,
  checkLastPaymentByNumber,
  payFullForMonthByStudent,
  searchStudentsByNameOrId,
  getUserPaymentCollections,
  getAllPaymentsByStudentId,
  getStudentsWithBalancesAndDueMonths,
  addTwoDollarToStudentFees,
  addFiveDollarToNoBusStudents,
  getUnpaidFamiliesGroupedByParent,
  applyTwoDollarRelief,
  checkPaymentHistoryByNumber,
  getSep2025Fees19or29,
  adjustSep2025Fees_29to27_19to17,

} from "../controller/PaymentContorller";
import { authenticate } from "../middlewares/authaniticator";
import { getNegativeFeeStudents } from "../controller/paymentVoucher.controller";

const router = express.Router();

// Generate monthly fees for all studentss
router.get("/students/negative-fee", getNegativeFeeStudents);

router.get("/students/balance-summaries", getAllStudentAccountSummaries);
router.get("/students/search", searchStudentsByNameOrId);
router.post("/generate-monthly-fees", generateMonthlyFees);
router.get("/StudentWithBalance", getStudentsWithUnpaidFeesOrBalance);
// Get all fees for a student (by ID)
router.get("/students/:id", getStudentFees);
router.get("/discounts", getAllDiscountLogs);

// Create a payment for a student
router.post("/payment", authenticate, createStudentPayment);
router.post("/payment/multi", authenticate, createMultiStudentPayment);

router.get("/payment/:studentId/history", getPaymentHistory);
router.get("/students/:id/balance", getStudentBalanceSummary);
router.get("/Allocation/:id", getAllocationsByPayment);
router.get("/payments", getAllPayments);

// Route to update a specific payment by ID
router.put("/payments/:id", updatePayment);
router.get("/admin/fee-inconsistencies", getFeeInconsistencies);
router.post("/discounts/verify", verifyDiscount);
router.post("/discounts/list", listDiscounts);
router.get("/income-required", getMonthlyIncomeOverview);
router.delete("/delete-student-fees", deleteStudentFeesByMonth);
router.get("/months-generated", getAllGeneratedMonths);
router.get("/students/:id/deposit-status", getStudentDepositStatus);
router.get("/payments/combined", getCombinedPayments);
router.get("/income/today", getTodayIncome);
router.get("/Classfee/status", getStudentsWithUnpaidFeeMonthly);
router.get("/family/balance", getFamilyBalanceByPhone);
router.post("/pay/month", authenticate, payStudentMonth);
router.post("/pay-full-month", authenticate, payFullForMonthByPhone);
router.post("/check-payment-number", checkIfPaymentNumberAlreadyUsed);
router.post("/payment/check-last-used-number", checkLastPaymentByNumber);
router.post("/payment/student", authenticate, payFullForMonthByStudent);
router.get("/payments/collection-summary", getUserPaymentCollections);
router.post("/payments/by-student", getAllPaymentsByStudentId);
router.get("/GetStudent/Balance/Month", getStudentsWithBalancesAndDueMonths);
// In your Express router file
router.post("/student/update-fees", addTwoDollarToStudentFees);
// Add this to your Express router
router.post("/student/add-busless-fee", addFiveDollarToNoBusStudents);
router.get("/unpaid-families", getUnpaidFamiliesGroupedByParent);
router.post("/fees/relief", authenticate, applyTwoDollarRelief);
// Usage: POST /api/fees/relief?month=8&year=2025
router.post("/check-number-history", checkPaymentHistoryByNumber);
router.get('/student-fees/sep-2025/19-29', getSep2025Fees19or29);

router.post('/student-fees/sep-2025/adjust', adjustSep2025Fees_29to27_19to17);



export default router;
