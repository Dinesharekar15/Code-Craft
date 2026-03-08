"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import {
    CheckCircle2,
    Clock,
    KeyRound,
    ShieldCheck,
    Loader2,
    XCircle,
} from "lucide-react";

type PaymentStatus = "pending" | "approved" | "rejected";

interface PaymentRequest {
    _id: Id<"paymentRequests">;
    _creationTime: number;
    userId: string;
    userName: string;
    email: string;
    transactionId: string;
    amount: number;
    status: PaymentStatus;
    reviewedAt?: number;
    rejectionReason?: string;
}

export default function AdminPaymentsPage() {
    const [adminSecret, setAdminSecret] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | undefined>(
        "pending"
    );
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string>("");
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    const approvePayment = useMutation(api.payments.approvePayment);
    const rejectPayment = useMutation(api.payments.rejectPayment);
    const requests = useQuery(api.payments.getPaymentRequests, {
        status: filterStatus,
    }) as PaymentRequest[] | undefined;

    const statusColors: Record<PaymentStatus, string> = {
        pending: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20",
        approved: "text-green-400 bg-green-400/10 border-green-500/20",
        rejected: "text-red-400 bg-red-400/10 border-red-500/20",
    };

    const handleApprove = async (id: Id<"paymentRequests">) => {
        setActionLoading(id);
        setActionError("");
        try {
            await approvePayment({
                requestId: id,
                adminSecret,
            });
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : "Failed to approve");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: Id<"paymentRequests">) => {
        setActionLoading(id);
        setActionError("");
        try {
            await rejectPayment({
                requestId: id,
                adminSecret,
                reason: rejectReason || undefined,
            });
            setRejectingId(null);
            setRejectReason("");
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : "Failed to reject");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Header */}
            <div className="border-b border-gray-800/60 bg-[#0a0a0f]/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-gray-100">
                        Admin — Payment Requests
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Auth Section */}
                {!authenticated && (
                    <div className="max-w-sm mx-auto">
                        <div className="bg-[#12121a] border border-gray-800/60 rounded-2xl p-8 text-center">
                            <div className="inline-flex p-3 rounded-xl bg-blue-500/10 ring-1 ring-gray-800 mb-4">
                                <KeyRound className="w-7 h-7 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-semibold mb-1">Admin Access</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Enter the admin secret to proceed
                            </p>
                            <input
                                type="password"
                                placeholder="Admin secret…"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && adminSecret && setAuthenticated(true)
                                }
                                className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                            />
                            <button
                                onClick={() => setAuthenticated(true)}
                                disabled={!adminSecret}
                                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Dashboard */}
                {authenticated && (
                    <>
                        {/* Filter tabs */}
                        <div className="flex items-center gap-2 mb-8">
                            {(["pending", "approved", "rejected", undefined] as const).map(
                                (s) => (
                                    <button
                                        key={String(s)}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${filterStatus === s
                                                ? "bg-blue-600 border-blue-500 text-white"
                                                : "border-gray-800 text-gray-400 hover:border-gray-600"
                                            }`}
                                    >
                                        {s === undefined ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => {
                                    setAuthenticated(false);
                                    setAdminSecret("");
                                }}
                                className="ml-auto text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                                Log out
                            </button>
                        </div>

                        {actionError && (
                            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {actionError}
                            </div>
                        )}

                        {/* Table */}
                        {!requests ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No {filterStatus ?? ""} payment requests found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req) => (
                                    <div
                                        key={req._id}
                                        className="bg-[#12121a] border border-gray-800/60 rounded-xl p-6"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            {/* Left info */}
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-white">
                                                        {req.userName}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[req.status]
                                                            }`}
                                                    >
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400">{req.email}</div>
                                                <div className="text-xs text-gray-500 font-mono">
                                                    Txn ID:{" "}
                                                    <span className="text-gray-300">{req.transactionId}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Amount:{" "}
                                                    <span className="text-gray-300">₹{req.amount}</span>
                                                    {"  ·  "}Submitted:{" "}
                                                    <span className="text-gray-300">
                                                        {new Date(req._creationTime).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                                {req.rejectionReason && (
                                                    <div className="text-xs text-red-400">
                                                        Rejection reason: {req.rejectionReason}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {req.status === "pending" && (
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleApprove(req._id)}
                                                        disabled={actionLoading === req._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 text-sm font-medium transition-all disabled:opacity-40"
                                                    >
                                                        {actionLoading === req._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        )}
                                                        Approve
                                                    </button>

                                                    {rejectingId === req._id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Rejection reason (optional)"
                                                                value={rejectReason}
                                                                onChange={(e) => setRejectReason(e.target.value)}
                                                                className="text-xs bg-[#0a0a0f] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleReject(req._id)}
                                                                    disabled={actionLoading === req._id}
                                                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 text-xs font-medium hover:bg-red-600/30 disabled:opacity-40 transition-all"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setRejectingId(null);
                                                                        setRejectReason("");
                                                                    }}
                                                                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 text-xs hover:border-gray-600 transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setRejectingId(req._id)}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 text-sm font-medium transition-all"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {req.status !== "pending" && req.reviewedAt && (
                                                <div className="text-xs text-gray-500 shrink-0">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    Reviewed{" "}
                                                    {new Date(req.reviewedAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
