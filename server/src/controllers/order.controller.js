import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { sendOrderStatusEmail } from "../services/email.service.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/query.js";

const calculateLineItems = (productsMap, requestedItems) =>
  requestedItems.map((item) => {
    const product = productsMap.get(item.product);

    if (!product) {
      throw new AppError(`Product ${item.product} was not found`, 404);
    }

    if (!product.isActive) {
      throw new AppError(`${product.name} is not available`, 409);
    }

    if (product.stock < item.qty) {
      throw new AppError(`Only ${product.stock} units left for ${product.name}`, 409);
    }

    return {
      product: product._id,
      qty: item.qty,
      price: product.discountPrice ?? product.price,
    };
  });

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  let createdOrderId;

  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productsMap = new Map(products.map((product) => [product._id.toString(), product]));
  const lineItems = calculateLineItems(productsMap, items);

  for (const item of lineItems) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
    );

    if (result.modifiedCount !== 1) {
      throw new AppError("Failed to reserve stock for the order", 409);
    }
  }

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const [createdOrder] = await Order.create([
    {
      user: req.user._id,
      items: lineItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
    },
  ]);

  createdOrderId = createdOrder._id;

  const order = await Order.findById(createdOrderId)
    .populate("items.product", "name slug images")
    .populate("user", "name email");

  return res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [orders, total] = await Promise.all([
    Order.find({})
      .populate("items.product", "name slug images")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({}),
  ]);

  return res.json({
    status: "success",
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .populate("items.product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  return res.json({
    status: "success",
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid order id", 400);
  }

  const order = await Order.findById(req.params.id)
    .populate("items.product", "name slug images")
    .populate("user", "name email");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (
    req.user.role !== "admin" &&
    order.user._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError("You can only view your own orders", 403);
  }

  return res.json({
    status: "success",
    data: {
      order,
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid order id", 400);
  }

  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  order.orderStatus = req.body.orderStatus || order.orderStatus;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  order.trackingId = req.body.trackingId || order.trackingId;

  await order.save();

  await sendOrderStatusEmail({
    to: order.user?.email,
    customerName: order.user?.name,
    orderId: order._id.toString(),
    orderStatus: order.orderStatus,
    trackingId: order.trackingId,
  });

  return res.json({
    status: "success",
    data: {
      order,
    },
  });
});
