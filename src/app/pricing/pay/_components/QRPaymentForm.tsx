"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import Image from "next/image";
import {
    CheckCircle2,
    Clock,
    Copy,
    QrCode,
    XCircle,
    Zap,
} from "lucide-react";

interface ExistingRequest {
    _id: string;
    status: "pending" | "approved" | "rejected";
    transactionId: string;
    rejectionReason?: string;
}

interface Props {
    userId: string;
    userEmail: string;
    existingRequest: ExistingRequest | null;
}

const UPI_ID = "arekardinesh685@oksbi";
const AMOUNT = 40;

export default function QRPaymentForm({ existingRequest }: Props) {
    const submitRequest = useMutation(api.payments.submitPaymentRequest);

    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [retryAllowed, setRetryAllowed] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            setError("Please enter your transaction ID / UTR number.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await submitRequest({ transactionId: transactionId.trim(), amount: AMOUNT });
            setSubmitted(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Already submitted (from server) ──────────────────────────────────────
    if (existingRequest && !submitted && !retryAllowed) {
        if (existingRequest.status === "pending") {
            return <StatusCard status="pending" txId={existingRequest.transactionId} />;
        }
        if (existingRequest.status === "approved") {
            return <StatusCard status="approved" txId={existingRequest.transactionId} />;
        }
        if (existingRequest.status === "rejected") {
            return (
                <StatusCard
                    status="rejected"
                    txId={existingRequest.transactionId}
                    reason={existingRequest.rejectionReason}
                    onRetry={() => {
                        setRetryAllowed(true);
                        setTransactionId("");
                        setError("");
                    }}
                />
            );
        }
    }

    // ── Just submitted (client-side) ─────────────────────────────────────────
    if (submitted) {
        return <StatusCard status="pending" txId={transactionId} />;
    }

    // ── Payment form ──────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto">
            {/* Title */}
            <div className="text-center mb-10">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 ring-1 ring-gray-800/60 mb-4">
                    <QrCode className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-semibold text-white mb-2">
                    Complete Your Payment
                </h1>
                <p className="text-gray-400">
                    Scan the QR code and pay ₹{AMOUNT} — then submit your transaction ID
                    below.
                </p>
            </div>

            <div className="relative bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-gray-800/60 overflow-hidden">
                {/* Top glow line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                <div className="p-8 md:p-10 grid md:grid-cols-2 gap-10 items-start">
                    {/* ── Left: QR Code ── */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`/upi-qr.png?v=${Date.now()}`}
                                alt="UPI QR Code"
                                width={220}
                                height={220}
                                className="rounded-lg"
                            />
                        </div>

                        {/* Amount badge */}
                        <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold text-lg">
                            ₹{AMOUNT} <span className="text-sm font-normal text-blue-400/70">one-time</span>
                        </div>

                        {/* UPI ID */}
                        <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0a0a0f] border border-gray-800/60">
                            <span className="text-gray-300 text-sm font-mono truncate">{UPI_ID}</span>
                            <button
                                onClick={() => handleCopy(UPI_ID)}
                                className="text-gray-500 hover:text-blue-400 transition-colors shrink-0"
                                title="Copy UPI ID"
                            >
                                {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Right: Steps + Form ── */}
                    <div className="flex flex-col gap-6">
                        {/* Steps */}
                        <ol className="space-y-3">
                            {[
                                "Open any UPI app (PhonePe, GPay, Paytm…)",
                                `Scan the QR code or search for "${UPI_ID}"`,
                                `Pay exactly ₹${AMOUNT}`,
                                "Copy the Transaction ID / UTR number",
                                "Paste it below and click Submit",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Transaction ID / UTR Number
                                </label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. 427634821993"
                                    className="w-full bg-[#0a0a0f] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                                {error && (
                                    <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4" /> {error}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-white font-medium
                  bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Submit for Verification
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-500">
                                Your Pro access will be activated within 24 hours after payment verification.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Bottom glow line */}
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            </div>
        </div>
    );
}

// ── Status Card ──────────────────────────────────────────────────────────────
function StatusCard({
    status,
    txId,
    reason,
    onRetry,
}: {
    status: "pending" | "approved" | "rejected";
    txId: string;
    reason?: string;
    onRetry?: () => void;
}) {
    const configs = {
        pending: {
            icon: <Clock className="w-10 h-10 text-yellow-400" />,
            bg: "from-yellow-500/10 to-orange-500/10",
            ring: "ring-yellow-500/20",
            title: "Payment Under Review",
            desc: "We received your transaction ID. Our team will verify and activate your Pro access within 24 hours.",
            color: "text-yellow-400",
        },
        approved: {
            icon: <CheckCircle2 className="w-10 h-10 text-green-400" />,
            bg: "from-green-500/10 to-emerald-500/10",
            ring: "ring-green-500/20",
            title: "Payment Approved!",
            desc: "Your Pro access has been activated. Enjoy all the premium features of CodeCraft!",
            color: "text-green-400",
        },
        rejected: {
            icon: <XCircle className="w-10 h-10 text-red-400" />,
            bg: "from-red-500/10 to-pink-500/10",
            ring: "ring-red-500/20",
            title: "Payment Rejected",
            desc: reason || "Your payment could not be verified. Please contact support.",
            color: "text-red-400",
        },
    };

    const c = configs[status];

    return (
        <div className="max-w-md mx-auto text-center">
            <div className={`relative bg-gradient-to-br ${c.bg} rounded-2xl p-10 ring-1 ${c.ring}`}>
                <div className="flex justify-center mb-4">{c.icon}</div>
                <h2 className={`text-2xl font-semibold mb-3 ${c.color}`}>{c.title}</h2>
                <p className="text-gray-400 mb-4">{c.desc}</p>
                {txId && (
                    <div className="text-xs text-gray-500 bg-[#0a0a0f] rounded-lg px-3 py-2 font-mono break-all">
                        Txn ID: {txId}
                    </div>
                )}
                {status === "approved" && (
                    <a
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        <Zap className="w-4 h-4" /> Open Editor
                    </a>
                )}
                {status === "rejected" && onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:border-blue-500/50 hover:text-white transition-all text-sm font-medium"
                    >
                        ↩ Try Again with a new Transaction ID
                    </button>
                )}
            </div>
        </div>
    );
}
