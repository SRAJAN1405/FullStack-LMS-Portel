import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "./../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { Lecture } from "../models/lecture.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckOutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    //Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    //Create a stripe checkout session
    const baseUrl =process.meta.env.MODE==="development"?"http://localhost:8080/api/v1/purchase" :"/api/v1/purchse";  // Set your base URL here

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/course-progress/${courseId}`,  // Full URL
      cancel_url: `${baseUrl}/course-detail/${courseId}`,   // Full URL
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"], // Optionally restrict allowed countries
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      const updatedUser = await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );
      // console.log("Updated user:", updatedUser.enrolledCourses);

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const userId = req.id;
    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });
    // console.log(course, "course");

    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json({
      course,
      purchased: purchase ? true : false,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchaseCourse = async (req, res) => {
  //study this function
  try {
    const userId = req.id; // The creator's ID, assuming it's extracted from the authenticated user's request.

    // Fetch completed purchases where the course is created by the user
    const soldCourses = await CoursePurchase.find({ status: "completed" })
      .populate({
        path: "courseId",
        match: { creator: userId }, // Filter courses where the creator matches the user
        select: "courseTitle coursePrice creator", // Optional: select specific fields
      })
      .populate({
        path: "userId",
        select: "name email", // Optional: to get buyer details
      });

    // Filter out purchases where courseId is null (because of the match condition)
    const purchaseCourse = soldCourses.filter(
      (purchase) => purchase.courseId !== null
    );

    // If no courses are found
    if (!purchaseCourse) {
      return res.status(404).json({ purchasedCourse: [] });
    }

    return res.status(200).json({ purchaseCourse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
