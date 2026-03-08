import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// User submits their UPI transaction ID after scanning the QR and paying
export const submitPaymentRequest = mutation({
    args: {
        transactionId: v.string(),
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new ConvexError("Not authenticated");

        // Check if user already has a pending request
        const existingPending = await ctx.db
            .query("paymentRequests")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        if (existingPending) {
            throw new ConvexError(
                "You already have a pending payment request. Please wait for admin approval."
            );
        }

        // Check if user is already Pro
        const user = await ctx.db
            .query("users")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field("userId"), identity.subject))
            .first();

        if (user?.isPro) {
            throw new ConvexError("You are already a Pro member!");
        }

        const requestId = await ctx.db.insert("paymentRequests", {
            userId: identity.subject,
            userName: identity.name ?? "Unknown",
            email: identity.email ?? "",
            transactionId: args.transactionId.trim(),
            amount: args.amount,
            status: "pending",
        });

        return { requestId };
    },
});

// Admin: get all payment requests (filtered by status)
export const getPaymentRequests = query({
    args: {
        status: v.optional(
            v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))
        ),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("paymentRequests")
                .withIndex("by_status")
                .filter((q) => q.eq(q.field("status"), args.status))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("paymentRequests").order("desc").collect();
    },
});

// Get a single user's payment request (for the user's own view)
export const getUserPaymentRequest = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        if (!args.userId) return null;
        return await ctx.db
            .query("paymentRequests")
            .withIndex("by_user_id")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .first();
    },
});

// Admin: approve a payment request → upgrades user to Pro
export const approvePayment = mutation({
    args: {
        requestId: v.id("paymentRequests"),
        adminSecret: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate admin secret
        const expectedSecret = process.env.ADMIN_SECRET;
        if (!expectedSecret || args.adminSecret !== expectedSecret) {
            throw new ConvexError("Unauthorized: invalid admin secret");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new ConvexError("Payment request not found");
        if (request.status !== "pending") {
            throw new ConvexError(
                `Request is already ${request.status}`
            );
        }

        // Update request status
        await ctx.db.patch(args.requestId, {
            status: "approved",
            reviewedAt: Date.now(),
        });

        // Upgrade the user to Pro
        await ctx.runMutation(api.users.upgradeToPro, {
            userId: request.userId,
            upiTransactionId: request.transactionId,
        });
    },
});

// Admin: reject a payment request
export const rejectPayment = mutation({
    args: {
        requestId: v.id("paymentRequests"),
        adminSecret: v.string(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const expectedSecret = process.env.ADMIN_SECRET;
        if (!expectedSecret || args.adminSecret !== expectedSecret) {
            throw new ConvexError("Unauthorized: invalid admin secret");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new ConvexError("Payment request not found");

        await ctx.db.patch(args.requestId, {
            status: "rejected",
            reviewedAt: Date.now(),
            rejectionReason: args.reason ?? "No reason provided",
        });
    },
});
